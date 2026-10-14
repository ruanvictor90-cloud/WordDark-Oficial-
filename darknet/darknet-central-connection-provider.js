/**
 * Adapts the WordDark Central de Conexões gateway to Darknet's provider contract.
 * Credentials stay inside the gateway; Darknet receives only normalized source records.
 */
const clean = value => String(value ?? "").trim();

export function createCentralConnectionKnowledgeProvider({
  gateway = null,
  providerId,
  accountId,
  capability,
  action = "KNOWLEDGE_SEARCH",
  operationIdFactory = () => "DNET-RESEARCH-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase()
} = {}) {
  const provider = clean(providerId).toUpperCase();
  const account = clean(accountId);
  const grant = clean(capability);
  const operationAction = clean(action).toUpperCase();
  if (!provider || !account || !grant) throw new Error("providerId, accountId e capability concedida são obrigatórios.");
  if (!gateway || typeof gateway.execute !== "function") throw new Error("Central de Conexões indisponível.");

  return Object.freeze({
    id: provider.toLowerCase(),
    async search({ query, limit = 10 } = {}) {
      const searchQuery = clean(query);
      if (!searchQuery || searchQuery.length > 1000) throw new Error("Consulta de conhecimento inválida.");
      const requestId = clean(operationIdFactory());
      if (!requestId) throw new Error("requestId de pesquisa não gerado.");
      const response = await gateway.execute({
        requestId,
        operationId: requestId,
        providerId: provider,
        accountId: account,
        capability: grant,
        action: operationAction,
        payload: { query: searchQuery, limit: Math.min(Math.max(Number(limit) || 10, 1), 25) }
      });
      if (response?.success !== true) {
        const error = new Error(response?.status || "KNOWLEDGE_PROVIDER_REQUEST_FAILED");
        error.code = response?.status || "KNOWLEDGE_PROVIDER_REQUEST_FAILED";
        throw error;
      }
      const body = response.result;
      const rows = Array.isArray(body) ? body : Array.isArray(body?.results) ? body.results : Array.isArray(body?.items) ? body.items : null;
      if (!rows) throw new Error("KNOWLEDGE_PROVIDER_RESPONSE_INVALID");
      return rows.slice(0, 25);
    },
    getStatus: () => ({ providerId: provider, gatewayConnected: true, credentialsExposed: false, networkAccess: "delegated-to-central-connection-gateway" })
  });
}
