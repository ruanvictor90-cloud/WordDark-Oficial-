import assert from "node:assert/strict";
import { createFirestoreOperationControlStore } from "./firestore-operation-control-store.js";

// Use a minimal transactional Firestore fake whose transaction writes are atomic.
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

const store = createFirestoreOperationControlStore({
  firestore: createTransactionalFirestore(),
  now: () => "2026-10-14T00:00:00.000Z"
});
assert.equal(store.idempotencyStore.durable, true);
assert.equal(store.idempotencyStore.atomic, true);
assert.equal(store.audit.durable, true);

let callbackCount = 0;
let releaseCallback;
let markCallbackStarted;
const callbackStarted = new Promise(resolve => { markCallbackStarted = resolve; });
const blockedCallback = new Promise(resolve => { releaseCallback = resolve; });
const first = store.idempotencyStore.executeOnce("RUAN_HUB:req-1", async () => {
  callbackCount++;
  markCallbackStarted();
  await blockedCallback;
  return { success: true, status: "OPERATION_ACCEPTED", operationId: "op-1", access_token: "never-persist" };
}, { fingerprint: '{"action":"SUBMIT_NEED","need":"sample"}' });

await callbackStarted;
const duplicateInFlight = await store.idempotencyStore.executeOnce(
  "RUAN_HUB:req-1",
  async () => { callbackCount++; return { success: true, status: "DUPLICATE_SIDE_EFFECT" }; },
  { fingerprint: '{"action":"SUBMIT_NEED","need":"sample"}' }
);
assert.equal(duplicateInFlight.status, "IDEMPOTENCY_IN_PROGRESS");
assert.equal(callbackCount, 1);
releaseCallback();
const firstResult = await first;
assert.equal(firstResult.status, "OPERATION_ACCEPTED");
assert.equal(firstResult.access_token, undefined);

const replay = await store.idempotencyStore.executeOnce(
  "RUAN_HUB:req-1",
  async () => { callbackCount++; return { success: true }; },
  { fingerprint: '{"action":"SUBMIT_NEED","need":"sample"}' }
);
assert.equal(replay.operationId, "op-1");
assert.equal(callbackCount, 1);

await assert.rejects(
  store.idempotencyStore.executeOnce("RUAN_HUB:req-1", async () => ({}), {
    fingerprint: '{"action":"SUBMIT_NEED","need":"different"}'
  }),
  error => error.code === "IDEMPOTENCY_CONFLICT"
);

const audited = await store.audit({
  event: "OPERATION_COMPLETED",
  actorId: "operator-1",
  requestId: "req-1",
  access_token: "do-not-store",
  payload: "do-not-store"
});
assert.equal(audited.recorded, true);
assert.equal(store.getStatus().appendOnlyAudit, true);
console.log("firestore-operation-control-store.test: OK");
