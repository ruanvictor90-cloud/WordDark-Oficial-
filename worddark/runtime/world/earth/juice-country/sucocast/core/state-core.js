/* WordDark — SucoCast State Core
 * Núcleo reutilizável do Estado.
 * Não depende de YouTube, Instagram ou outra plataforma.
 */
class SucoCastCore {
  constructor(config) {
    const options = config || {};
    this.identity = options.identity;
    this.version = options.version || "SC-CORE-0.1";
    this.status = options.status || "ONLINE";
    this.configuration = options.configuration || {};
    this.operations = new Map();
    this.integrations = new Map();
    this.records = [];
  }

  registerOperation(operation) {
    if (!operation || !operation.operationId) {
      throw new Error("Operação inválida.");
    }
    this.operations.set(operation.operationId, operation);
    return operation;
  }

  getOperation(operationId) {
    return this.operations.get(operationId) || null;
  }

  listOperations() {
    return Array.from(this.operations.values());
  }

  registerIntegration(adapter) {
    if (!adapter || !adapter.integrationId) {
      throw new Error("Integração inválida.");
    }
    this.integrations.set(adapter.integrationId, adapter);
    return adapter;
  }

  getIntegration(integrationId) {
    return this.integrations.get(integrationId) || null;
  }

  listIntegrations() {
    return Array.from(this.integrations.values()).map(function(adapter) {
      return {
        integrationId: adapter.integrationId,
        platform: adapter.platform,
        status: adapter.status || "READY"
      };
    });
  }

  record(event) {
    const entry = Object.assign({
      recordedAt: new Date().toISOString()
    }, event || {});
    this.records.push(entry);
    return entry;
  }

  listRecords() {
    return this.records.slice();
  }

  getStatus() {
    return {
      identityId: this.identity ? this.identity.identityId : null,
      name: this.identity ? this.identity.name : null,
      version: this.version,
      status: this.status,
      operationCount: this.operations.size,
      integrationCount: this.integrations.size,
      recordCount: this.records.length
    };
  }
}

if (typeof window !== "undefined") window.SucoCastCore = SucoCastCore;
if (typeof module !== "undefined" && module.exports) module.exports = SucoCastCore;
