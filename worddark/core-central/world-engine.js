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
import sectorModule from "../runtime/world/core/sector-engine.js";
import companyModule from "../runtime/world/core/company-engine.js";
const { createSectorEngine } = sectorModule;
const { createCompanyEngine } = companyModule;
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
  const sectors = new Map();
  const companies = new Map();

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

  function registerSector(input = {}) {
    const sectorId = clean(input.sectorId, "Identificador do setor");
    if (sectors.has(sectorId)) throw new Error("Setor já registrado.");
    const engine = createSectorEngine({ sectorId, name: input.name, owner: input.owner || "worddark", now });
    const sector = { sectorId, name: clean(input.name, "Nome do setor"), owner: input.owner || "worddark", description: typeof input.description === "string" ? input.description.trim() : "", status: "ACTIVE", createdAt: now(), engine };
    sectors.set(sectorId, sector);
    record("SECTOR_REGISTERED", { sectorId, name: sector.name, owner: sector.owner });
    return { sectorId, name: sector.name, owner: sector.owner, description: sector.description, status: sector.status, createdAt: sector.createdAt };
  }

  function registerCompany(input = {}) {
    const companyId = clean(input.companyId, "Identificador da empresa");
    const sectorId = clean(input.sectorId, "Identificador do setor");
    if (companies.has(companyId)) throw new Error("Empresa já registrada no mundo.");
    const sector = sectors.get(sectorId);
    if (!sector) throw new Error("Registre o setor antes de registrar a empresa.");
    const name = clean(input.name, "Nome da empresa");
    sector.engine.registerCompany({ companyId, name });
    const engine = createCompanyEngine({ companyId, name, sectorId, now, idFactory });
    const company = { companyId, name, sectorId, description: typeof input.description === "string" ? input.description.trim() : "", status: "ACTIVE", createdAt: now(), engine };
    companies.set(companyId, company);
    record("COMPANY_REGISTERED", { companyId, name, sectorId });
    return { companyId, name, sectorId, description: company.description, status: company.status, createdAt: company.createdAt };
  }

  function createCompanyWorkOrder(input = {}) {
    const companyId = clean(input.companyId, "Identificador da empresa");
    const company = companies.get(companyId);
    if (!company) throw new Error("Empresa não encontrada.");
    const order = company.engine.openWorkOrder(input);
    const sector = sectors.get(company.sectorId);
    sector.engine.recordWorkOrder({ workOrderId: order.workOrderId, companyId, title: order.title, status: order.status });
    record("COMPANY_WORK_ORDER_OPENED", { workOrderId: order.workOrderId, companyId, sectorId: company.sectorId });
    return clone(order);
  }

  function transitionCompanyWorkOrder(input = {}) {
    const companyId = clean(input.companyId, "Identificador da empresa");
    const company = companies.get(companyId);
    if (!company) throw new Error("Empresa não encontrada.");
    const order = company.engine.transitionWorkOrder(input.workOrderId, input.nextStatus, input.actorId, input.approval || {});
    sectors.get(company.sectorId).engine.updateWorkOrder({ workOrderId: order.workOrderId, status: order.status });
    record("COMPANY_WORK_ORDER_STATUS_CHANGED", { workOrderId: order.workOrderId, companyId, status: order.status, actorId: order.lastActorId });
    return clone(order);
  }

  function listSectors() {
    return [...sectors.values()].map(({ engine, ...sector }) => ({ ...clone(sector), operations: engine.status().workOrders, companies: engine.status().companies }));
  }
  function listCompanies() {
    return [...companies.values()].map(({ engine, ...company }) => ({ ...clone(company), operations: engine.status().workOrders }));
  }
  function getSector(sectorId) {
    const sector = sectors.get(sectorId);
    return sector ? { sectorId: sector.sectorId, name: sector.name, owner: sector.owner, description: sector.description, status: sector.status, engine: sector.engine.status(), companies: sector.engine.listCompanies(), workOrders: sector.engine.listWorkOrders() } : null;
  }
  function getCompany(companyId) {
    const company = companies.get(companyId);
    return company ? { companyId: company.companyId, name: company.name, sectorId: company.sectorId, description: company.description, status: company.status, engine: company.engine.status(), workOrders: company.engine.listWorkOrders(), audit: company.engine.auditTrail() } : null;
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
    registerSector,
    registerCompany,
    createCompanyWorkOrder,
    transitionCompanyWorkOrder,
    listSectors,
    listCompanies,
    getSector,
    getCompany,
    registerRevenueModel,
    getRequest(id) { const item = requests.get(id); return item ? { ...item, payload: clone(item.payload) } : null; },
    listRequests() { return [...requests.values()].map(item => ({ ...item, payload: clone(item.payload) })); },
    listRevenueModels() { return [...revenueModels.values()].map(clone); },
    auditTrail() { return audit.map(clone); },
    status() { return { engine: "WORDDARK_WORLD_CORE", status: "READY", requests: requests.size, revenueModels: revenueModels.size, domainEngines: ["WORDDARK", "SKY", "EARTH"], sectors: sectors.size, companies: companies.size, companyWorkOrders: [...companies.values()].reduce((total, company) => total + company.engine.status().workOrders, 0), defaultMode: "PLANNING_ONLY", externalSideEffectsEnabled: false }; }
  });
}
