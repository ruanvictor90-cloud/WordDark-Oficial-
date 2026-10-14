/**
 * WordDark Knowledge Intake Registry.
 * External knowledge stays proposed until an authenticated reviewer validates it.
 * This implementation is in-memory for TEST; production needs durable storage.
 */
const clean = value => String(value ?? "").trim();

export function createKnowledgeIntakeRegistry({
  authorizeReview = async () => ({ allowed: false }),
  audit = async () => { throw new Error("AUDIT_UNAVAILABLE"); },
  archiveValidated = async () => ({ success: false, status: "CENTRAL_ARCHIVE_UNAVAILABLE" }),
  enabled = false,
  now = () => new Date().toISOString()
} = {}) {
  const records = new Map();

  async function receivePending(input, context = {}) {
    if (!enabled) return { success: false, status: "KNOWLEDGE_REGISTRY_DISABLED" };
    const recordId = clean(input?.recordId);
    if (!recordId || input?.contract !== "worddark.knowledge-intake" || input?.version !== 1) {
      return { success: false, status: "KNOWLEDGE_INTAKE_RECORD_INVALID" };
    }
    if (records.has(recordId)) return { success: true, status: "DUPLICATE_SKIPPED", recordId };
    const knowledgeId = "WD-K-DNET-" + encodeURIComponent(recordId).slice(0, 100);
    const candidate = {
      knowledgeId,
      intakeRecordId: recordId,
      type: "LEARNING",
      title: clean(input.source?.title).slice(0, 300),
      summary: clean(input.content).slice(0, 1000),
      sourceId: clean(input.source?.url),
      sourceType: "DARKNET_EXTERNAL",
      status: "PROPOSED",
      version: "1.0.0",
      tags: Array.isArray(input.tags) ? [...input.tags] : [],
      evidence: [{ providerId: clean(input.providerId), sourceId: clean(input.source?.sourceId), url: clean(input.source?.url), rights: clean(input.rights), license: input.license || null }],
      createdAt: clean(input.receivedAt) || now(),
      validatedAt: null,
      metadata: {
        content: clean(input.content),
        contentType: clean(input.contentType || "text/plain"),
        language: clean(input.language || "und"),
        rights: clean(input.rights),
        provenance: input.provenance || {},
        sourceRetrievedAt: input.source?.retrievedAt || null,
        receivedBy: clean(context.actorId) || null
      }
    };
    if (!candidate.title || !candidate.summary || !candidate.sourceId) return { success: false, status: "KNOWLEDGE_CANDIDATE_INCOMPLETE" };
    records.set(recordId, candidate);
    return { success: true, status: "RECEIVED_PENDING_REVIEW", recordId, knowledgeId, promoted: false };
  }

  async function review(recordId, { decision, trustedContext = null, reason = "" } = {}) {
    if (!enabled) return { success: false, status: "KNOWLEDGE_REGISTRY_DISABLED" };
    const id = clean(recordId);
    const current = records.get(id);
    if (!current) return { success: false, status: "KNOWLEDGE_CANDIDATE_NOT_FOUND" };
    if (current.status !== "PROPOSED") return { success: false, status: "KNOWLEDGE_CANDIDATE_ALREADY_REVIEWED" };
    const reviewerId = clean(trustedContext?.actorId);
    if (trustedContext?.authenticated !== true || !reviewerId || !clean(trustedContext?.sessionId)) {
      return { success: false, status: "KNOWLEDGE_REVIEW_IDENTITY_REQUIRED" };
    }
    const normalizedDecision = clean(decision).toUpperCase();
    if (!["VALIDATE", "REJECT"].includes(normalizedDecision)) return { success: false, status: "KNOWLEDGE_REVIEW_DECISION_INVALID" };
    let permission;
    try { permission = await authorizeReview({ reviewerId, sessionId: trustedContext.sessionId, recordId: id, decision: normalizedDecision }); }
    catch { return { success: false, status: "KNOWLEDGE_REVIEW_AUTHORIZATION_UNAVAILABLE" }; }
    if (permission?.allowed !== true) return { success: false, status: "KNOWLEDGE_REVIEW_DENIED" };
    try {
      await audit({ event: "WORDDARK_KNOWLEDGE_REVIEW_AUTHORIZED", reviewerId, recordId: id, decision: normalizedDecision, reason: clean(reason).slice(0, 500) });
    } catch { return { success: false, status: "KNOWLEDGE_REVIEW_AUDIT_UNAVAILABLE" }; }

    if (normalizedDecision === "REJECT") {
      const rejected = { ...current, status: "REJECTED", metadata: { ...current.metadata, review: { reviewerId, reason: clean(reason).slice(0, 500), reviewedAt: now() } } };
      records.set(id, rejected);
      return { success: true, status: "KNOWLEDGE_REJECTED", recordId: id, promoted: false };
    }

    const validated = {
      ...current,
      status: "VALIDATED",
      validatedAt: now(),
      metadata: { ...current.metadata, review: { reviewerId, reason: clean(reason).slice(0, 500), approvalId: permission.approvalId || null, reviewedAt: now() } }
    };
    try {
      const archived = await archiveValidated({ ...validated, metadata: { ...validated.metadata } });
      if (archived?.success === false) return { success: false, status: archived.status || "KNOWLEDGE_ARCHIVE_FAILED" };
    } catch { return { success: false, status: "KNOWLEDGE_ARCHIVE_FAILED" }; }
    records.set(id, validated);
    return { success: true, status: "KNOWLEDGE_VALIDATED_AND_ARCHIVED", recordId: id, knowledgeId: validated.knowledgeId, promoted: true };
  }

  function searchValidated(query = "", limit = 10) {
    const terms = clean(query).toLocaleLowerCase("pt-BR").split(/\s+/).filter(Boolean);
    const max = Math.min(Math.max(Number(limit) || 10, 1), 100);
    return [...records.values()]
      .filter(record => record.status === "VALIDATED")
      .filter(record => !terms.length || terms.every(term =>
        [record.title, record.summary, record.metadata?.content, ...(record.tags || [])].join(" ").toLocaleLowerCase("pt-BR").includes(term)))
      .slice(0, max)
      .map(record => ({ ...record, tags: [...record.tags], evidence: [...record.evidence], metadata: { ...record.metadata } }));
  }

  return Object.freeze({
    receivePending,
    review,
    listPending: () => [...records.values()].filter(record => record.status === "PROPOSED").map(record => ({ ...record })),
    searchValidated,
    getStatus: () => ({ enabled: enabled === true, pending: [...records.values()].filter(record => record.status === "PROPOSED").length, validated: [...records.values()].filter(record => record.status === "VALIDATED").length, rejected: [...records.values()].filter(record => record.status === "REJECTED").length, persistence: "in-memory-test-only" })
  });
}
