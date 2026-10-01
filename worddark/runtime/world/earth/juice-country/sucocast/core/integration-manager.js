/* WordDark — SucoCast Integration Manager
 * Coordena adaptadores externos; não contém credenciais nem chamadas de plataforma.
 */
class SucoCastIntegrationManager {
  constructor() {
    this.adapters = new Map();
  }

  register(adapter) {
    if (!adapter || !adapter.integrationId || typeof adapter.execute !== "function") {
      throw new Error("Adaptador de integração inválido.");
    }
    this.adapters.set(adapter.integrationId, adapter);
    return adapter;
  }

  get(integrationId) {
    return this.adapters.get(integrationId) || null;
  }

  list() {
    return Array.from(this.adapters.values()).map(function(adapter) {
      return {
        integrationId: adapter.integrationId,
        platform: adapter.platform,
        status: adapter.status || "READY"
      };
    });
  }

  execute(integrationId, operation, payload) {
    const adapter = this.get(integrationId);
    if (!adapter) throw new Error("Integração não registrada: " + integrationId);
    return adapter.execute(operation, payload);
  }
}

if (typeof window !== "undefined") window.SucoCastIntegrationManager = SucoCastIntegrationManager;
if (typeof module !== "undefined" && module.exports) module.exports = SucoCastIntegrationManager;
