/**
 * Darknet Security Policy v0.1.
 * Pure decision helper: default-deny and audit; it never enables or invokes transports.
 */
const clean = value => String(value ?? "").trim();
const DENIED_ACTIONS = new Set(["network.connect", "world.invoke", "message.dispatch", "plugin.execute", "filesystem.write", "process.execute"]);
const DEFAULT_RULES = Object.freeze({
  "catalog.read": true,
  "metadata.read": true,
  "request.prepare": true,
  "network.connect": false,
  "world.invoke": false,
  "message.dispatch": false,
  "plugin.execute": false,
  "filesystem.write": false,
  "process.execute": false
});

export function createSecurityPolicy({ rules = DEFAULT_RULES, now = () => new Date().toISOString() } = {}) {
  const audit = [];
  let sequence = 0;
  function decide({ action, explicitlyApproved = false, principal = "unknown" } = {}) {
    const key = clean(action);
    const who = clean(principal) || "unknown";
    let allowed = Object.hasOwn(rules, key) && rules[key] === true;
    let reason = allowed ? "Ação de leitura/preparação permitida pela regra local." : "Ação não permitida pela política padrão.";
    if (DENIED_ACTIONS.has(key)) {
      allowed = false;
      reason = "Ação sensível bloqueada nesta versão, mesmo com aprovação explícita.";
    } else if (allowed && !explicitlyApproved && key !== "catalog.read" && key !== "metadata.read") {
      allowed = false;
      reason = "A ação exige aprovação explícita.";
    }
    const entry = Object.freeze({
      auditId: "DNET-SEC-" + (++sequence).toString().padStart(5, "0"),
      timestamp: clean(now()) || new Date().toISOString(),
      principal: who,
      action: key || null,
      explicitlyApproved: explicitlyApproved === true,
      allowed,
      reason
    });
    audit.push(entry);
    return { ...entry, transportStarted: false, executionStarted: false };
  }
  return Object.freeze({
    evaluate: decide,
    getRules() { return { ...rules }; },
    getAuditLog() { return audit.map(entry => ({ ...entry })); },
    getStatus() { return { version: "0.1.0", mode: "default-deny", auditCount: audit.length, sensitiveActionsEnabled: false }; }
  });
}
