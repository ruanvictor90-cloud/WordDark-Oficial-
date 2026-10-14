import assert from "node:assert/strict";
import {
  createFirestoreKnowledgeBackend,
  createFirestoreCentralKnowledgeStore
} from "./firestore-knowledge-adapters.js";
import { createDurableKnowledgeRepository } from "./durable-knowledge-repository.js";

function createFakeFirestore() {
  const data = new Map();
  const key = (collection, id) => collection + "/" + id;
  function ref(collection, id) {
    return {
      id,
      async get() {
        const value = data.get(key(collection, id));
        return { exists: value !== undefined, data: () => value ? structuredClone(value) : undefined };
      }
    };
  }
  function query(collection, field, expected, max = Infinity) {
    return {
      limit(value) { return query(collection, field, expected, value); },
      async get() {
        const docs = [...data.entries()]
          .filter(([path, value]) => path.startsWith(collection + "/") && value?.[field] === expected)
          .slice(0, max)
          .map(([path, value]) => ({ id: path.slice(collection.length + 1), data: () => structuredClone(value) }));
        return { docs, size: docs.length };
      }
    };
  }
  return {
    collection(name) {
      return {
        doc(id) { return { ...ref(name, id), _collection: name }; },
        where(field, operator, expected) {
          assert.equal(operator, "==");
          return query(name, field, expected);
        }
      };
    },
    async runTransaction(callback) {
      return callback({
        get: async document => {
          const value = data.get(key(document._collection, document.id));
          return { exists: value !== undefined, data: () => value ? structuredClone(value) : undefined };
        },
        create: (document, value) => {
          const path = key(document._collection, document.id);
          if (data.has(path)) throw new Error("ALREADY_EXISTS");
          data.set(path, structuredClone(value));
        },
        set: (document, value) => data.set(key(document._collection, document.id), structuredClone(value))
      });
    }
  };
}

const firestore = createFakeFirestore();
const backend = createFirestoreKnowledgeBackend({ firestore });
const repository = createDurableKnowledgeRepository({ backend });
const candidate = {
  knowledgeId: "WD-K-1", intakeRecordId: "DNET-1", type: "LEARNING",
  title: "Workflow guide", summary: "Durable searchable procedure", sourceId: "https://example.org/guide",
  sourceType: "DARKNET_EXTERNAL", status: "PROPOSED", version: "1.0.0", tags: ["workflow"],
  evidence: [{ rights: "PUBLIC" }], createdAt: "2026-10-14T00:00:00Z", validatedAt: null,
  metadata: { content: "Durable searchable procedure" }
};
assert.equal((await repository.insertIfAbsent("DNET-1", candidate)).inserted, true);
assert.equal((await repository.insertIfAbsent("DNET-1", candidate)).inserted, false);
assert.equal((await repository.get("DNET-1")).status, "PROPOSED");
assert.equal(await repository.compareAndSet("DNET-1", "REJECTED", candidate), false);
const validated = { ...candidate, status: "VALIDATED", validatedAt: "2026-10-14T01:00:00Z" };
assert.equal(await repository.compareAndSet("DNET-1", "PROPOSED", validated), true);
assert.equal((await repository.searchValidated("searchable"))[0].status, "VALIDATED");
assert.equal(await repository.countByStatus("VALIDATED"), 1);

class KnowledgeRecord {
  constructor(fields) { Object.assign(this, fields); }
  validate() {
    if (!this.knowledgeId || !this.title || !this.validatedAt) throw new Error("INVALID_KNOWLEDGE_RECORD");
  }
  isValidated() { return this.status === "VALIDATED"; }
  toJSON() { return { knowledgeId: this.knowledgeId, title: this.title, status: this.status, validatedAt: this.validatedAt }; }
}
const central = createFirestoreCentralKnowledgeStore({ firestore });
assert.equal(central.durable, true);
assert.equal(central.idempotent, true);
const record = new KnowledgeRecord({
  knowledgeId: "WD-K-1", title: "Workflow guide", status: "VALIDATED",
  validatedAt: "2026-10-14T01:00:00Z"
});
const first = await central.archive(record, { reason: "DARKNET_KNOWLEDGE_VALIDATED" });
const second = await central.archive(record, { reason: "retry" });
assert.equal(first.recordId, second.recordId);
assert.equal((await central.list()).length, 1);
assert.equal((await central.get("WD-K-1")).data.status, "VALIDATED");
assert.throws(() => createFirestoreKnowledgeBackend({ firestore: {} }), /FIRESTORE_TRANSACTIONAL_BACKEND_REQUIRED/);
console.log("firestore-knowledge-adapters.test: OK");
