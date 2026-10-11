const TERMINAL = new Set(["REJECTED", "CANCELLED", "CONSUMED"]);
export class WordDarkApprovalCenter {
  constructor({ clock = () => new Date().toISOString(), idFactory = null, preventSelfApproval = true } = {}) {
    this.clock = clock; this.idFactory = idFactory || (() => "APR-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase());
    this.preventSelfApproval = preventSelfApproval; this.requests = new Map(); this.audit = [];
  }
  request(source = {}) {
    const required = ["operationId", "requesterId", "sectorId", "action", "environment", "reason"];
    const missing = required.filter(field => typeof source[field] !== "string" || !source[field].trim());
    if (missing.length) return { success: false, reason: "APPROVAL_FIELDS_REQUIRED", fields: missing };
    if (this.preventSelfApproval && source.requesterId === source.proposedApproverId && source.proposedApproverId) return { success: false, reason: "REQUESTER_CANNOT_BE_SOLE_APPROVER" };
    const approvalId = source.approvalId || this.idFactory();
    if (this.requests.has(approvalId)) return { success: false, reason: "APPROVAL_ID_ALREADY_EXISTS", approvalId };
    const record = { approvalId, operationId: source.operationId, requesterId: source.requesterId, sectorId: source.sectorId,
      action: source.action, environment: source.environment, scope: source.scope || "*", reason: source.reason, risk: source.risk || "UNASSESSED",
      status: "PENDING", createdAt: this.clock(), decidedAt: null, decidedBy: null, decisionReason: null, consumedAt: null };
    this.requests.set(approvalId, record); this.#audit("APPROVAL_REQUESTED", record, source.requesterId);
    return { success: true, approval: structuredClone(record) };
  }
  decide(approvalId, { decision, actorId, reason = "" } = {}) {
    const record = this.requests.get(approvalId);
    if (!record) return { success: false, reason: "APPROVAL_NOT_FOUND" };
    if (record.status !== "PENDING") return { success: false, reason: "APPROVAL_NOT_PENDING", status: record.status };
    if (!actorId || typeof actorId !== "string") return { success: false, reason: "DECISION_ACTOR_REQUIRED" };
    if (this.preventSelfApproval && actorId === record.requesterId) return { success: false, reason: "SELF_APPROVAL_BLOCKED" };
    if (!["APPROVE", "REJECT"].includes(decision)) return { success: false, reason: "INVALID_DECISION" };
    record.status = decision === "APPROVE" ? "APPROVED" : "REJECTED"; record.decidedAt = this.clock(); record.decidedBy = actorId; record.decisionReason = reason || null;
    this.#audit(decision === "APPROVE" ? "APPROVAL_APPROVED" : "APPROVAL_REJECTED", record, actorId);
    return { success: true, approval: structuredClone(record) };
  }
  consume(approvalId, expected = {}) {
    const record = this.requests.get(approvalId);
    if (!record) return { success: false, reason: "APPROVAL_NOT_FOUND" };
    if (record.status !== "APPROVED") return { success: false, reason: "APPROVAL_NOT_APPROVED", status: record.status };
    for (const field of ["operationId", "action", "environment"]) if (expected[field] && record[field] !== expected[field]) return { success: false, reason: "APPROVAL_CONTEXT_MISMATCH", field };
    if (expected.scope && record.scope !== "*" && record.scope !== expected.scope) return { success: false, reason: "APPROVAL_SCOPE_MISMATCH" };
    record.status = "CONSUMED"; record.consumedAt = this.clock();
    this.#audit("APPROVAL_CONSUMED", record, expected.consumerId || "worddark-kernel");
    return { success: true, approval: structuredClone(record) };
  }
  cancel(approvalId, { actorId, reason = "" } = {}) {
    const record = this.requests.get(approvalId);
    if (!record) return { success: false, reason: "APPROVAL_NOT_FOUND" };
    if (TERMINAL.has(record.status)) return { success: false, reason: "APPROVAL_TERMINAL", status: record.status };
    if (!actorId) return { success: false, reason: "DECISION_ACTOR_REQUIRED" };
    record.status = "CANCELLED"; record.decidedAt = this.clock(); record.decidedBy = actorId; record.decisionReason = reason || null;
    this.#audit("APPROVAL_CANCELLED", record, actorId); return { success: true, approval: structuredClone(record) };
  }
  get(approvalId) { const record = this.requests.get(approvalId); return record ? structuredClone(record) : null; }
  list({ status = null, sectorId = null } = {}) {
    return [...this.requests.values()].filter(record => (!status || record.status === status) && (!sectorId || record.sectorId === sectorId)).map(record => structuredClone(record));
  }
  snapshot() {
    const all = [...this.requests.values()];
    return { total: all.length, pending: all.filter(r => r.status === "PENDING").length, approved: all.filter(r => r.status === "APPROVED").length,
      rejected: all.filter(r => r.status === "REJECTED").length, consumed: all.filter(r => r.status === "CONSUMED").length };
  }
  auditTrail() { return this.audit.map(event => structuredClone(event)); }
  #audit(type, record, actorId) { this.audit.push({ eventId: "AUD-" + (this.audit.length + 1), type, approvalId: record.approvalId, operationId: record.operationId, actorId, occurredAt: this.clock(), status: record.status }); }
}
