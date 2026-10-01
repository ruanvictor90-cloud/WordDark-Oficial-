/* WordDark — SucoCast Public Connection Manager
 * Orquestra o estado dos conectores sem guardar credenciais.
 */
class SucoCastConnectionManager {
  constructor() {
    this.adapters = new Map();
    this.audit = [];
  }

  register(adapter) {
    if (!adapter || !adapter.integrationId) {
      throw new Error("Adaptador inválido.");
    }
    this.adapters.set(adapter.integrationId, adapter);
    this.audit.push({
      type: "INTEGRATION_REGISTERED",
      integrationId: adapter.integrationId,
      timestamp: new Date().toISOString()
    });
    return adapter;
  }

  get(integrationId) {
    return this.adapters.get(integrationId) || null;
  }

  list() {
    return Array.from(this.adapters.values()).map((adapter) =>
      typeof adapter.getStatus === "function"
        ? adapter.getStatus()
        : { integrationId: adapter.integrationId, status: adapter.status || "UNKNOWN" }
    );
  }

  connect(integrationId, context = {}) {
    const adapter = this.get(integrationId);
    if (!adapter) return {success:false,status:"NOT_FOUND",integrationId};

    const result = adapter.connect(context);
    this.audit.push({
      type: "INTEGRATION_CONNECT_ATTEMPT",
      integrationId,
      result,
      timestamp: new Date().toISOString()
    });
    return result;
  }

  publish(integrationId, payload = {}) {
    const adapter = this.get(integrationId);
    if (!adapter) return {success:false,status:"NOT_FOUND",integrationId};

    if (typeof adapter.supports === "function" && !adapter.supports("publish")) {
      return {success:false,status:"UNSUPPORTED",integrationId,reason:"Adaptador não suporta publicação."};
    }

    const result = typeof adapter.publish === "function"
      ? adapter.publish(payload)
      : adapter.execute("publish", payload);

    this.audit.push({
      type: "PUBLICATION_ATTEMPT",
      integrationId,
      result,
      timestamp: new Date().toISOString()
    });
    return result;
  }

  getAudit() {
    return [...this.audit];
  }
}

if (typeof window !== "undefined") window.SucoCastConnectionManager = SucoCastConnectionManager;
if (typeof module !== "undefined" && module.exports) module.exports = SucoCastConnectionManager;
