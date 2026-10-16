export const CONTRACT_VERSION = "1.0.0";
export const SCOPES = Object.freeze({
  WEB_SEARCH: "web.search",
  KNOWLEDGE_READ: "knowledge.read",
  KNOWLEDGE_WRITE: "knowledge.write",
  CONNECTOR_READ: "connector.read",
  PLUGIN_MANAGE: "plugin.manage"
});
export const CONNECTOR_IDS = Object.freeze(["web-search", "wikipedia", "local-knowledge"]);
const ID = /^[a-z][a-z0-9-]{1,47}$/;
const SAFE_TEXT = (value, max=180) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
export function validateRequest(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Contrato de requisição inválido.");
  if (!SAFE_TEXT(input.connectorId, 48) || !ID.test(input.connectorId)) throw new Error("Identificador de conector inválido.");
  if (!SAFE_TEXT(input.action, 48) || !ID.test(input.action)) throw new Error("Ação inválida.");
  if (!input.input || typeof input.input !== "object" || Array.isArray(input.input)) throw new Error("Entrada deve ser um objeto.");
  const encoded = JSON.stringify(input.input);
  if (encoded.length > 12000) throw new Error("Entrada excede o limite permitido.");
  return Object.freeze({ version: CONTRACT_VERSION, requestId: crypto.randomUUID(), connectorId: input.connectorId, action: input.action, input: structuredClone(input.input) });
}
export function validatePluginManifest(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Manifesto de plugin inválido.");
  const id = String(input.id || "");
  if (!ID.test(id)) throw new Error("O ID deve usar letras minúsculas, números e hífens.");
  if (!SAFE_TEXT(input.name, 70) || !SAFE_TEXT(input.version, 24) || !SAFE_TEXT(input.description, 240)) throw new Error("Nome, versão ou descrição inválidos.");
  if (!CONNECTOR_IDS.includes(input.connectorId)) throw new Error("O plugin aponta para um conector que não é permitido nesta versão.");
  const permissions = Array.isArray(input.permissions) ? input.permissions : [];
  if (permissions.length > 4 || permissions.some(scope => !Object.values(SCOPES).includes(scope))) throw new Error("O plugin solicita permissões não reconhecidas.");
  return Object.freeze({ id, name: input.name.trim(), version: input.version.trim(), description: input.description.trim(), connectorId: input.connectorId, permissions: [...new Set(permissions)], enabled: false, trusted: false });
}
