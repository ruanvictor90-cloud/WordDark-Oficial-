/* WordDark Core — governed knowledge intake from independent Darknet.
 * No HTTP route, provider credentials, or persistence is created here. Disabled by default.
 */
const clean = value => String(value ?? "").trim();
const RIGHTS = new Set(["PUBLIC", "LICENSED", "USER_PROVIDED"]);
const deny = status => ({ success: false, status, promoted: false });

export function createDarknetKnowledgeAdapter({
  knowledgeRegistry = null,
  authorizeRequest = async () => ({ allowed: false }),
  audit = async () => { throw new Error("AUDIT_UNAVAILABLE"); },
  enabled = false
} = {}) {
  async function receive(record = {}, trustedContext = null) {
    if (!enabled) return deny("WORDDARK_KNOWLEDGE_INTAKE_DISABLED");
    const actorId = clean(trustedContext?.actorId);
    if (trustedContext?.authenticated !== true || !actorId || !clean(trustedContext?.sessionId)) {
      return deny("WORDDARK_TRUSTED_IDENTITY_REQUIRED");
    }
    if (record?.contract !== "worddark.knowledge-intake" || record?.version !== 1 ||
        !clean(record.recordId) || !clean(record.providerId) ||
        !clean(record.source?.sourceId) || !/^https:\/\//i.test(clean(record.source?.url)) ||
        !clean(record.source?.title) || !clean(record.content) ||
        record.content.length > 20000 || !RIGHTS.has(clean(record.rights).toUpperCase()) ||
        record.status !== "RECEIVED_PENDING_REVIEW" || record.promotedToKnowledge !== false) {
      return deny("WORDDARK_KNOWLEDGE_RECORD_INVALID");
    }
    let decision;
    try {
      decision = await authorizeRequest({ actorId, sessionId: trustedContext.sessionId, action: "KNOWLEDGE_INGEST", providerId: record.providerId, recordId: record.recordId });
    } catch { return deny("WORDDARK_KNOWLEDGE_AUTHORIZATION_UNAVAILABLE"); }
    if (decision?.allowed !== true) return deny("WORDDARK_KNOWLEDGE_REQUEST_DENIED");
    if (!knowledgeRegistry || typeof knowledgeRegistry.receivePending !== "function") {
      return deny("WORDDARK_KNOWLEDGE_REGISTRY_UNAVAILABLE");
    }
    try {
      await audit({ event: "WORDDARK_KNOWLEDGE_INTAKE_ACCEPTED", actorId, recordId: record.recordId, providerId: record.providerId, rights: record.rights, approvalId: decision.approvalId || null });
    } catch { return deny("WORDDARK_KNOWLEDGE_AUDIT_UNAVAILABLE"); }
    try {
      const result = await knowledgeRegistry.receivePending(structuredClone(record), { actorId, approvalId: decision.approvalId || null });
      if (result?.success !== true) return deny(result?.status || "WORDDARK_KNOWLEDGE_STORE_FAILED");
      return { success: true, status: "RECEIVED_PENDING_REVIEW", recordId: record.recordId, promoted: false };
    } catch { return deny("WORDDARK_KNOWLEDGE_STORE_FAILED"); }
  }
  return Object.freeze({
    receive,
    getStatus: () => ({ enabled: enabled === true, httpRoute: false, externalNetwork: false, automaticPromotion: false })
  });
}
