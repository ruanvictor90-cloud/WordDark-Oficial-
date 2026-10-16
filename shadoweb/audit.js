const KEY = "shadoweb.audit.v1";
const ALLOWED = new Set(["gateway.request", "gateway.denied", "gateway.success", "gateway.error", "plugin.imported", "plugin.enabled", "plugin.disabled", "knowledge.saved", "knowledge.deleted", "settings.changed", "connector.enabled", "connector.disabled", "permission.granted", "permission.revoked"]);
const redact = value => String(value ?? "").replace(/(token|secret|password|authorization|api[_-]?key)\s*[:=]\s*[^\s,;]+/ig, "$1=[REDACTED]").slice(0, 240);
export class AuditLog {
  constructor(storage = localStorage) { this.storage = storage; }
  list() { try { const rows = JSON.parse(this.storage.getItem(KEY) || "[]"); return Array.isArray(rows) ? rows.slice(0, 300) : []; } catch { return []; } }
  record(event, detail = {}) {
    if (!ALLOWED.has(event)) throw new Error("Evento de auditoria não permitido.");
    const row = { id: crypto.randomUUID(), at: new Date().toISOString(), event, detail: Object.fromEntries(Object.entries(detail).slice(0, 8).map(([k,v]) => [String(k).slice(0,40), redact(typeof v === "object" ? JSON.stringify(v) : v)])) };
    try { this.storage.setItem(KEY, JSON.stringify([row, ...this.list()].slice(0, 300))); } catch { /* Auditoria local pode falhar por falta de espaço. */ }
    return row;
  }
  clear() { this.storage.removeItem(KEY); }
}
