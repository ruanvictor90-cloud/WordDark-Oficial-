import assert from "node:assert/strict";
import { createFirestoreOperationControlStore } from "./firestore-operation-control-store.js";
import { createRuanHubControlRuntime } from "./ruan-hub-control-runtime.js";
import { createCommercialOrderOperationBridge } from "../commercial-order-operation-bridge.js";

function createTransactionalFirestore() {
  const collections = new Map();
  let idCounter = 0;
  let tail = Promise.resolve();
  const ref = (rows, id) => ({
    id,
    __rows: rows,
    async get() {
      const value = rows.get(id);
      return { exists: value !== undefined, data: () => value === undefined ? undefined : structuredClone(value) };
    },
    async create(value) {
      if (rows.has(id)) throw new Error("ALREADY_EXISTS");
      rows.set(id, structuredClone(value));
    }
  });
  return {
    collection(name) {
      if (!collections.has(name)) collections.set(name, new Map());
      const rows = collections.get(name);
      return { doc(id) { return ref(rows, id || "generated-" + (++idCounter)); } };
    },
    async runTransaction(callback) {
      let release;
      const previous = tail;
      tail = new Promise(resolve => { release = resolve; });
      await previous;
      const writes = [];
      const tx = {
        async get(document) { return document.get(); },
        create(document, value) { writes.push({ type: "create", document, value: structuredClone(value) }); },
        set(document, value) { writes.push({ type: "set", document, value: structuredClone(value) }); }
      };
      try {
        const result = await callback(tx);
        for (const write of writes) {
          const rows = write.document.__rows;
          if (write.type === "create" && rows.has(write.document.id)) throw new Error("ALREADY_EXISTS");
          rows.set(write.document.id, structuredClone(write.value));
        }
        return result;
      } finally { release(); }
    }
  };
}

const controls = createFirestoreOperationControlStore({ firestore: createTransactionalFirestore() });
const audits = [];
const audit = async event => { audits.push(event); return controls.audit(event); };
audit.durable = true;
let hubSubmissions = 0;
const hub = createRuanHubControlRuntime({
  enabled: true,
  authenticateOperator: async context => context?.token === "trusted-hub-test"
    ? { authenticated: true, actorId: "operator-1", sessionId: "session-hub-1" }
    : null,
  authorizeRequest: async () => ({ allowed: true, approved: true, approvalId: "HUB-APPROVAL-1" }),
  audit,
  idempotencyStore: controls.idempotencyStore,
  capabilityCatalog: { listPublic: () => [{ capability: "KNOWLEDGE_RESEARCH" }] },
  listOperations: async () => [],
  operationCenter: {
    submit() {
      hubSubmissions++;
      return { success: true, status: "OPERATION_ACCEPTED", operationId: "OP-HUB-1" };
    },
    getStatus() { return { status: "READY", environment: "TEST", activeOperations: 1 }; }
  }
});
assert.equal(hub.getStatus().readiness.ready, true);
const hubRequest = {
  requestId: "hub-request-1", source: "RUAN_HUB", destination: "WORDDARK",
  action: "SUBMIT_NEED", need: "Prepare a sample deliverable"
};
const hubFirst = await hub.handle(hubRequest, { token: "trusted-hub-test" });
const hubReplay = await hub.handle(hubRequest, { token: "trusted-hub-test" });
assert.equal(hubFirst.worldAccepted, true);
assert.equal(hubReplay.operationId, hubFirst.operationId);
assert.equal(hubSubmissions, 1, "the same Hub request must not submit twice");

let coreSubmissions = 0;
const order = {
  orderId: "ORDER-1", status: "ORDER_OPEN", companyId: "company-1",
  requesterId: "client-1", proposalId: "PROPOSAL-1",
  title: "Three social posts", scope: "Write three short posts",
  amount: 75, currency: "BRL", contentType: "TEXT", deadline: null, recurrence: "ONE_TIME"
};
const commercialEngine = {
  getOrder(id) { return id === order.orderId ? structuredClone(order) : null; },
  transitionOrder(id, status) {
    if (id !== order.orderId) throw new Error("ORDER_NOT_FOUND");
    order.status = status;
    return structuredClone(order);
  }
};
const bridge = createCommercialOrderOperationBridge({
  commercialEngine,
  operationCenter: {
    async submit() {
      coreSubmissions++;
      return { success: true, status: "COMPLETED", operationId: "OP-COMMERCIAL-1" };
    }
  },
  authenticateOperator: async context => context?.token === "trusted-commercial-test"
    ? { authenticated: true, actorId: "operator-1", sessionId: "session-commercial-1" }
    : null,
  authorizeDispatch: async () => ({ allowed: true, approved: true, approvalId: "COMM-APPROVAL-1" }),
  resolveAction: async () => "CONTENT_CREATE",
  audit: controls.audit,
  idempotencyStore: controls.idempotencyStore,
  enabled: true
});
const commercialRequest = {
  requestId: "commercial-request-1", orderId: "ORDER-1", approvalId: "COMM-APPROVAL-1"
};
const commercialFirst = await bridge.dispatch(commercialRequest, { token: "trusted-commercial-test" });
const commercialReplay = await bridge.dispatch(commercialRequest, { token: "trusted-commercial-test" });
assert.equal(commercialFirst.status, "COMMERCIAL_ORDER_REVIEW_REQUIRED");
assert.equal(commercialReplay.operationId, commercialFirst.operationId);
assert.equal(coreSubmissions, 1, "the same accepted order must not be dispatched twice");
assert.equal(order.status, "REVIEW", "internal completion must stop at human review");
assert.ok(audits.length >= 4, "both boundaries must emit audit events");
assert.equal(controls.getStatus().durable, true);
console.log("operation-control-integration.test: OK");
