const clean = (value, field) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(field + " é obrigatório.");
  return value.trim();
};
const clone = value => JSON.parse(JSON.stringify(value ?? {}));

function createEarthEngine({ now = () => new Date().toISOString(), idFactory = () => "demand-" + Math.random().toString(36).slice(2, 10) } = {}) {
  const demands = new Map();
  function captureDemand(input = {}) {
    const requester = clean(input.requester, "Solicitante");
    const need = clean(input.need, "Necessidade");
    const category = clean(input.category, "Categoria");
    const demand = { demandId: idFactory(), requester, need, category, budget: input.budget ?? null, deadline: input.deadline || null, recurrence: input.recurrence || "ONE_TIME", businessContext: clone(input.businessContext), status: "CAPTURED", quoteApproved: false, executionAuthorized: false, createdAt: now() };
    demands.set(demand.demandId, demand);
    return clone(demand);
  }
  return Object.freeze({ captureDemand, getDemand(id) { const item = demands.get(id); return item ? clone(item) : null; }, listDemands() { return [...demands.values()].map(clone); }, status() { return { engine: "EARTH_DEMAND", status: "READY", demands: demands.size, salesEnabled: false }; } });
}
module.exports = { createEarthEngine };
