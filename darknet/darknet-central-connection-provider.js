/**
 * Adapts WordDark Central de Conexões to Darknet's search/fetch provider contract.
 * Credentials stay inside the gateway; Darknet receives normalized source records only.
 */
const clean = value => String(value ?? "").trim();

export function createCentralConnectionKnowledgeProvider({
  gateway = null,
  providerId,
  accountId,
  capability,
  action = "SEARCH_KNOWLEDGE",
  fetchAction = "FETCH_KNOWLEDGE",
  operationIdFactory = () => "DNET-RESEARCH-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase()
} = {}) {
  const provider = clean(providerId).toUpperCase();
  const account = clean(accountId);
  const grant = clean(capability);
  const searchAction = clean(action).toUpperCase();
  const retrieveAction = clean(fetchAction).toUpperCase();
  if (!provider || !account || !grant) throw new Error("providerId, accountId e capability concedida são obrigatórios.");
  if (!gateway || typeof gateway.execute !== "function") throw new Error("Central de Conexões indisponível.");

  async function execute(operation, payload) {
    const requestId = clean(operationIdFactory());
    if (!requestId) throw new Error("requestId de pesquisa não gerado.");
    const response = await gateway.execute({
      requestId,
      operationId: requestId,
      providerId: provider,
      accountId: account,
      capability: grant,
      action: operation,
      payload
    });
    if (response?.success !== true) {
      const error = new Error(response?.status || "KNOWLEDGE_PROVIDER_REQUEST_FAILED");
      error.code = response?.status || "KNOWLEDGE_PROVIDER_REQUEST_FAILED";
      throw error;
    }
    // The Central Gateway wraps the provider adapter's response in response.result.
    // The adapter itself also returns { success, status, result }, so unwrap both layers.
    const adapterEnvelope = response.result;
    if (adapterEnvelope?.success === false) {
      const error = new Error(adapterEnvelope.status || "KNOWLEDGE_PROVIDER_REQUEST_FAILED");
      error.code = adapterEnvelope.status || "KNOWLEDGE_PROVIDER_REQUEST_FAILED";
      throw error;
    }
    return adapterEnvelope && Object.prototype.hasOwnProperty.call(adapterEnvelope, "result")
      ? adapterEnvelope.result
      : adapterEnvelope;
  }

  return Object.freeze({
    id: provider.toLowerCase(),
    async search({ query, limit = 10 } = {}) {
      const searchQuery = clean(query);
      if (!searchQuery || searchQuery.length > 1000) throw new Error("Consulta de conhecimento inválida.");
      const body = await execute(searchAction, { query: searchQuery, limit: Math.min(Math.max(Number(limit) || 10, 1), 25) });
      const rows = Array.isArray(body) ? body : Array.isArray(body?.results) ? body.results : Array.isArray(body?.items) ? body.items : null;
      if (!rows) throw new Error("KNOWLEDGE_PROVIDER_RESPONSE_INVALID");
      return rows.slice(0, 25);
    },
    async fetch({ sourceId, url } = {}) {
      const id = clean(sourceId);
      const sourceUrl = clean(url);
      if (!id && !/^https:\/\//i.test(sourceUrl)) throw new Error("KNOWLEDGE_SOURCE_REQUIRED");
      const body = await execute(retrieveAction, { sourceId: id || null, url: sourceUrl || null });
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("KNOWLEDGE_PROVIDER_RESPONSE_INVALID");
      return body;
    },
    getStatus: () => ({ providerId: provider, gatewayConnected: true, credentialsExposed: false, networkAccess: "delegated-to-central-connection-gateway" })
  });
}
