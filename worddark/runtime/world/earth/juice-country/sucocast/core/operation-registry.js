/* WordDark — SucoCast Operation Registry */
class SucoCastOperationRegistry {
  constructor() {
    this.operations = new Map();
  }

  register(operation) {
    if (!operation || !operation.operationId || !operation.name) {
      throw new Error("Operação precisa de operationId e name.");
    }

    const registered = Object.assign({
      status: "REGISTERED",
      version: "1.0",
      compatibleIntegrations: []
    }, operation);

    if (!Array.isArray(registered.compatibleIntegrations)) {
      registered.compatibleIntegrations = [];
    }

    this.operations.set(operation.operationId, registered);
    return registered;
  }

  get(operationId) {
    return this.operations.get(operationId) || null;
  }

  list() {
    return Array.from(this.operations.values());
  }

  isCompatible(operationId, integrationId) {
    const operation = this.get(operationId);
    if (!operation) return false;
    if (operation.compatibleIntegrations.length === 0) return true;
    return operation.compatibleIntegrations.includes(integrationId);
  }

  listCompatibleIntegrations(operationId) {
    const operation = this.get(operationId);
    return operation ? operation.compatibleIntegrations.slice() : [];
  }
}

if (typeof window !== "undefined") window.SucoCastOperationRegistry = SucoCastOperationRegistry;
if (typeof module !== "undefined" && module.exports) module.exports = SucoCastOperationRegistry;
