/**
 * Provider-specific API facade for knowledge search behind WordDark Central de Conexões.
 * This adapter performs no network request by itself; injected provider handlers own transport.
 */
const clean = value => String(value ?? "").trim();
const MAX_RESULTS = 25;
const RIGHTS = new Set(["PUBLIC", "LICENSED", "USER_PROVIDED"]);

function normalizeSource(row = {}, now = () => new Date().toISOString()) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const source = {
    sourceId: clean(row.sourceId || row.id),
    url: clean(row.url || row.canonicalUrl),
    title: clean(row.title || row.name),
    content: clean(row.content || row.text || row.snippet || row.description),
    rights: clean(row.rights).toUpperCase(),
    license: clean(row.license) || null,
    language: clean(row.language) || "und",
    tags: Array.isArray(row.tags) ? row.tags.map(clean).filter(Boolean).slice(0, 20) : [],
    retrievedAt: clean(row.retrievedAt) || now()
  };
  return source;
}

export function createKnowledgeSearchAdapter({
  providerId,
  search = null,
  fetchSource = null,
  now = () => new Date().toISOString()
} = {}) {
  const id = clean(providerId).toUpperCase();
  if (!id) throw new Error("KNOWLEDGE_PROVIDER_ID_REQUIRED");
  if (typeof search !== "function") throw new Error("KNOWLEDGE_SEARCH_HANDLER_REQUIRED");

  async function execute(request = {}, context = {}) {
    if (clean(request.providerId).toUpperCase() !== id) return { success: false, status: "KNOWLEDGE_PROVIDER_MISMATCH" };
    if (request.capability !== "KNOWLEDGE_RESEARCH") return { success: false, status: "KNOWLEDGE_CAPABILITY_REQUIRED" };
    if (request.action === "SEARCH_KNOWLEDGE") {
      const query = clean(request.payload?.query);
      if (!query || query.length > 1000) return { success: false, status: "KNOWLEDGE_QUERY_INVALID" };
      const limit = Math.min(Math.max(Number(request.payload?.limit) || 10, 1), MAX_RESULTS);
      let response;
      try { response = await search({ query, limit, account: context.account || null, credential: context.credential ?? null, requestId: request.requestId }); }
      catch { return { success: false, status: "KNOWLEDGE_PROVIDER_SEARCH_FAILED" }; }
      const rows = Array.isArray(response) ? response : Array.isArray(response?.results) ? response.results : Array.isArray(response?.items) ? response.items : null;
      if (!rows) return { success: false, status: "KNOWLEDGE_PROVIDER_RESPONSE_INVALID" };
      return {
        success: true,
        status: "KNOWLEDGE_SEARCH_COMPLETED",
        result: { results: rows.slice(0, limit).map(row => normalizeSource(row, now)).filter(Boolean) }
      };
    }
    if (request.action === "FETCH_KNOWLEDGE") {
      if (typeof fetchSource !== "function") return { success: false, status: "KNOWLEDGE_FETCH_NOT_SUPPORTED" };
      const sourceId = clean(request.payload?.sourceId);
      const url = clean(request.payload?.url);
      if (!sourceId && !/^https:\/\//i.test(url)) return { success: false, status: "KNOWLEDGE_SOURCE_REQUIRED" };
      let response;
      try { response = await fetchSource({ sourceId: sourceId || null, url: url || null, account: context.account || null, credential: context.credential ?? null, requestId: request.requestId }); }
      catch { return { success: false, status: "KNOWLEDGE_PROVIDER_FETCH_FAILED" }; }
      const row = normalizeSource(response, now);
      if (!row) return { success: false, status: "KNOWLEDGE_PROVIDER_RESPONSE_INVALID" };
      if (!row.sourceId || !/^https:\/\//i.test(row.url) || !row.title || !row.content || !RIGHTS.has(row.rights) || (row.rights === "LICENSED" && !row.license)) {
        return { success: false, status: "KNOWLEDGE_SOURCE_METADATA_INVALID" };
      }
      return { success: true, status: "KNOWLEDGE_FETCH_COMPLETED", result: row };
    }
    return { success: false, status: "KNOWLEDGE_ACTION_UNSUPPORTED" };
  }

  return Object.freeze({ execute, getStatus: () => ({ providerId: id, capability: "KNOWLEDGE_RESEARCH", transport: "injected-provider-handler", credentialsExposed: false }) });
}

export function registerKnowledgeSearchAdapter({ gateway, providerId, search, fetchSource, now } = {}) {
  if (!gateway || typeof gateway.registerAdapter !== "function") throw new Error("CENTRAL_CONNECTION_GATEWAY_REQUIRED");
  const adapter = createKnowledgeSearchAdapter({ providerId, search, fetchSource, now });
  return gateway.registerAdapter(providerId, adapter);
}
