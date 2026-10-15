import assert from "node:assert/strict";
import { createFirstSaleWorkflow } from "./first-sale-workflow.js";
import { createWordDarkWorldEngine } from "./world-engine.js";
import worddarkModule from "../runtime/world/core/worddark-engine.js";
import skyModule from "../runtime/world/sky/sky-engine.js";
import earthModule from "../runtime/world/earth/earth-engine.js";
const { createWordDarkEngine } = worddarkModule;
const { createSkyEngine } = skyModule;
const { createEarthEngine } = earthModule;
let n = 0;
const worldEngine = createWordDarkWorldEngine({
  worddark: createWordDarkEngine({ idFactory: () => "route-" + (++n) }),
  sky: createSkyEngine({ idFactory: () => "plan-" + (++n) }),
  earth: createEarthEngine({ idFactory: () => "demand-" + (++n) }),
  now: () => "2026-10-15T12:00:00.000Z",
  idFactory: () => "request-" + (++n),
  authorize: ({ approval }) => approval.approverId === "owner"
});
const workflow = createFirstSaleWorkflow({
  worldEngine, now: () => "2026-10-15T12:00:00.000Z",
  idFactory: () => "workflow-" + (++n)
});
const started = workflow.start({
  workflowId: "sale-1", requesterId: "client-1",
  need: "Criar conteúdo para divulgar um serviço", category: "content",
  objective: "Preparar um pequeno pacote de divulgação",
  deliverables: ["3 textos curtos", "1 roteiro vertical"]
});
assert.equal(started.status, "AWAITING_ROUTE_APPROVAL");
assert.equal(worldEngine.getRequest(started.demandRequestId).status, "DEMAND_CAPTURED");
assert.throws(() => workflow.approveRouting("sale-1", { confirmed: true, approverId: "intruder" }), /Política de autorização negou/);
assert.throws(() => workflow.approvePlan("sale-1", { confirmed: true, approverId: "owner" }), /não aguarda aprovação do plano/);
const routed = workflow.approveRouting("sale-1", { confirmed: true, approverId: "owner" });
assert.equal(routed.status, "AWAITING_PLAN_APPROVAL");
assert.equal(worldEngine.getRequest(routed.routeRequestId).status, "APPROVED_FOR_EXECUTION");
assert.equal(worldEngine.getRequest(routed.planRequestId).status, "PREPARED_FOR_REVIEW");
const approved = workflow.approvePlan("sale-1", { confirmed: true, approverId: "owner" });
assert.equal(approved.status, "AWAITING_MANUAL_EXECUTION");
assert.equal(worldEngine.getRequest(approved.planRequestId).status, "APPROVED_FOR_EXECUTION");
assert.throws(() => workflow.recordExecutionResult("sale-1", { actorId: "operator" }), /resultado produzido|Resultado produzido/);
const recorded = workflow.recordExecutionResult("sale-1", { content: "Entrega de teste para revisão.", actorId: "operator" });
assert.equal(recorded.status, "READY_FOR_HUMAN_REVIEW");
assert.equal(recorded.result.executionMode, "MANUAL_RECORDED");
assert.throws(() => workflow.reviewResult("sale-1", { decision: "APPROVE", actorId: "owner" }), /decisão|Decisão/);
const rework = workflow.reviewResult("sale-1", { decision: "REWORK", actorId: "owner", notes: "Ajustar o texto." });
assert.equal(rework.status, "REWORK_REQUIRED");
const revised = workflow.recordExecutionResult("sale-1", { content: "Entrega revisada.", actorId: "operator", resultId: "result-2" });
assert.equal(revised.status, "READY_FOR_HUMAN_REVIEW");
const completed = workflow.reviewResult("sale-1", { decision: "APPROVE", actorId: "owner", notes: "Aprovado." });
assert.equal(completed.status, "COMPLETED");
assert.equal(workflow.status().completed, 1);
assert.equal(workflow.status().externalExecutionEnabled, false);
assert.equal(workflow.status().paymentsEnabled, false);
assert.equal(workflow.status().publishingEnabled, false);
assert.ok(workflow.auditTrail().some(event => event.event === "MANUAL_RESULT_RECORDED"));
assert.ok(workflow.auditTrail().some(event => event.event === "RESULT_APPROVED"));
assert.throws(() => workflow.start({ requesterId: "client", need: "x", category: "content" }), /ao menos uma entrega/);
console.log("WordDark first-sale workflow integration tests passed.");
