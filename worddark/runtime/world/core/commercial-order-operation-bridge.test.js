import assert from "node:assert/strict";
import { createCommercialOrderOperationBridge } from "./commercial-order-operation-bridge.js";

function memoryIdempotency() {
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

function makeCommercialEngine() {
  const order = {
    orderId: "order-bridge-1", proposalId: "proposal-bridge-1",
    companyId: "content-studio", sectorId: "earth", requesterId: "client-1",
    title: "Pacote de conteúdo", scope: "3 textos e 1 roteiro",
    amount: 75, currency: "BRL", recurrence: "ONE_TIME", deadline: null,
    status: "ORDER_OPEN"
  };
  const orders = new Map([[order.orderId, order]]);
  return {
    getOrder(id) { const item = orders.get(id); return item ? structuredClone(item) : null; },
    transitionOrder(id, status, actorId) {
      const item = orders.get(id);
      if (!item || item.status !== "ORDER_OPEN" || status !== "PLANNED") throw new Error("TRANSITION_NOT_ALLOWED");
      const next = { ...item, status, lastActorId: actorId };
      orders.set(id, next);
      return structuredClone(next);
    }
  };
}

function setup({ enabled = true, allowed = true, approved = true, coreSuccess = true, coreStatus = "ACCEPTED", operationId = "op-bridge-1" } = {}) {
  const commercial = makeCommercialEngine();
  const order = commercial.getOrder("order-bridge-1");
  const calls = { core: [], audit: [] };
  const bridge = createCommercialOrderOperationBridge({
    commercialEngine: commercial,
    operationCenter: { submit: async input => {
      calls.core.push(input);
      return coreSuccess ? { success: true, status: coreStatus, operationId } : { success: false, status: "REJECTED" };
    } },
    authenticateOperator: async () => ({ authenticated: true, actorId: "operator-1", sessionId: "session-1" }),
    authorizeDispatch: async ({ approvalId }) => ({ allowed, approved, approvalId }),
    resolveAction: async () => "CREATE_CONTENT",
    audit: async event => { calls.audit.push(event); },
    idempotencyStore: memoryIdempotency(),
    enabled
  });
  return { bridge, commercial, order, calls };
}

const disabled = setup({ enabled: false });
assert.equal((await disabled.bridge.dispatch({ requestId: "req-1", orderId: disabled.order.orderId, approvalId: "approval-1" })).status, "COMMERCIAL_ORDER_BRIDGE_DISABLED");
assert.equal(disabled.calls.core.length, 0);

const denied = setup({ allowed: false });
assert.equal((await denied.bridge.dispatch({ requestId: "req-2", orderId: denied.order.orderId, approvalId: "approval-1" })).status, "COMMERCIAL_DISPATCH_DENIED");
assert.equal(denied.calls.core.length, 0);

const unapproved = setup({ approved: false });
assert.equal((await unapproved.bridge.dispatch({ requestId: "req-3", orderId: unapproved.order.orderId, approvalId: "approval-1" })).status, "COMMERCIAL_ORDER_APPROVAL_REQUIRED");
assert.equal(unapproved.calls.core.length, 0);

const rejected = setup({ coreSuccess: false });
assert.equal((await rejected.bridge.dispatch({ requestId: "req-4", orderId: rejected.order.orderId, approvalId: "approval-1" })).status, "COMMERCIAL_CORE_REJECTED");
assert.equal(rejected.commercial.getOrder(rejected.order.orderId).status, "ORDER_OPEN");

const ready = setup();
const request = { requestId: "req-5", orderId: ready.order.orderId, approvalId: "approval-1" };
const result = await ready.bridge.dispatch(request);
assert.equal(result.success, true);
assert.equal(result.status, "COMMERCIAL_ORDER_DISPATCHED");
assert.equal(result.environment, "TEST");
assert.equal(ready.commercial.getOrder(ready.order.orderId).status, "PLANNED");
assert.equal(ready.calls.core.length, 1);
assert.equal(ready.calls.core[0].context.source, "TERRA_COMMERCIAL_ORDER");
assert.equal(ready.calls.core[0].context.commercialOrderId, ready.order.orderId);
assert.equal(ready.calls.core[0].action, "CREATE_CONTENT");
const duplicate = await ready.bridge.dispatch({ ...request, requestId: "req-6" });
assert.deepEqual(duplicate, result);
assert.equal(ready.calls.core.length, 1, "the same commercial order must not be dispatched twice");
assert.ok(ready.calls.audit.some(item => item.event === "COMMERCIAL_ORDER_DISPATCH_AUTHORIZED"));
assert.ok(ready.calls.audit.some(item => item.event === "COMMERCIAL_ORDER_CORE_ACCEPTED"));

const completed = setup({ coreStatus: "COMPLETED", operationId: "op-completed" });
const completedResult = await completed.bridge.dispatch({ requestId: "req-completed", orderId: completed.order.orderId, approvalId: "approval-1" });
assert.equal(completedResult.status, "COMMERCIAL_ORDER_REVIEW_REQUIRED");
assert.equal(completedResult.orderStatus, "REVIEW");
assert.equal(completed.commercial.getOrder(completed.order.orderId).status, "REVIEW",
  "Core completion must not bypass human review and delivery");

const missingOperationId = setup({ operationId: "" });
const noId = await missingOperationId.bridge.dispatch({ requestId: "req-7", orderId: missingOperationId.order.orderId, approvalId: "approval-1" });
assert.equal(noId.status, "COMMERCIAL_CORE_OPERATION_ID_REQUIRED");
assert.equal(missingOperationId.commercial.getOrder(missingOperationId.order.orderId).status, "ORDER_OPEN");

console.log("commercial-order-operation-bridge: OK");
