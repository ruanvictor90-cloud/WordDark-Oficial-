/**
 * Darknet Plugin Manager v0.1.
 * Metadata and permission review only. Plugins are never loaded or executed.
 */
const clean = value => String(value ?? "").trim();
const validId = value => /^[a-z0-9][a-z0-9._-]{1,79}$/i.test(clean(value));
const FORBIDDEN_CAPABILITIES = new Set(["network", "filesystem-write", "process-exec", "world-runtime", "message-dispatch", "browser-control"]);

export function createPluginManager({ now = () => new Date().toISOString() } = {}) {
  const plugins = new Map();
  const audit = [];
  let sequence = 0;
  function record(event) {
    const entry = Object.freeze({
      auditId: "DNET-PLUGIN-AUDIT-" + (++sequence).toString().padStart(5, "0"),
      timestamp: clean(now()) || new Date().toISOString(),
      ...event
    });
    audit.push(entry);
    return entry;
  }
  function normalize(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Descritor de plugin inválido.");
    const id = clean(input.id);
    const name = clean(input.name);
    const version = clean(input.version);
    if (!validId(id)) throw new Error("ID de plugin inválido.");
    if (!name || !version) throw new Error("Nome e versão são obrigatórios.");
    const capabilities = [...new Set((Array.isArray(input.capabilities) ? input.capabilities : []).map(clean).filter(Boolean))];
    return Object.freeze({
      id, name, version,
      description: clean(input.description),
      capabilities: Object.freeze(capabilities),
      status: "disabled",
      execution: "not-loaded",
      permissions: Object.freeze({ approved: false, grantedCapabilities: Object.freeze([]) })
    });
  }
  return Object.freeze({
    register(input) {
      const item = normalize(input);
      if (plugins.has(item.id)) throw new Error("Plugin duplicado: " + item.id);
      plugins.set(item.id, item);
      record({ action: "plugin.registered", plugin: item.id, outcome: "metadata-only" });
      return this.get(item.id);
    },
    get(id) {
      const item = plugins.get(clean(id));
      return item ? { ...item, capabilities: [...item.capabilities], permissions: { approved: false, grantedCapabilities: [] } } : null;
    },
    list() { return [...plugins.keys()].map(id => this.get(id)); },
    reviewPermissions({ id, requestedCapabilities = [], explicitlyApproved = false } = {}) {
      const plugin = plugins.get(clean(id));
      const requested = [...new Set((Array.isArray(requestedCapabilities) ? requestedCapabilities : []).map(clean).filter(Boolean))];
      let allowed = false;
      let reason = "Plugin não cadastrado.";
      if (plugin) {
        const undeclared = requested.filter(capability => !plugin.capabilities.includes(capability));
        const forbidden = requested.filter(capability => FORBIDDEN_CAPABILITIES.has(capability));
        if (undeclared.length) reason = "Permissão não declarada pelo plugin: " + undeclared.join(", ");
        else if (forbidden.length) reason = "Capacidade bloqueada nesta versão: " + forbidden.join(", ");
        else if (!explicitlyApproved) reason = "A revisão exige aprovação explícita.";
        else reason = "Revisão registrada; concessão e execução continuam desativadas.";
      }
      const entry = record({
        action: "plugin.permission-review",
        plugin: clean(id) || null,
        requestedCapabilities: requested,
        explicitlyApproved: explicitlyApproved === true,
        allowed: false,
        outcome: "review-only",
        reason
      });
      return { allowed, approved: false, grantedCapabilities: [], reason, auditId: entry.auditId, executionStarted: false };
    },
    enable() { throw new Error("Ativação de plugins indisponível nesta versão."); },
    execute() { throw new Error("Execução de plugins indisponível nesta versão."); },
    getAuditLog() { return audit.map(entry => ({ ...entry, requestedCapabilities: entry.requestedCapabilities ? [...entry.requestedCapabilities] : undefined })); },
    getStatus() {
      return { version: "0.1.0", pluginCount: plugins.size, auditCount: audit.length, enabledPlugins: 0, loadedPlugins: 0, executionEnabled: false };
    }
  });
}
