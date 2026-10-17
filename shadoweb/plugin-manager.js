import { validatePluginManifest } from "./contracts.js";
const KEY = "shadoweb.plugins.v1";
export class PluginManager {
  constructor({ storage = localStorage, audit }) { this.storage = storage; this.audit = audit; }
  list() { try { const value = JSON.parse(this.storage.getItem(KEY) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; } }
  importManifest(raw) {
    const manifest = validatePluginManifest(raw);
    const current = this.list();
    if (current.some(plugin => plugin.id === manifest.id)) throw new Error("Já existe um plugin com este ID.");
    const next = [manifest, ...current].slice(0, 80);
    this.storage.setItem(KEY, JSON.stringify(next));
    this.audit.record("plugin.imported", { pluginId: manifest.id, connectorId: manifest.connectorId });
    return manifest;
  }
  setEnabled(id, enabled) {
    const next = this.list().map(plugin => plugin.id === id ? { ...plugin, enabled: Boolean(enabled) } : plugin);
    if (!next.some(plugin => plugin.id === id)) throw new Error("Plugin não encontrado.");
    this.storage.setItem(KEY, JSON.stringify(next));
    this.audit.record(enabled ? "plugin.enabled" : "plugin.disabled", { pluginId: id });
    return next.find(plugin => plugin.id === id);
  }
  exportTemplate() { return { schemaVersion:"1.0.0", id:"meu-plugin", name:"Meu Plugin", version:"1.0.0", description:"Descreva o objetivo deste plugin.", connectorId:"wikipedia", permissions:["connector.read"] }; }
}
