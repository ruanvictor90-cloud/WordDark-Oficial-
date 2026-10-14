/**
 * Darknet connection contracts v0.2.
 * Defines transport-neutral envelopes and a metadata-only plugin registry.
 * It does not load plugin code, make network requests, or enable connectors.
 */
export const DARKNET_CONTRACT_VERSION = "0.2.0";
export const DEFAULT_CONNECTION_POLICY = Object.freeze({
  allowExternalNetwork: false,
  allowWorldRuntime: false,
  allowMessageDispatch: false,
  requireExplicitEnablement: true
});

const text = value => String(value ?? "").trim();
const validId = value => /^[a-z0-9][a-z0-9._-]{1,79}$/i.test(text(value));

export function createConnectionEnvelope(input = {}) {
  const source = text(input.source);
  const destination = text(input.destination);
  const kind = text(input.kind || "information");
  const payload = input.payload;
  if (!source || !destination) throw new Error("A origem e o destino são obrigatórios.");
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("O payload deve ser um objeto.");
  }
  return Object.freeze({
    contract: "darknet.connection-envelope",
    version: 1,
    id: text(input.id) || "DNET-MSG-" + Math.random().toString(36).slice(2, 12).toUpperCase(),
    createdAt: text(input.createdAt) || new Date().toISOString(),
    source,
    destination,
    kind,
    payload: Object.freeze({ ...payload }),
    status: "prepared",
    transport: "disabled",
    dispatchedAt: null
  });
}

export function validateConnectionEnvelope(value) {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { valid: false, errors: ["A mensagem deve ser um objeto."] };
  }
  if (value.contract !== "darknet.connection-envelope") errors.push("Contrato desconhecido.");
  if (value.version !== 1) errors.push("Versão de contrato incompatível.");
  if (!text(value.id)) errors.push("Identificador ausente.");
  if (!text(value.source)) errors.push("Origem ausente.");
  if (!text(value.destination)) errors.push("Destino ausente.");
  if (!text(value.kind)) errors.push("Tipo de mensagem ausente.");
  if (!value.payload || typeof value.payload !== "object" || Array.isArray(value.payload)) {
    errors.push("Payload inválido.");
  }
  if (value.transport !== "disabled") errors.push("Transporte não autorizado por este contrato.");
  if (value.status !== "prepared") errors.push("Estado da mensagem não permitido.");
  if (value.dispatchedAt !== null) errors.push("Mensagens preparadas não podem conter data de envio.");
  return { valid: errors.length === 0, errors };
}

export function createPluginRegistry(initial = []) {
  const plugins = new Map();
  const normalize = descriptor => {
    if (!descriptor || typeof descriptor !== "object") throw new Error("Descritor de plugin inválido.");
    const id = text(descriptor.id);
    const name = text(descriptor.name);
    const version = text(descriptor.version);
    const capabilities = Array.isArray(descriptor.capabilities)
      ? [...new Set(descriptor.capabilities.map(text).filter(Boolean))]
      : [];
    if (!validId(id)) throw new Error("O ID do plugin deve usar letras, números, ponto, hífen ou sublinhado.");
    if (!name || !version) throw new Error("Nome e versão do plugin são obrigatórios.");
    return Object.freeze({
      id, name, version, capabilities: Object.freeze(capabilities),
      status: "disabled",
      execution: "not-loaded",
      networkAccess: false
    });
  };
  for (const descriptor of initial) {
    const plugin = normalize(descriptor);
    if (plugins.has(plugin.id)) throw new Error("Plugin duplicado: " + plugin.id);
    plugins.set(plugin.id, plugin);
  }
  return Object.freeze({
    register(descriptor) {
      const plugin = normalize(descriptor);
      if (plugins.has(plugin.id)) throw new Error("Plugin duplicado: " + plugin.id);
      plugins.set(plugin.id, plugin);
      return plugin;
    },
    get(id) { return plugins.get(text(id)) ?? null; },
    list() { return [...plugins.values()].map(plugin => ({ ...plugin, capabilities: [...plugin.capabilities] })); },
    enable() { throw new Error("A ativação de plugins ainda não está disponível nesta versão."); },
    execute() { throw new Error("A execução de plugins ainda não está disponível nesta versão."); }
  });
}

export function evaluateConnectionRequest({ connector, policy = DEFAULT_CONNECTION_POLICY, explicitlyApproved = false } = {}) {
  const id = text(connector);
  if (!id) return { allowed: false, reason: "Conector não identificado." };
  if (!explicitlyApproved) return { allowed: false, reason: "A conexão exige autorização explícita." };
  if (policy.requireExplicitEnablement && !explicitlyApproved) {
    return { allowed: false, reason: "A política exige ativação explícita." };
  }
  if (id === "external-web" && !policy.allowExternalNetwork) {
    return { allowed: false, reason: "A rede externa permanece desativada." };
  }
  if (id === "world-runtime" && !policy.allowWorldRuntime) {
    return { allowed: false, reason: "A conexão com o mundo permanece desativada." };
  }
  if (id === "message-dispatch" && !policy.allowMessageDispatch) {
    return { allowed: false, reason: "O envio de mensagens permanece desativado." };
  }
  return { allowed: true, reason: "Permitido pela política fornecida; nenhum envio é executado por esta função." };
}
