const clean = (value, field) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(field + " é obrigatório.");
  return value.trim();
};
const clone = value => JSON.parse(JSON.stringify(value ?? {}));

function createEarthEngine({ now = () => new Date().toISOString(), idFactory = () => "demand-" + Math.random().toString(36).slice(2, 10) } = {}) {
  const demands = new Map();
  const audit = [];
  function record(event, data) { audit.push({ event, at: now(), data: clone(data) }); }
  function captureDemand(input = {}) {
    const requester = clean(input.requester, "Solicitante");
    const need = clean(input.need, "Necessidade");
    const category = clean(input.category, "Categoria");
    const demand = { demandId: idFactory(), requester, need, category, budget: input.budget ?? null, deadline: input.deadline || null, recurrence: input.recurrence || "ONE_TIME", businessContext: clone(input.businessContext), status: "CAPTURED", quoteApproved: false, executionAuthorized: false, createdAt: now() };
    demands.set(demand.demandId, demand);
    record("DEMAND_CAPTURED", demand);
    return clone(demand);
  }
  function linkCommercialLead(demandId, leadId, actorId) {
    demandId = clean(demandId, "Identificador da demanda");
    leadId = clean(leadId, "Identificador do lead comercial");
    actorId = clean(actorId, "Responsável pela vinculação");
    const demand = demands.get(demandId);
    if (!demand) throw new Error("Demanda não encontrada.");
    if (demand.status === "LEAD_CREATED" && demand.commercialLeadId === leadId) return clone(demand);
    if (demand.status !== "CAPTURED") throw new Error("Somente demanda capturada pode ser vinculada a um lead.");
    const updated = { ...demand, status: "LEAD_CREATED", commercialLeadId: leadId, linkedBy: actorId, linkedAt: now() };
    demands.set(demandId, updated);
    record("DEMAND_LINKED_TO_COMMERCIAL_LEAD", { demandId, leadId, actorId });
    return clone(updated);
  }
  return Object.freeze({
    captureDemand, linkCommercialLead,
    getDemand(id) { const item = demands.get(id); return item ? clone(item) : null; },
    listDemands() { return [...demands.values()].map(clone); },
    auditTrail() { return audit.map(clone); },
    status() { return { engine: "EARTH_DEMAND", status: "READY", demands: demands.size, linkedLeads: [...demands.values()].filter(item => item.status === "LEAD_CREATED").length, salesEnabled: false }; }
  });
}
module.exports = { createEarthEngine };
