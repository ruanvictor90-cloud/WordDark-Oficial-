import assert from "node:assert/strict";
import { createEarthCommercialIntakeAdapter } from "./earth-commercial-intake-adapter.js";
import { createCommercialOrderOperationBridge } from "./commercial-order-operation-bridge.js";

const { createEarthEngine } = await import("../earth/earth-engine.js");
const { createCommercialEngine } = await import("../earth/commercial-engine.js");

function idempotencyStore() {
  const results = new Map();
  return {
    async executeOnce(key, handler) {
      if (results.has(key)) return results.get(key);
      const result = await handler();
      results.set(key, result);
      return result;
    }
  };
}

const earth = createEarthEngine({
  now: () => "2026-10-14T00:00:00.000Z",
  idFactory: () => "demand-pilot-001"
});
const commercial = createCommercialEngine({
  companyId: "content-studio",
  companyName: "Content Studio",
  now: () => "2026-10-14T00:00:00.000Z",
  idFactory: (() => { let i = 0; return () => String(++i); })()
});
const audits = [];
const idempotency = idempotencyStore();
const demand = earth.captureDemand({
  requester: "Cliente piloto",
  need: "Pacote de conteúdo básico",
  category: "content",
  budget: 100,
  deadline: "2026-10-20",
  recurrence: "ONE_TIME",
  businessContext: { source: "manual-prospecting", pilot: true }
});

const intake = createEarthCommercialIntakeAdapter({
  earthEngine: earth,
  commercialEngine: commercial,
  authenticateOperator: async () => ({ authenticated: true, actorId: "operator-1", sessionId: "session-1" }),
  authorizeIntake: async () => ({ allowed: true }),
  resolveRequester: async source => ({ requesterId: "client-pilot-001", name: source.requester, channel: "MANUAL" }),
  audit: async event => { audits.push(event); },
  idempotencyStore: idempotency,
  enabled: true
});

const intakeResult = await intake.intake({ requestId: "intake-pilot-001", demandId: demand.demandId });
assert.equal(intakeResult.status, "LEAD_CREATED");
const lead = commercial.getLead(intakeResult.leadId);
assert.equal(lead.sourceDemandId, demand.demandId);
assert.equal(lead.businessContext.pilot, true);
assert.equal(earth.getDemand(demand.demandId).status, "LEAD_CREATED");

commercial.qualifyLead(lead.leadId, "operator-1");
commercial.createProposal({
  proposalId: "proposal-pilot-001",
  leadId: lead.leadId,
  title: "Pacote de conteúdo básico",
  scope: "3 textos de publicação, 1 roteiro curto, 1 bio/descrição de perfil e 1 rodada de ajustes",
  amount: 75
});
commercial.decideProposal("proposal-pilot-001", "ACCEPTED", "client-pilot-001");
const order = commercial.openOrder("proposal-pilot-001");

const coreCalls = [];
const dispatch = createCommercialOrderOperationBridge({
  commercialEngine: commercial,
  operationCenter: { submit: async operation => {
    coreCalls.push(operation);
    assert.equal(operation.type, "OPERATION");
    assert.equal(operation.context.source, "TERRA_COMMERCIAL_ORDER");
    assert.equal(operation.context.commercialOrderId, order.orderId);
    return { success: true, status: "COMPLETED", operationId: "OP-PILOT-001" };
  } },
  authenticateOperator: async () => ({ authenticated: true, actorId: "operator-1", sessionId: "session-1" }),
  authorizeDispatch: async ({ approvalId }) => ({ allowed: true, approved: true, approvalId }),
  resolveAction: async () => "CREATE_CONTENT",
  audit: async event => { audits.push(event); },
  idempotencyStore: idempotency,
  enabled: true
});

const dispatchResult = await dispatch.dispatch({
  requestId: "dispatch-pilot-001",
  orderId: order.orderId,
  approvalId: "approval-pilot-001"
});
assert.equal(dispatchResult.status, "COMMERCIAL_ORDER_REVIEW_REQUIRED");
assert.equal(dispatchResult.operationId, "OP-PILOT-001");
assert.equal(commercial.getOrder(order.orderId).status, "REVIEW");
assert.equal(coreCalls.length, 1);
assert.equal(commercial.status().paymentEnabled, false);
assert.equal(commercial.status().externalExecutionEnabled, false);

const repeatedIntake = await intake.intake({ requestId: "intake-pilot-002", demandId: demand.demandId });
const repeatedDispatch = await dispatch.dispatch({
  requestId: "dispatch-pilot-002",
  orderId: order.orderId,
  approvalId: "approval-pilot-001"
});
assert.deepEqual(repeatedIntake, intakeResult);
assert.deepEqual(repeatedDispatch, dispatchResult);
assert.equal(commercial.listLeads().length, 1);
assert.equal(coreCalls.length, 1);
assert.ok(audits.some(event => event.event === "EARTH_DEMAND_LINKED_TO_COMMERCIAL_LEAD"));
assert.ok(audits.some(event => event.event === "COMMERCIAL_ORDER_CORE_ACCEPTED"));

console.log("Terra demand → commercial order → WordDark Core handoff integration: OK");
