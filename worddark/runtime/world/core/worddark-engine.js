const clean = (value, field) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(field + " é obrigatório.");
  return value.trim();
};
const clone = value => JSON.parse(JSON.stringify(value ?? {}));

function createWordDarkEngine({ now = () => new Date().toISOString(), idFactory = () => "route-" + Math.random().toString(36).slice(2, 10) } = {}) {
  const decisions = [];
  function coordinate(input = {}) {
    const requestId = clean(input.requestId, "Identificador da solicitação");
    const intent = clean(input.intent, "Intenção");
    const demandId = input.demandId ? clean(input.demandId, "Identificador da demanda") : null;
    const route = { routeId: idFactory(), requestId, demandId, intent, destination: input.destination || "sky", requiredApproval: true, executionEnabled: false, status: "ROUTE_PROPOSED", createdAt: now(), context: clone(input.context) };
    if (!["earth", "sky", "worddark"].includes(route.destination)) throw new TypeError("Destino operacional inválido.");
    decisions.push(route);
    return clone(route);
  }
  return Object.freeze({ coordinate, listDecisions() { return decisions.map(clone); }, status() { return { engine: "WORDDARK_COORDINATION", status: "READY", decisions: decisions.length, sideEffectsEnabled: false }; } });
}
module.exports = { createWordDarkEngine };
