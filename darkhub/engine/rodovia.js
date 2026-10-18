const SCHEMA = "darkhub-rodovia-v1";
const DEFAULT_MAX_PAYLOAD_BYTES = 256_000;
const REQUESTS_KEY = "darkhub.rodovia.requests.v1";
const REQUEST_STATES = ["received", "needs-creation", "awaiting-approval", "ready", "in-transit", "delivered", "completed", "blocked", "failed", "cancelled"];
const REQUEST_TRANSITIONS = { received: ["needs-creation", "awaiting-approval", "ready", "blocked", "cancelled"], "needs-creation": ["received", "cancelled"], "awaiting-approval": ["ready", "blocked", "cancelled"], ready: ["in-transit", "blocked", "cancelled"], "in-transit": ["delivered", "failed", "blocked"], delivered: ["completed", "failed"], blocked: ["received", "ready", "cancelled"], failed: ["received", "cancelled"], completed: [], cancelled: [] };
const clone = value => JSON.parse(JSON.stringify(value));
const required = (value, label, max = 180) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(label + " é obrigatório.");
  return value.trim().slice(0, max);
};
const byteLength = value => {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(value).length;
  return unescape(encodeURIComponent(value)).length;
};

const normalizeCapability = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

/**
 * Adapt the original WordDark Central catalog and the current darkHub
 * capability catalog to one lookup contract. A match is routing information,
 * not authorization to execute the requested action.
 */
export function resolveRodoviaCapability(request, catalog) {
  const capability = required(request?.capability, "capability", 160);
  const wanted = normalizeCapability(capability);
  const entries = Array.isArray(catalog?.sectors)
    ? catalog.sectors.filter(item => item?.status === "active").flatMap(item => (item.capabilities || []).map(name => ({ appId: item.id, id: name, fullId: name, status: "enabled" })))
    : Array.isArray(catalog?.capabilities) ? catalog.capabilities : [];
  const match = entries.find(item => item && item.status === "enabled" &&
    [item.fullId, item.id, item.name].some(value => normalizeCapability(value) === wanted));
  if (match) {
    return {
      status: "routed",
      requestId: request.requestId || null,
      destination: match.appId || match.id,
      capability: match.fullId || match.id || capability,
      message: "Capacidade ativa encontrada no catálogo central."
    };
  }
  return {
    status: "needs-creation",
    requestId: request.requestId || null,
    destination: "darkhub:creation",
    capability,
    message: "Nenhuma capacidade ativa encontrada; encaminhar o requisito para análise de criação."
  };
}

export function createRodoviaMessage(source = {}, { now = () => new Date().toISOString(), idFactory = () => "msg-" + Math.random().toString(36).slice(2, 12) } = {}) {
  const message = {
    schema: SCHEMA,
    messageId: required(source.messageId || idFactory(), "messageId", 120),
    requestId: required(source.requestId || idFactory(), "requestId", 120),
    type: required(source.type || "REQUEST", "type", 80),
    origin: required(source.origin, "origin", 120),
    destination: required(source.destination, "destination", 120),
    service: required(source.service, "service", 120),
    routeId: source.routeId ? required(source.routeId, "routeId", 120) : null,
    responseTo: source.responseTo ? required(source.responseTo, "responseTo", 120) : null,
    createdAt: source.createdAt || now(),
    payload: source.payload === undefined ? {} : source.payload,
    metadata: source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {}
  };
  validateMessage(message, { maxPayloadBytes: DEFAULT_MAX_PAYLOAD_BYTES });
  return message;
}

