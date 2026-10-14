/**
 * Darknet Knowledge Pipeline v0.1.
 * Acquires information only through injected provider adapters and hands it to WordDark
 * through an injected, governed knowledge port. No provider/network is called by default.
 */
const clean = value => String(value ?? "").trim();
const RIGHTS = new Set(["PUBLIC", "LICENSED", "USER_PROVIDED"]);
const MAX_CONTENT_CHARS = 20000;
const MAX_RESULTS = 25;

function normalizeRecord(raw, providerId, now) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { error: "INVALID_SOURCE_RECORD" };
  const sourceId = clean(raw.sourceId || raw.id);
  const url = clean(raw.url);
  const title = clean(raw.title).slice(0, 300);
  const content = clean(raw.content || raw.text || raw.snippet);
  const rights = clean(raw.rights).toUpperCase();
  if (!sourceId || !title || !content) return { error: "SOURCE_FIELDS_REQUIRED" };
  if (!/^https:\/\//i.test(url)) return { error: "HTTPS_SOURCE_REQUIRED" };
  if (!RIGHTS.has(rights)) return { error: "RIGHTS_DECLARATION_REQUIRED" };
  if (content.length > MAX_CONTENT_CHARS) return { error: "CONTENT_TOO_LARGE" };
  return {
    record: {
      contract: "worddark.knowledge-intake",
      version: 1,
      recordId: "DNET-KNOW-" + encodeURIComponent(providerId + ":" + sourceId).slice(0, 120),
      providerId,
      source: { sourceId, url, title, retrievedAt: clean(raw.retrievedAt) || now() },
      content,
      contentType: clean(raw.contentType || "text/plain").slice(0, 80),
      rights,
      license: clean(raw.license).slice(0, 300) || null,
      language: clean(raw.language || "und").slice(0, 20),
      tags: Array.isArray(raw.tags) ? [...new Set(raw.tags.map(clean).filter(Boolean))].slice(0, 20) : [],
      provenance: { acquisition: "DARKNET_PROVIDER_ADAPTER", providerId },
      status: "RECEIVED_PENDING_REVIEW",
      promotedToKnowledge: false,
      receivedAt: now()
    }
  };
}

export function createDarknetKnowledgePipeline({
  providers = [],
  knowledgePort = null,
  authorize = async () => ({ allowed: false }),
  audit = async () => { throw new Error("AUDIT_UNAVAILABLE"); },
  enabled = false,
  now = () => new Date().toISOString()
} = {}) {
  const registry = new Map();
  const seen = new Set();
  for (const provider of providers) {
    const id = clean(provider?.id).toLowerCase();
    if (!/^[a-z0-9][a-z0-9._-]{1,79}$/.test(id) || typeof provider?.search !== "function") {
      throw new Error("Provedor de conhecimento inválido: informe id e search().");
    }
    if (registry.has(id)) throw new Error("Provedor duplicado: " + id);
    registry.set(id, Object.freeze({ id, search: provider.search }));
  }

  async function learn({ providerId, query, principal, trustedContext = null, limit = 10 } = {}) {
    const providerKey = clean(providerId).toLowerCase();
    const searchQuery = clean(query);
    const caller = clean(trustedContext?.actorId || principal);
    if (trustedContext?.authenticated !== true || !clean(trustedContext?.actorId) || !clean(trustedContext?.sessionId)) {
      return { success: false, status: "KNOWLEDGE_TRUSTED_IDENTITY_REQUIRED", received: 0, rejected: 0 };
    }
    if (!providerKey || !searchQuery || searchQuery.length > 1000) {
      return { success: false, status: "KNOWLEDGE_REQUEST_INVALID", received: 0, rejected: 0 };
    }
    if (!enabled) return { success: false, status: "DARKNET_KNOWLEDGE_PIPELINE_DISABLED", received: 0, rejected: 0 };
    const provider = registry.get(providerKey);
    if (!provider) return { success: false, status: "KNOWLEDGE_PROVIDER_UNAVAILABLE", received: 0, rejected: 0 };
    if (!knowledgePort || typeof knowledgePort.receive !== "function") {
      return { success: false, status: "WORDDARK_KNOWLEDGE_PORT_UNAVAILABLE", received: 0, rejected: 0 };
    }
    let decision;
    try { decision = await authorize({ principal: caller, providerId: providerKey, query: searchQuery, action: "KNOWLEDGE_INGEST" }); }
    catch { return { success: false, status: "KNOWLEDGE_AUTHORIZATION_UNAVAILABLE", received: 0, rejected: 0 }; }
    if (decision?.allowed !== true) return { success: false, status: "KNOWLEDGE_REQUEST_DENIED", received: 0, rejected: 0 };
    try {
      await audit({ event: "DARKNET_KNOWLEDGE_SEARCH_AUTHORIZED", principal: caller || null, providerId: providerKey, query: searchQuery, approvalId: decision.approvalId || null });
    } catch { return { success: false, status: "KNOWLEDGE_AUDIT_UNAVAILABLE", received: 0, rejected: 0 }; }

    let rows;
    try {
      rows = await provider.search({ query: searchQuery, limit: Math.min(Math.max(Number(limit) || 10, 1), MAX_RESULTS) });
    } catch {
      try { await audit({ event: "DARKNET_KNOWLEDGE_PROVIDER_FAILED", providerId: providerKey }); } catch {}
      return { success: false, status: "KNOWLEDGE_PROVIDER_FAILED", received: 0, rejected: 0 };
    }
    if (!Array.isArray(rows)) return { success: false, status: "KNOWLEDGE_PROVIDER_INVALID_RESPONSE", received: 0, rejected: 0 };

    let received = 0, rejected = 0, duplicates = 0;
    const outcomes = [];
    for (const raw of rows.slice(0, Math.min(Math.max(Number(limit) || 10, 1), MAX_RESULTS))) {
      const normalized = normalizeRecord(raw, providerKey, now);
      if (normalized.error) { rejected++; outcomes.push({ status: normalized.error }); continue; }
      const item = normalized.record;
      if (seen.has(item.recordId)) { duplicates++; outcomes.push({ recordId: item.recordId, status: "DUPLICATE_SKIPPED" }); continue; }
      try {
        const result = await knowledgePort.receive(item, trustedContext);
        if (result?.success !== true) { rejected++; outcomes.push({ recordId: item.recordId, status: result?.status || "WORLD_REJECTED" }); continue; }
        seen.add(item.recordId);
        received++;
        outcomes.push({ recordId: item.recordId, status: result.status || "RECEIVED_PENDING_REVIEW" });
      } catch {
        rejected++;
        outcomes.push({ recordId: item.recordId, status: "WORLD_RECEIVE_FAILED" });
      }
    }
    try { await audit({ event: "DARKNET_KNOWLEDGE_INGEST_FINISHED", principal: caller || null, providerId: providerKey, received, rejected, duplicates }); }
    catch { return { success: false, status: "KNOWLEDGE_FINAL_AUDIT_UNAVAILABLE", received, rejected, duplicates, outcomes }; }
    return { success: rejected === 0, status: received ? "KNOWLEDGE_RECEIVED_PENDING_REVIEW" : duplicates ? "KNOWLEDGE_NO_NEW_RECORDS" : "KNOWLEDGE_NOT_RECEIVED", received, rejected, duplicates, outcomes };
  }

  return Object.freeze({
    learn,
    listProviders: () => [...registry.keys()],
    getStatus: () => ({ enabled: enabled === true, providerCount: registry.size, providerIds: [...registry.keys()], transport: "injected-adapters-only", automaticPromotion: false, networkAccess: false })
  });
}
