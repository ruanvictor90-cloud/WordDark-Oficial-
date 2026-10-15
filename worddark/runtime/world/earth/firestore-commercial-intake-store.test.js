import test from "node:test";
import assert from "node:assert/strict";
import { createFirestoreCommercialIntakeStore } from "./firestore-commercial-intake-store.js";

function fakeFirestore() {
  const collections = new Map();
  const docRef = (collection, id) => ({
    id,
    collection,
    get key() { return collection + "/" + id; }
  });
  const firestore = {
    collection(name) {
      return {
        doc(id) {
          const actualId = id || "auto-" + Math.random().toString(36).slice(2);
          return docRef(name, actualId);
        }
      };
    },
    async runTransaction(callback) {
      const staged = [];
      const transaction = {
        async get(ref) {
          const data = collections.get(ref.key);
          return { exists: data !== undefined, data: () => data };
        },
        create(ref, data) {
          staged.push([ref.key, data]);
        }
      };
      const result = await callback(transaction);
      for (const [key, data] of staged) {
        if (collections.has(key)) throw new Error("ALREADY_EXISTS");
        collections.set(key, data);
      }
      return result;
    },
    _data: collections
  };
  return firestore;
}
const sample = (overrides = {}) => ({
  idempotencyKey: "customer-request-0001",
  intake: {
    intakeId: "intake-001", status: "RECEIVED", contactName: "Cliente",
    contactMethod: "cliente@example.test", need: "Conteúdo social",
    category: "conteudo", consent: true, receivedAt: "2026-10-15T12:00:00.000Z",
    requestId: "request-001"
  },
  auditEvent: {
    event: "COMMERCIAL_INTAKE_RECEIVED", requestId: "request-001",
    intakeId: "intake-001", status: "RECEIVED", at: "2026-10-15T12:00:00.000Z"
  },
  ...overrides
});

test("requires a server-side Firestore Admin instance", () => {
  assert.throws(() => createFirestoreCommercialIntakeStore(), /FIRESTORE_ADMIN_INSTANCE_REQUIRED/);
});

test("atomically stores intake, idempotency record and audit event", async () => {
  const firestore = fakeFirestore();
  const store = createFirestoreCommercialIntakeStore({ firestore, idFactory: () => "audit-001" });
  const result = await store.createIntakeOnce(sample());
  assert.equal(result.created, true);
  assert.equal(result.intake.intakeId, "intake-001");
  assert.equal(firestore._data.size, 3);
  assert.ok(firestore._data.has("commercialIntakes/intake-001"));
  assert.ok([...firestore._data.keys()].some(key => key.startsWith("commercialIdempotency/")));
  assert.ok(firestore._data.has("commercialAudit/audit-001"));
});

test("same key and same payload returns existing intake without duplicate writes", async () => {
  const firestore = fakeFirestore();
  const store = createFirestoreCommercialIntakeStore({ firestore, idFactory: () => "audit-001" });
  const first = await store.createIntakeOnce(sample());
  const replay = await store.createIntakeOnce(sample({
    intake: { ...sample().intake, intakeId: "intake-002", requestId: "request-002" },
    auditEvent: { ...sample().auditEvent, intakeId: "intake-002", requestId: "request-002" }
  }));
  assert.equal(first.created, true);
  assert.equal(replay.created, false);
  assert.equal(replay.intake.intakeId, "intake-001");
  assert.equal(firestore._data.size, 3);
});

test("same key with changed payload is rejected", async () => {
  const firestore = fakeFirestore();
  const store = createFirestoreCommercialIntakeStore({ firestore, idFactory: () => "audit-001" });
  await store.createIntakeOnce(sample());
  await assert.rejects(
    store.createIntakeOnce(sample({
      intake: { ...sample().intake, need: "Pedido diferente", intakeId: "intake-002" },
      auditEvent: { ...sample().auditEvent, intakeId: "intake-002" }
    })),
    /IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD/
  );
  assert.equal(firestore._data.size, 3);
});
