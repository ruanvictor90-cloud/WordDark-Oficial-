/**
 * Production-oriented registry over an atomic durable repository.
 * This is intentionally not enabled by default and has no bundled database credentials.
 */
const clean = value => String(value ?? "").trim();
const RIGHTS = new Set(["PUBLIC", "LICENSED", "USER_PROVIDED"]);

export function createDurableKnowledgeIntakeRegistry({
  repository = null,
  authorizeReview = async () => ({ allowed: false }),
  audit = async () => { throw new Error("AUDIT_UNAVAILABLE"); },
  archiveValidated = async () => ({ success: false, status: "CENTRAL_ARCHIVE_UNAVAILABLE" }),
  enabled = false,
  now = () => new Date().toISOString()
} = {}) {
  if (enabled === true && (!repository || repository.durable !== true || repository.atomic !== true)) {
    throw new Error("DURABLE_ATOMIC_KNOWLEDGE_REPOSITORY_REQUIRED");
  }
  const validRepository = repository && repository.durable === true && repository.atomic === true;

  async function receivePending(input, context = {}) {
    if (!enabled) return { success: false, status: "KNOWLEDGE_REGISTRY_DISABLED" };
    const id = clean(input?.recordId);
    const rights = clean(input?.rights).toUpperCase();
    const license = clean(input?.license);
    const actorId = clean(context?.actorId);
    if (!validRepository) return { success: false, status: "DURABLE_KNOWLEDGE_REPOSITORY_UNAVAILABLE" };
    if (!id || input?.contract !== "worddark.knowledge-intake" || input?.version !== 1 ||
        !/^https:\/\//i.test(clean(input?.source?.url)) || !clean(input?.source?.title) ||
        !clean(input?.content) || clean(input.content).length > 20000 ||
        !RIGHTS.has(rights) || (rights === "LICENSED" && !license) || !actorId) {
      return { success: false, status: "KNOWLEDGE_INTAKE_RECORD_INVALID" };
    }
    const knowledgeId = "WD-K-DNET-" + encodeURIComponent(id).slice(0, 100);
    const candidate = {
      knowledgeId, intakeRecordId: id, type: "LEARNING",
      title: clean(input.source.title).slice(0, 300),
      summary: clean(input.content).slice(0, 1000),
      sourceId: clean(input.source.url), sourceType: "DARKNET_EXTERNAL",
      status: "PROPOSED", version: "1.0.0",
      tags: Array.isArray(input.tags) ? [...new Set(input.tags.map(clean).filter(Boolean))].slice(0, 20) : [],
      evidence: [{ providerId: clean(input.providerId), sourceId: clean(input.source.sourceId), url: clean(input.source.url), rights, license: license || null }],
      createdAt: clean(input.receivedAt) || now(), validatedAt: null,
      metadata: { content: clean(input.content), contentType: clean(input.contentType || "text/plain").slice(0, 80), language: clean(input.language || "und").slice(0, 20), rights, provenance: input.provenance || {}, sourceRetrievedAt: input.source.retrievedAt || null, receivedBy: actorId, intakeApprovalId: clean(context.approvalId) || null }
    };
    try {
      const result = await repository.insertIfAbsent(id, candidate);
      return result.inserted
        ? { success: true, status: "RECEIVED_PENDING_REVIEW", recordId: id, knowledgeId, promoted: false }
        : { success: true, status: "DUPLICATE_SKIPPED", recordId: id, promoted: false };
    } catch { return { success: false, status: "DURABLE_KNOWLEDGE_WRITE_FAILED" }; }
  }

  async function review(recordId, { decision, trustedContext = null, reason = "" } = {}) {
    if (!enabled) return { success: false, status: "KNOWLEDGE_REGISTRY_DISABLED" };
    const id = clean(recordId);
    const reviewerId = clean(trustedContext?.actorId);
    if (trustedContext?.authenticated !== true || !reviewerId || !clean(trustedContext?.sessionId)) return { success: false, status: "KNOWLEDGE_REVIEW_IDENTITY_REQUIRED" };
    const normalizedDecision = clean(decision).toUpperCase();
    if (!["VALIDATE", "REJECT"].includes(normalizedDecision)) return { success: false, status: "KNOWLEDGE_REVIEW_DECISION_INVALID" };
    let current;
    try { current = await repository.get(id); } catch { return { success: false, status: "DURABLE_KNOWLEDGE_READ_FAILED" }; }
    if (!current) return { success: false, status: "KNOWLEDGE_CANDIDATE_NOT_FOUND" };
    if (current.status !== "PROPOSED") return { success: false, status: "KNOWLEDGE_CANDIDATE_ALREADY_REVIEWED" };
    let permission;
    try { permission = await authorizeReview({ reviewerId, sessionId: trustedContext.sessionId, recordId: id, decision: normalizedDecision }); }
    catch { return { success: false, status: "KNOWLEDGE_REVIEW_AUTHORIZATION_UNAVAILABLE" }; }
    if (permission?.allowed !== true || (normalizedDecision === "VALIDATE" && !clean(permission.approvalId))) return { success: false, status: "KNOWLEDGE_REVIEW_DENIED" };
    try { await audit({ event: "WORDDARK_KNOWLEDGE_REVIEW_AUTHORIZED", reviewerId, recordId: id, decision: normalizedDecision, approvalId: clean(permission.approvalId) || null, reason: clean(reason).slice(0, 500) }); }
    catch { return { success: false, status: "KNOWLEDGE_REVIEW_AUDIT_UNAVAILABLE" }; }

    const claimed = { ...current, status: "REVIEWING", metadata: { ...current.metadata, reviewClaim: { reviewerId, claimedAt: now(), decision: normalizedDecision } } };
    try {
      if (!(await repository.compareAndSet(id, "PROPOSED", claimed))) return { success: false, status: "KNOWLEDGE_REVIEW_CONFLICT" };
    } catch { return { success: false, status: "DURABLE_KNOWLEDGE_CLAIM_FAILED" }; }

    if (normalizedDecision === "REJECT") {
      const rejected = { ...claimed, status: "REJECTED", metadata: { ...claimed.metadata, review: { reviewerId, reason: clean(reason).slice(0, 500), reviewedAt: now() } } };
      try {
        if (!(await repository.compareAndSet(id, "REVIEWING", rejected))) return { success: false, status: "KNOWLEDGE_REVIEW_FINALIZE_CONFLICT" };
        await audit({ event: "WORDDARK_KNOWLEDGE_REJECTED", reviewerId, recordId: id });
        return { success: true, status: "KNOWLEDGE_REJECTED", recordId: id, promoted: false };
      } catch { return { success: false, status: "KNOWLEDGE_REVIEW_FINALIZE_FAILED" }; }
    }

    const validated = { ...claimed, status: "VALIDATED", validatedAt: now(), metadata: { ...claimed.metadata, review: { reviewerId, reason: clean(reason).slice(0, 500), approvalId: permission.approvalId, reviewedAt: now() } } };
    let archived;
    try { archived = await archiveValidated(validated); }
    catch { archived = { success: false, status: "KNOWLEDGE_ARCHIVE_FAILED" }; }
    if (archived?.success !== true) {
      try { await repository.compareAndSet(id, "REVIEWING", { ...current, status: "PROPOSED" }); } catch {}
      return { success: false, status: archived?.status || "KNOWLEDGE_ARCHIVE_FAILED" };
    }
    try {
      if (!(await repository.compareAndSet(id, "REVIEWING", validated))) return { success: false, status: "KNOWLEDGE_REVIEW_FINALIZE_CONFLICT", archiveMayAlreadyExist: true };
      await audit({ event: "WORDDARK_KNOWLEDGE_VALIDATED_AND_ARCHIVED", reviewerId, recordId: id, knowledgeId: validated.knowledgeId });
      return { success: true, status: "KNOWLEDGE_VALIDATED_AND_ARCHIVED", recordId: id, knowledgeId: validated.knowledgeId, promoted: true };
    } catch { return { success: false, status: "KNOWLEDGE_REVIEW_FINALIZE_FAILED", archiveMayAlreadyExist: true }; }
  }

  async function listPending(limit = 100) {
    if (!enabled) return [];
    return repository.listByStatus("PROPOSED", { limit: Math.min(Math.max(Number(limit) || 100, 1), 500) });
  }
  async function searchValidated(query = "", limit = 10) {
    if (!enabled) return [];
    return repository.searchValidated(clean(query), { limit: Math.min(Math.max(Number(limit) || 10, 1), 100) });
  }
  async function getStatus() {
    if (!enabled) return { enabled: false, persistence: validRepository ? "durable-atomic" : "unavailable" };
    const [pending, reviewing, validated, rejected] = await Promise.all(["PROPOSED", "REVIEWING", "VALIDATED", "REJECTED"].map(status => repository.countByStatus(status)));
    return { enabled: true, persistence: "durable-atomic", pending, reviewing, validated, rejected, recoveryRequired: reviewing > 0 };
  }

  return Object.freeze({ receivePending, review, listPending, searchValidated, getStatus });
}
