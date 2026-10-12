import assert from "node:assert/strict";
import { createWordDarkWorldEngine } from "./world-engine.js";
import worddarkModule from "../runtime/world/core/worddark-engine.js";
const { createWordDarkEngine } = worddarkModule;
import skyModule from "../runtime/world/sky/sky-engine.js";
const { createSkyEngine } = skyModule;
import earthModule from "../runtime/world/earth/earth-engine.js";
const { createEarthEngine } = earthModule;
let n = 0;
const engine = createWordDarkWorldEngine({
  worddark: createWordDarkEngine({ idFactory: () => "route-" + (++n) }),
  sky: createSkyEngine({ idFactory: () => "plan-" + (++n) }),
  earth: createEarthEngine({ idFactory: () => "demand-" + (++n) }),
  now: () => "2026-10-12T00:00:00.000Z",
  idFactory: () => "req-" + (++n),
  authorize: ({ approval }) => approval.approverId === "owner"
});
const demand = engine.submit({ type: "DEMAND", requesterId: "client-1", payload: { need: "Create product campaign", category: "content", recurrence: "MONTHLY" } });
assert.equal(demand.status, "DEMAND_CAPTURED");
assert.equal(demand.result.executionAuthorized, false);
const plan = engine.submit({ type: "PREPARE", requesterId: "worddark", payload: { objective: "Prepare campaign", deliverables: ["script"] } });
assert.equal(plan.status, "PREPARED_FOR_REVIEW");
const route = engine.submit({ type: "COORDINATE", requesterId: "worddark", payload: { intent: "route campaign", destination: "sky" } });
assert.equal(route.status, "ROUTE_PROPOSED");
const model = engine.submit({ type: "REVENUE_MODEL", requesterId: "worddark", payload: { name: "Monthly content package", type: "SERVICE_SUBSCRIPTION", ownerSector: "sky", pricingModel: "MONTHLY_TIER" } });
assert.equal(model.result.status, "PROPOSED");
assert.equal(model.result.realPaymentsEnabled, false);
assert.throws(() => engine.approveForExecution(demand.requestId, { confirmed: true, approverId: "intruder" }), /Política de autorização negou/);
const approved = engine.approveForExecution(plan.requestId, { confirmed: true, approverId: "owner" });
assert.equal(approved.status, "APPROVED_FOR_EXECUTION");
assert.equal(approved.sideEffectsEnabled, false);
assert.equal(engine.status().externalSideEffectsEnabled, false);
assert.ok(engine.auditTrail().some(event => event.event === "REQUEST_RECEIVED"));
assert.throws(() => engine.submit({ type: "unknown", requesterId: "x", payload: {} }), /Tipo de solicitação desconhecido/);

const sector = engine.getSector("earth");
assert.equal(sector.sectorId, "earth");
assert.equal(engine.listSectors().length, 3);
const company = engine.getCompany("channels");
assert.equal(company.sectorId, "earth");
assert.equal(engine.listCompanies().length, 1);
const work = engine.createCompanyWorkOrder({ companyId: "channels", requesterId: "client-2", title: "Prepare channel plan", category: "content", recurrence: "MONTHLY" });
assert.equal(work.status, "RECEIVED");
assert.equal(engine.getSector("earth").workOrders.length, 1);
assert.equal(engine.transitionCompanyWorkOrder({ companyId: "channels", workOrderId: work.workOrderId, nextStatus: "TRIAGED", actorId: "operator" }).status, "TRIAGED");
assert.equal(engine.getSector("earth").workOrders[0].status, "TRIAGED");
assert.equal(engine.getCompany("channels").workOrders[0].executionEnabled, false);
assert.equal(engine.listSectors().length, 3);
assert.equal(engine.listCompanies().length, 1);
assert.equal(engine.status().companies, 1);
assert.throws(() => engine.registerCompany({ companyId: "bad", name: "Unknown", sectorId: "missing" }), /Registre o setor/);
assert.throws(() => engine.registerSector({ sectorId: "earth", name: "Duplicado" }), /Setor já registrado/);
assert.throws(() => engine.createCompanyWorkOrder({ companyId: "missing", requesterId: "x", title: "No company", category: "x" }), /Empresa não encontrada/);

console.log("WordDark world engine tests passed.");
