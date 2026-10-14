const clean = (value, field) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(field + " é obrigatório.");
  return value.trim();
};
const clone = value => JSON.parse(JSON.stringify(value ?? {}));

function createSkyEngine({ now = () => new Date().toISOString(), idFactory = () => "plan-" + Math.random().toString(36).slice(2, 10) } = {}) {
  const plans = new Map();
  function prepare(input = {}) {
    const requestId = clean(input.requestId, "Identificador da solicitação");
    const objective = clean(input.objective, "Objetivo");
    const deliverables = Array.isArray(input.deliverables) ? input.deliverables.map(item => clean(item, "Entrega")) : [];
    const plan = { planId: idFactory(), requestId, objective, deliverables, constraints: clone(input.constraints), proposedSteps: Array.isArray(input.proposedSteps) ? clone(input.proposedSteps) : [], status: "PREPARED_FOR_REVIEW", approvalRequired: true, publishingEnabled: false, externalConnectorsInvoked: false, createdAt: now() };
    plans.set(plan.planId, plan);
    return clone(plan);
  }
  return Object.freeze({ prepare, getPlan(id) { const item = plans.get(id); return item ? clone(item) : null; }, listPlans() { return [...plans.values()].map(clone); }, status() { return { engine: "SKY_PREPARATION", status: "READY", plans: plans.size, publishingEnabled: false }; } });
}
module.exports = { createSkyEngine };
