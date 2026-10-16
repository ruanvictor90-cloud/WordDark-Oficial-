import { CONNECTOR_SCOPES } from "./contracts.js";
export class Gate {
  constructor(storage = localStorage) { this.storage = storage; }
  grants() { try { const value = JSON.parse(this.storage.getItem("shadoweb.grants.v1") || "{}"); return value && typeof value === "object" ? value : {}; } catch { return {}; } }
  isGranted(connectorId, scope) { const grants = this.grants(); return grants[connectorId]?.includes(scope) === true; }
  grant(connectorId, scopes) {
    if (!Array.isArray(scopes) || !scopes.length) throw new Error("Selecione pelo menos uma permissão.");
    const allowed = CONNECTOR_SCOPES[connectorId];
    if (!allowed || scopes.some(scope => !allowed.includes(scope))) throw new Error("O conector não pode receber esses escopos.");
    const grants = this.grants(); grants[connectorId] = [...new Set([...(grants[connectorId] || []), ...scopes])];
    this.storage.setItem("shadoweb.grants.v1", JSON.stringify(grants));
  }
  revoke(connectorId, scope) {
    const grants = this.grants();
    if (scope) grants[connectorId] = (grants[connectorId] || []).filter(item => item !== scope); else delete grants[connectorId];
    this.storage.setItem("shadoweb.grants.v1", JSON.stringify(grants));
  }
  authorize(connector, scope) {
    if (!connector || connector.enabled !== true) throw new Error("Conector desativado. Ative-o explicitamente em Conexões.");
    if (!CONNECTOR_SCOPES[connector.id]?.includes(scope)) throw new Error("Escopo incompatível com o conector.");
    if (!this.isGranted(connector.id, scope)) throw new Error("Permissão ausente. Conceda o escopo solicitado em Conexões.");
  }
}
