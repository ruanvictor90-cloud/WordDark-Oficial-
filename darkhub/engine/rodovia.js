const SCHEMA = "darkhub-rodovia-v1";
const DEFAULT_MAX_PAYLOAD_BYTES = 256_000;
const clone = value => JSON.parse(JSON.stringify(value));
const required = (value, label, max = 180) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(label + " é obrigatório.");
  return value.trim().slice(0, max);
};
const byteLength = value => {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(value).length;
  return unescape(encodeURIComponent(value)).length;
};

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
 * business actions, choose capabilities, or execute destination logic.
 * Route registration is a transport allow-list, not an access grant.
 */
export function createDarkHubRodovia({
  now = () => new Date().toISOString(),
  idFactory = () => "road-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
  maxPayloadBytes = DEFAULT_MAX_PAYLOAD_BYTES,
  maxEvents = 2000
} = {}) {
  const routes = new Map();
  const endpoints = new Map();
  const events = [];
  const seenMessages = new Set();

  function record(event) {
    events.push({ eventId: String(idFactory()), at: now(), ...event });
    if (events.length > maxEvents) events.splice(0, events.length - maxEvents);
  }

  function registerRoute(source) {
    const route = {
      routeId: required(source?.routeId, "routeId", 120),
      origin: required(source?.origin, "origin", 120),
      destination: required(source?.destination, "destination", 120),
      service: source?.service === "*" ? "*" : required(source?.service, "service", 120),
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
    send,
    listRoutes: () => [...routes.values()].map(clone),
    listEvents: ({ requestId, limit = 200 } = {}) => events.filter(event => !requestId || event.requestId === requestId).slice(-Math.max(0, Math.min(1000, limit))).map(clone),
    getStatus: () => ({ name: "Rodovia", schema: SCHEMA, status: "LOCAL", routes: routes.size, endpoints: endpoints.size, events: events.length, maxEvents }),
    clearTrace: () => { events.splice(0, events.length); }
  });
}

export const RODOVIA_SCHEMA = SCHEMA;
