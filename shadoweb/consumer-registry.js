import { CONNECTOR_SCOPES } from "./contracts.js";

const KEY = "shadoweb.consumer-apps.v1";
const APP_ID = /^[a-z][a-z0-9-]{1,47}$/;
const text = (value, max) => typeof value === "string" && value.trim().length > 0 && value.length <= max;

export function validateConsumerManifest(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Manifesto do aplicativo inválido.");
  if (input.schemaVersion !== "1.0.0") throw new Error("Versão do manifesto do aplicativo incompatível.");
  if (!text(input.appId, 48) || !APP_ID.test(input.appId)) throw new Error("O ID do aplicativo deve usar letras minúsculas, números e hífens.");
  if (!text(input.name, 70) || !text(input.version, 24) || !text(input.description, 240)) throw new Error("Nome, versão ou descrição do aplicativo inválidos.");
  if (!Array.isArray(input.capabilities) || input.capabilities.length < 1 || input.capabilities.length > 12) throw new Error("Declare de 1 a 12 capacidades necessárias.");
  const capabilities = input.capabilities.map(item => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Capacidade inválida.");
    const connectorId = String(item.connectorId || "");
    const allowed = CONNECTOR_SCOPES[connectorId];
    if (!allowed) throw new Error("A capacidade aponta para um conector não registrado.");
    const scopes = Array.isArray(item.scopes) ? [...new Set(item.scopes)] : [];
    if (!scopes.length || scopes.some(scope => !allowed.includes(scope))) throw new Error("Escopo não permitido para a capacidade solicitada.");
    return { connectorId, scopes };
  });
  const unique = new Set();
  for (const item of capabilities) for (const scope of item.scopes) {
    const key = item.connectorId + ":" + scope;
    if (unique.has(key)) throw new Error("Capacidade duplicada no manifesto.");
    unique.add(key);
  }
  return Object.freeze({
    schemaVersion: "1.0.0",
    appId: input.appId,
    name: input.name.trim(),
    version: input.version.trim(),
    description: input.description.trim(),
    capabilities,
    enabled: false,
    grants: []
  });
}

export class ConsumerRegistry {
  constructor({ storage = localStorage, audit } = {}) { this.storage = storage; this.audit = audit; }
  list() {
    try { const value = JSON.parse(this.storage.getItem(KEY) || "[]"); return Array.isArray(value) ? value : []; }
    catch { return []; }
  }
  register(raw) {
    const manifest = validateConsumerManifest(raw);
    if (this.list().some(app => app.appId === manifest.appId)) throw new Error("Este aplicativo já está registrado.");
    this.storage.setItem(KEY, JSON.stringify([manifest, ...this.list()].slice(0, 100)));
    this.audit?.record("consumer.registered", { appId: manifest.appId });
    return manifest;
  }
  get(appId) { return this.list().find(app => app.appId === appId) || null; }
  setEnabled(appId, enabled) {
    const apps = this.list();
    const index = apps.findIndex(app => app.appId === appId);
    if (index < 0) throw new Error("Aplicativo consumidor não encontrado.");
    apps[index] = { ...apps[index], enabled: Boolean(enabled) };
    this.storage.setItem(KEY, JSON.stringify(apps));
    this.audit?.record(enabled ? "consumer.enabled" : "consumer.disabled", { appId });
    return apps[index];
  }
  grant(appId, connectorId, scopes) {
    if (!Array.isArray(scopes) || !scopes.length) throw new Error("Selecione pelo menos uma permissão.");
    const apps = this.list();
    const index = apps.findIndex(app => app.appId === appId);
    if (index < 0) throw new Error("Aplicativo consumidor não encontrado.");
    const app = apps[index];
    const requested = app.capabilities.find(capability => capability.connectorId === connectorId);
    if (!requested || scopes.some(scope => !requested.scopes.includes(scope))) throw new Error("O aplicativo não solicitou uma destas permissões.");
    const grants = [...(app.grants || []).filter(item => !(item.connectorId === connectorId && scopes.includes(item.scope)))];
    for (const scope of scopes) grants.push({ connectorId, scope });
    apps[index] = { ...app, grants };
    this.storage.setItem(KEY, JSON.stringify(apps));
    this.audit?.record("consumer.permission.granted", { appId, connectorId, scopes });
    return apps[index];
  }
  revoke(appId, connectorId, scope) {
    const apps = this.list();
    const index = apps.findIndex(app => app.appId === appId);
    if (index < 0) throw new Error("Aplicativo consumidor não encontrado.");
    apps[index] = { ...apps[index], grants: (apps[index].grants || []).filter(item => item.connectorId !== connectorId || (scope && item.scope !== scope)) };
    this.storage.setItem(KEY, JSON.stringify(apps));
    this.audit?.record("consumer.permission.revoked", { appId, connectorId, scope: scope || "all" });
    return apps[index];
  }
  authorize(appId, connectorId, scope) {
    const app = this.get(appId);
    if (!app || !app.enabled) throw new Error("Aplicativo consumidor não registrado ou desativado.");
    const requested = app.capabilities.find(capability => capability.connectorId === connectorId && capability.scopes.includes(scope));
    if (!requested) throw new Error("A capacidade não foi declarada pelo aplicativo.");
    if (!(app.grants || []).some(item => item.connectorId === connectorId && item.scope === scope)) throw new Error("Permissão do aplicativo não concedida.");
    return true;
  }
}
