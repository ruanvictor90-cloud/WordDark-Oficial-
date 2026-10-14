/**
 * Adapts reviewed Darknet candidates to WordDark's canonical validated knowledge archive.
 * The caller injects the canonical record constructor and central store; no second library is created.
 */
export function createCentralKnowledgeArchiver({ createKnowledgeRecord = null, centralKnowledgeStore = null } = {}) {
  if (typeof createKnowledgeRecord !== "function") throw new Error("CANONICAL_KNOWLEDGE_CONSTRUCTOR_REQUIRED");
  if (!centralKnowledgeStore || typeof centralKnowledgeStore.archive !== "function") throw new Error("CENTRAL_KNOWLEDGE_STORE_REQUIRED");

  async function archiveValidated(candidate = {}) {
    if (candidate.status !== "VALIDATED" || !candidate.validatedAt) {
      return { success: false, status: "KNOWLEDGE_VALIDATION_REQUIRED" };
    }
    const record = createKnowledgeRecord({
      knowledgeId: candidate.knowledgeId,
      type: "LEARNING",
      title: candidate.title,
      summary: candidate.summary,
      sourceId: candidate.sourceId,
      sourceType: candidate.sourceType || "DARKNET_EXTERNAL",
      status: "VALIDATED",
      version: candidate.version || "1.0.0",
      tags: Array.isArray(candidate.tags) ? [...candidate.tags] : [],
      evidence: Array.isArray(candidate.evidence) ? [...candidate.evidence] : [],
      createdAt: candidate.createdAt,
      validatedAt: candidate.validatedAt,
      metadata: { ...(candidate.metadata || {}) }
    });
    try {
      const archived = await centralKnowledgeStore.archive(record, { reason: "DARKNET_KNOWLEDGE_VALIDATED" });
      return { success: true, status: "KNOWLEDGE_ARCHIVED", recordId: archived?.recordId || null, knowledgeId: candidate.knowledgeId };
    } catch {
      return { success: false, status: "CENTRAL_KNOWLEDGE_ARCHIVE_FAILED" };
    }
  }
  return Object.freeze({ archiveValidated });
}
