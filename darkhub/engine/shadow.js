const SHADOW_SCHEMA = "darkhub-shadow-v1";
const SHADOW_KEY = "darkhub.shadow.v1";
const clone = value => JSON.parse(JSON.stringify(value));
const required = (value, label, max) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(label + " é obrigatório.");
  return value.trim().slice(0, max);
};

/**
 * Shadow's local control plane.
 * This module deliberately has no model provider, network client, shell, or code executor.
 * Provider adapters can be added later without changing the request/approval contract.
 */
export function createShadowAssistant({
  storage = globalThis.localStorage,
  now = () => new Date().toISOString(),
  idFactory = () => globalThis.crypto?.randomUUID?.() || ("shadow-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8)),
  runtime,
  orchestrator,
  provider = null
} = {}) {
  if (!runtime || !orchestrator) throw new TypeError("Shadow precisa do runtime e do orquestrador do darkHub.");
  let memory = null;
  function initial() {
    return {
      schema: SHADOW_SCHEMA,
      config: {
        provider: provider ? "adapter-injected" : "none",
        mode: "local-planning",
        networkEnabled: false,
        paidApisEnabled: false,
        automaticExecution: false,
        approvalRequired: true
      },
      requests: []
    };
  }
  function read() {
    try {
      const raw = storage?.getItem(SHADOW_KEY);
      if (!raw) return initial();
      const data = JSON.parse(raw);
      if (data?.schema !== SHADOW_SCHEMA || !Array.isArray(data.requests) || !data.config) throw new Error("schema");
      return data;
    } catch {
      return memory ? clone(memory) : initial();
    }
  }
  function write(data) {
    memory = clone(data);
    try { storage?.setItem(SHADOW_KEY, JSON.stringify(data)); } catch {}
    return clone(data);
  }
  function status() {
    const data = read();
    return {
      schema: SHADOW_SCHEMA,
      mode: data.config.mode,
      providerConnected: Boolean(provider),
      provider: data.config.provider,
      networkEnabled: data.config.networkEnabled,
      paidApisEnabled: data.config.paidApisEnabled,
      automaticExecution: data.config.automaticExecution,
      approvalRequired: data.config.approvalRequired,
      requests: data.requests.length,
      pending: data.requests.filter(item => item.status === "pending").length,
      approved: data.requests.filter(item => item.status === "approved").length
    };
  }
  function submitRequest(input = {}) {
    const appId = required(input.appId, "Projeto", 80);
    if (!runtime.getApp(appId)) throw new Error("O projeto precisa estar cadastrado no darkHub.");
    const request = {
      id: String(idFactory()),
      appId,
      prompt: required(input.prompt, "Solicitação", 4000),
      status: "pending",
      result: null,
      createdAt: now(),
      updatedAt: now()
    };
    const data = read();
    data.requests.push(request);
    write(data);
    return clone(request);
  }
  function listRequests() {
    return read().requests.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  function approveRequest(id) {
    const data = read();
    const request = data.requests.find(item => item.id === id);
    if (!request) throw new Error("Solicitação do Shadow não encontrada.");
    if (request.status !== "pending") throw new Error("Somente solicitações pendentes podem ser aprovadas.");
    // Approval only converts the request into a visible task. It does not execute code or publish.
    const task = orchestrator.createTask({
      appId: request.appId,
      title: ("Shadow: " + request.prompt).slice(0, 160),
      description: "Solicitação aprovada pelo usuário. Planejamento registrado pelo Shadow; execução automática desativada. Pedido original: " + request.prompt,
      priority: "normal"
    });
    request.status = "approved";
    request.result = { taskId: task.id, outcome: "queued-for-human-controlled-work" };
    request.updatedAt = now();
    write(data);
    return { request: clone(request), task };
  }
  function rejectRequest(id) {
    const data = read();
    const request = data.requests.find(item => item.id === id);
    if (!request) throw new Error("Solicitação do Shadow não encontrada.");
    if (request.status !== "pending") throw new Error("Somente solicitações pendentes podem ser recusadas.");
    request.status = "rejected";
    request.updatedAt = now();
    write(data);
    return clone(request);
  }
  function exportState() { return { ...read(), exportedAt: now() }; }
  return Object.freeze({ schema: SHADOW_SCHEMA, status, submitRequest, listRequests, approveRequest, rejectRequest, exportState });
}
export { SHADOW_SCHEMA, SHADOW_KEY };
