/**
 * WordDark World Engine — shared kernel for the whole WordDark ecosystem.
 *
 * Coordinates the WordDark, Céu, and Terra domain engines through explicit
 * envelopes. Default mode is planning-only: no publishing, billing, buying,
 * account changes, or third-party connector calls are performed.
 */
const clean = (value, field) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(field + " é obrigatório.");
  return value.trim();
};
const clone = value => JSON.parse(JSON.stringify(value ?? {}));
const TYPES = Object.freeze({ DEMAND: "DEMAND", PREPARE: "PREPARE", COORDINATE: "COORDINATE", REVENUE_MODEL: "REVENUE_MODEL" });

export function createWordDarkWorldEngine({
  worddark,
  sky,
  earth,
  now = () => new Date().toISOString(),
  idFactory = () => "wd-request-" + Math.random().toString(36).slice(2, 10),
  authorize = () => false
} = {}) {
  if (!worddark || typeof worddark.coordinate !== "function") throw new TypeError("Motor WordDark obrigatório.");
  if (!sky || typeof sky.prepare !== "function") throw new TypeError("Motor Céu obrigatório.");
  if (!earth || typeof earth.captureDemand !== "function") throw new TypeError("Motor Terra obrigatório.");

  const requests = new Map();
  const revenueModels = new Map();
  const audit = [];

  function record(event, data) { audit.push({ event, at: now(), data: clone(data) }); }
  function submit(input = {}) {
    const type = clean(input.type, "Tipo da solicitação");
    const requesterId = clean(input.requesterId, "Solicitante");
    if (!Object.values(TYPES).includes(type)) throw new TypeError("Tipo de solicitação desconhecido.");
    const requestId = input.requestId ? clean(input.requestId, "Identificador da solicitação") : idFactory();
    if (requests.has(requestId)) throw new Error("Identificador de solicitação duplicado.");
    const envelope = { requestId, type, requesterId, payload: clone(input.payload), status: "RECEIVED", createdAt: now(), approvalRequired: true, sideEffectsEnabled: false };
    requests.set(requestId, envelope);
    record("REQUEST_RECEIVED", envelope);
    let result;
    if (type === TYPES.DEMAND) {
      result = earth.captureDemand({ ...envelope.payload, requester: envelope.payload.requester || requesterId });
      envelope.status = "DEMAND_CAPTURED";
    } else if (type === TYPES.PREPARE) {
      result = sky.prepare({ ...envelope.payload, requestId });
      envelope.status = "PREPARED_FOR_REVIEW";
    } else if (type === TYPES.COORDINATE) {
      result = worddark.coordinate({ ...envelope.payload, requestId });
      envelope.status = "ROUTE_PROPOSED";
    } else {
      result = registerRevenueModel(envelope.payload);
      envelope.status = "REVENUE_MODEL_PROPOSED";
    }
    envelope.resultId = result.demandId || result.planId || result.routeId || result.modelId;
    record("REQUEST_PROCESSED", { requestId, status: envelope.status, resultId: envelope.resultId });
    return { ...envelope, payload: clone(envelope.payload), result: clone(result) };
  }

  function registerRevenueModel(input = {}) {
    const modelId = clean(input.modelId || idFactory(), "Identificador do modelo de receita");
    if (revenueModels.has(modelId)) throw new Error("Modelo de receita já registrado.");
    const model = {
      modelId,
      name: clean(input.name, "Nome do modelo"),
      type: clean(input.type, "Tipo de receita"),
      ownerSector: clean(input.ownerSector, "Setor responsável"),
      pricingModel: clean(input.pricingModel, "Modelo de preço"),
      recurrence: input.recurrence || "UNSPECIFIED",
      status: "PROPOSED",
      realPaymentsEnabled: false,
      customerBillingEnabled: false,
      createdAt: now(),
      notes: typeof input.notes === "string" ? input.notes.trim() : ""
    };
    revenueModels.set(modelId, model);
    record("REVENUE_MODEL_PROPOSED", model);
    return clone(model);
  }

  function approveForExecution(requestId, approval) {
    const request = requests.get(clean(requestId, "Identificador da solicitação"));
    if (!request) throw new Error("Solicitação não encontrada.");
    if (request.status === "APPROVED_FOR_EXECUTION") throw new Error("Solicitação já aprovada.");
    if (!approval || approval.confirmed !== true || typeof approval.approverId !== "string" || !approval.approverId.trim()) {
      throw new Error("Aprovação explícita identificada é obrigatória.");
    }
    if (!authorize({ request: clone(request), approval: clone(approval) })) throw new Error("Política de autorização negou a aprovação.");
    request.status = "APPROVED_FOR_EXECUTION";
    request.approvedAt = now();
    request.approverId = approval.approverId.trim();
    record("REQUEST_APPROVED", { requestId, approverId: request.approverId });
    // Approval changes governance state only; this kernel never executes external side effects.
    return { ...request, payload: clone(request.payload), sideEffectsEnabled: false };
  }

  return Object.freeze({
    submit,
    approveForExecution,
    registerRevenueModel,
    getRequest(id) { const item = requests.get(id); return item ? { ...item, payload: clone(item.payload) } : null; },
    listRequests() { return [...requests.values()].map(item => ({ ...item, payload: clone(item.payload) })); },
    listRevenueModels() { return [...revenueModels.values()].map(clone); },
    auditTrail() { return audit.map(clone); },
    status() { return { engine: "WORDDARK_WORLD_CORE", status: "READY", requests: requests.size, revenueModels: revenueModels.size, domainEngines: ["WORDDARK", "SKY", "EARTH"], defaultMode: "PLANNING_ONLY", externalSideEffectsEnabled: false }; }
  });
}