export function validateMessage(message, { maxPayloadBytes = DEFAULT_MAX_PAYLOAD_BYTES } = {}) {
  const errors = [];
  if (!message || typeof message !== "object" || Array.isArray(message)) return { valid: false, errors: ["Envelope de mensagem inválido."] };
  for (const key of ["messageId", "requestId", "type", "origin", "destination", "service", "createdAt"]) {
    if (typeof message[key] !== "string" || !message[key].trim()) errors.push(key + " é obrigatório.");
  }
  if (!message.payload || typeof message.payload !== "object" || Array.isArray(message.payload)) errors.push("payload deve ser um objeto.");
  try {
    const size = byteLength(JSON.stringify(message.payload ?? null));
    if (size > maxPayloadBytes) errors.push("payload ultrapassa o limite de " + maxPayloadBytes + " bytes.");
  } catch {
    errors.push("payload não pode ser serializado como JSON.");
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Rodovia is the shared transport and trace layer. It does not authorize
 * business actions or execute destination logic. Capability lookup only reads the central catalog.
 * Route registration is a transport allow-list, not an access grant.
 */
export function createDarkHubRodovia({
  now = () => new Date().toISOString(),
  idFactory = () => "road-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
  maxPayloadBytes = DEFAULT_MAX_PAYLOAD_BYTES,
  maxEvents = 2000,
  storage = globalThis.localStorage
} = {}) {
  const routes = new Map();
  const endpoints = new Map();
  const events = [];
  const seenMessages = new Set();
  let requestMemory = { schema: SCHEMA, requests: [] };

  function readRequests() {
    try {
      const raw = storage?.getItem(REQUESTS_KEY);
      if (!raw) return clone(requestMemory);
      const saved = JSON.parse(raw);
      if (saved?.schema !== SCHEMA || !Array.isArray(saved.requests)) throw new Error("invalid request store");
      requestMemory = saved;
      return clone(saved);
    } catch { return clone(requestMemory); }
  }

  function writeRequests(data) {
    requestMemory = clone(data);
    try { storage?.setItem(REQUESTS_KEY, JSON.stringify(data)); } catch {}
    return clone(data);
  }

  function createRequest(input = {}) {
    const origin = required(input.origin, "origin", 120);
    const capability = required(input.capability, "capability", 160);
    const description = typeof input.description === "string" ? input.description.trim().slice(0, 1200) : "";
    const requestId = required(input.requestId || "req-" + idFactory(), "requestId", 120);
    const data = readRequests();
    if (data.requests.some(item => item.requestId === requestId)) throw new Error("Já existe um requerimento com esse identificador.");
    const request = { requestId, origin, capability, description, priority: ["low", "normal", "high", "urgent"].includes(input.priority) ? input.priority : "normal", state: "received", destination: null, projectId: null, snapshotId: null, validation: null, createdAt: now(), updatedAt: now(), history: [{ state: "received", at: now(), note: "Requerimento recebido pela Rodovia." }] };
    data.requests.push(request);
    record({ kind: "REQUEST_CREATED", requestId, origin, capability, state: request.state });
    writeRequests(data);
    return clone(request);
  }

  function transitionRequest(requestId, nextState, { note = "" } = {}) {
    if (!REQUEST_STATES.includes(nextState)) throw new TypeError("Estado do requerimento inválido.");
    const data = readRequests();
    const request = data.requests.find(item => item.requestId === required(requestId, "requestId", 120));
    if (!request) throw new Error("Requerimento não encontrado.");
    if (!(REQUEST_TRANSITIONS[request.state] || []).includes(nextState)) throw new Error("Transição não permitida: " + request.state + " → " + nextState + ".");
    request.state = nextState;
    request.updatedAt = now();
    request.history.push({ state: nextState, at: now(), note: String(note).slice(0, 240) });
    record({ kind: "REQUEST_STATE_CHANGED", requestId, state: nextState });
    writeRequests(data);
    return clone(request);
  }

  function linkRequestProject(requestId, { projectId, snapshotId = null } = {}) {
    const data = read();
    const request = data.requests.find(item => item.requestId === required(requestId, "requestId", 120));
    if (!request) throw new Error("Requerimento não encontrado.");
    request.projectId = required(projectId, "projectId", 160);
    request.snapshotId = snapshotId == null || snapshotId === "" ? null : required(snapshotId, "snapshotId", 160);
    request.updatedAt = now();
    request.history.push({ state: request.state, at: now(), note: "Vínculo de projeto/versão atualizado: " + request.projectId + (request.snapshotId ? " · versão " + request.snapshotId : "") });
    record({ kind: "REQUEST_PROJECT_LINKED", requestId, projectId: request.projectId, snapshotId: request.snapshotId });
    writeRequests(data);
    return clone(request);
  }

  function recordRequestValidation(requestId, validation) {
    if (!validation || typeof validation !== "object" || typeof validation.valid !== "boolean") {
      throw new TypeError("Resultado de validação estrutural inválido.");
    }
    const data = read();
    const request = data.requests.find(item => item.requestId === required(requestId, "requestId", 120));
    if (!request) throw new Error("Requerimento não encontrado.");
    if (!request.projectId) throw new Error("Vincule um projeto antes de registrar a validação.");
    request.validation = {
      valid: validation.valid,
      checkedAt: typeof validation.checkedAt === "string" ? validation.checkedAt : now(),
      errors: Array.isArray(validation.errors) ? validation.errors.map(value => String(value).slice(0, 240)).slice(0, 50) : [],
      warnings: Array.isArray(validation.warnings) ? validation.warnings.map(value => String(value).slice(0, 240)).slice(0, 50) : [],
      kind: "structural"
    };
    request.updatedAt = now();
    request.history.push({ state: request.state, at: now(), note: "Validação estrutural registrada: " + (validation.valid ? "aprovada" : "com bloqueios") + ". Não equivale a compilação ou teste de execução." });
    record({ kind: "REQUEST_VALIDATION_RECORDED", requestId, projectId: request.projectId, valid: validation.valid });
    writeRequests(data);
    return clone(request);
  }

  function resolveRequest(requestId, catalog) {
    const data = readRequests();
    const request = data.requests.find(item => item.requestId === required(requestId, "requestId", 120));
    if (!request) throw new Error("Requerimento não encontrado.");
    if (request.state !== "received" && request.state !== "needs-creation") throw new Error("Só é possível resolver requerimentos recém-recebidos ou encaminhados para criação.");
    const result = resolveRodoviaCapability(request, catalog);
    request.destination = result.destination;
    request.state = result.status === "routed" ? "awaiting-approval" : "needs-creation";
    request.updatedAt = now();
    request.history.push({ state: request.state, at: now(), note: result.message });
    record({ kind: "REQUEST_RESOLVED", requestId, destination: request.destination, state: request.state });
    writeRequests(data);
    return { request: clone(request), resolution: result };
  }

  function record(event) {
    events.push({ eventId: String(idFactory()), at: now(), ...event });
    if (events.length > maxEvents) events.splice(0, events.length - maxEvents);
  }

  function registerRoute(source) {
    const route = {
      routeId: required(source?.routeId, "routeId", 120),
      origin: required(source?.origin, "origin", 120),
      destination: required(source?.destination, "destination", 120),
      service: source?.service === undefined || source?.service === "*" ? "*" : required(source.service, "service", 120),
      status: source?.status || "ACTIVE"
    };
    if (!["ACTIVE", "SUSPENDED", "REVOKED"].includes(route.status)) throw new TypeError("Status de rota inválido.");
    if (routes.has(route.routeId)) throw new Error("Já existe uma rota com esse identificador.");
    routes.set(route.routeId, route);
    record({ kind: "ROUTE_REGISTERED", routeId: route.routeId, origin: route.origin, destination: route.destination, service: route.service });
    return clone(route);
  }

  function setRouteStatus(routeId, status) {
    if (!["ACTIVE", "SUSPENDED", "REVOKED"].includes(status)) throw new TypeError("Status de rota inválido.");
    const route = routes.get(required(routeId, "routeId", 120));
    if (!route) throw new Error("Rota não encontrada.");
    route.status = status;
    record({ kind: "ROUTE_STATUS_CHANGED", routeId, status });
    return clone(route);
  }

  function registerEndpoint(destination, handler) {
    const id = required(destination, "destination", 120);
    if (typeof handler !== "function") throw new TypeError("O endpoint precisa ser uma função de entrega.");
    endpoints.set(id, handler);
    return () => { if (endpoints.get(id) === handler) endpoints.delete(id); };
  }

  function findRoute(message) {
    return [...routes.values()].find(route =>
      route.status === "ACTIVE" &&
      route.origin === message.origin &&
      route.destination === message.destination &&
      (route.service === "*" || route.service === message.service)
    ) || null;
  }

  async function send(source) {
    const message = createRodoviaMessage(source, { now, idFactory: () => "msg-" + idFactory() });
    const validation = validateMessage(message, { maxPayloadBytes });
    if (!validation.valid) {
      record({ kind: "MESSAGE_REJECTED", messageId: message.messageId, requestId: message.requestId, origin: message.origin, destination: message.destination, reason: validation.errors.join(" ") });
      return { success: false, status: "REJECTED", stage: "RODOVIA", errors: validation.errors };
    }
    if (seenMessages.has(message.messageId)) {
      record({ kind: "DUPLICATE_BLOCKED", messageId: message.messageId, requestId: message.requestId, origin: message.origin, destination: message.destination });
      return { success: false, status: "DUPLICATE_BLOCKED", stage: "RODOVIA", messageId: message.messageId };
    }
    seenMessages.add(message.messageId);
    const route = findRoute(message);
    if (!route) {
      record({ kind: "ROUTE_NOT_FOUND", messageId: message.messageId, requestId: message.requestId, origin: message.origin, destination: message.destination, service: message.service });
      return { success: false, status: "ROUTE_NOT_FOUND", stage: "RODOVIA", messageId: message.messageId, requestId: message.requestId };
    }
    const endpoint = endpoints.get(message.destination);
    if (!endpoint) {
      record({ kind: "ENDPOINT_UNAVAILABLE", messageId: message.messageId, requestId: message.requestId, routeId: route.routeId, origin: message.origin, destination: message.destination });
      return { success: false, status: "ENDPOINT_UNAVAILABLE", stage: "RODOVIA", routeId: route.routeId, messageId: message.messageId, requestId: message.requestId };
    }
    message.routeId = route.routeId;
    const delivery = {
      deliveryId: String(idFactory()),
      messageId: message.messageId,
      requestId: message.requestId,
      routeId: route.routeId,
      origin: message.origin,
      destination: message.destination,
      service: message.service,
      status: "DELIVERING",
      createdAt: now()
    };
    record({ kind: "DELIVERY_STARTED", ...delivery });
    try {
      const receipt = await endpoint(clone(message));
      const result = { success: true, status: "DELIVERED", stage: "RODOVIA", routeId: route.routeId, message: clone(message), delivery: { ...delivery, status: "DELIVERED", deliveredAt: now() }, receipt: receipt === undefined ? null : receipt };
      record({ kind: "DELIVERY_CONFIRMED", deliveryId: delivery.deliveryId, messageId: message.messageId, requestId: message.requestId, routeId: route.routeId, origin: message.origin, destination: message.destination });
      return result;
    } catch (error) {
      record({ kind: "DELIVERY_FAILED", deliveryId: delivery.deliveryId, messageId: message.messageId, requestId: message.requestId, routeId: route.routeId, origin: message.origin, destination: message.destination, reason: String(error?.message || "Falha no endpoint").slice(0, 240) });
      return { success: false, status: "DELIVERY_FAILED", stage: "RODOVIA", routeId: route.routeId, messageId: message.messageId, requestId: message.requestId, reason: String(error?.message || "Falha no endpoint").slice(0, 240) };
    }
  }

  return Object.freeze({
    schema: SCHEMA,
    registerRoute,
    setRouteStatus,
    registerEndpoint,
    createRequest,
    transitionRequest,
    linkRequestProject,
    recordRequestValidation,
    resolveRequest,
    listRequests: ({ state, limit = 200 } = {}) => readRequests().requests.filter(item => !state || item.state === state).slice(-Math.max(0, Math.min(1000, limit))).reverse().map(clone),
    send,
    listRoutes: () => [...routes.values()].map(clone),
    listEvents: ({ requestId, limit = 200 } = {}) => events.filter(event => !requestId || event.requestId === requestId).slice(-Math.max(0, Math.min(1000, limit))).map(clone),
    getStatus: () => ({ name: "Rodovia", schema: SCHEMA, status: "LOCAL", routes: routes.size, endpoints: endpoints.size, events: events.length, maxEvents }),
    clearTrace: () => { events.splice(0, events.length); }
  });
}

export const RODOVIA_SCHEMA = SCHEMA;
