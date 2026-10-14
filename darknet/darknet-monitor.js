/**
 * Darknet Monitor v0.1.
 * Read-only health snapshots over supplied module interfaces; no polling or side effects.
 */
const readStatus = (module, name) => {
  if (!module || typeof module.getStatus !== "function") {
    return { module: name, available: false, status: "unavailable" };
  }
  try {
    const status = module.getStatus();
    return { module: name, available: true, status: status && typeof status === "object" ? { ...status } : {} };
  } catch (error) {
    return { module: name, available: false, status: "error", error: String(error?.message || error) };
  }
};

export function createDarknetMonitor({ connections, plugins, security, gateway } = {}) {
  return Object.freeze({
    snapshot() {
      const modules = [
        readStatus(connections, "connections"),
        readStatus(plugins, "plugins"),
        readStatus(security, "security"),
        readStatus(gateway, "apiGateway")
      ];
      const allAvailable = modules.every(item => item.available);
      return Object.freeze({
        version: "0.1.0",
        generatedAt: new Date().toISOString(),
        overall: allAvailable ? "operational-isolated" : "partial",
        mode: "read-only",
        transportEnabled: false,
        networkAccess: false,
        worldRuntimeAccess: false,
        modules: Object.freeze(modules.map(item => Object.freeze(item)))
      });
    },
    getStatus() {
      return { version: "0.1.0", mode: "read-only", pollingEnabled: false, actionsEnabled: false };
    }
  });
}
