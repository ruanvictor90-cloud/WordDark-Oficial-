import assert from "node:assert/strict";
import { createDarknetKnowledgeRuntime, inspectDarknetKnowledgeReadiness } from "./darknet-knowledge-runtime.js";

const missing = inspectDarknetKnowledgeReadiness();
assert.equal(missing.ready, false);
assert.ok(missing.missing.includes("DURABLE_ATOMIC_REPOSITORY"));
assert.ok(missing.missing.includes("TRUSTED_SERVICE_AUTHENTICATOR"));
assert.throws(() => createDarknetKnowledgeRuntime({ enabled: true }), /DARKNET_KNOWLEDGE_RUNTIME_NOT_READY/);
const disabled = createDarknetKnowledgeRuntime();
assert.equal((await disabled.learn({ providerId: "x", query: "y" })).status, "DARKNET_KNOWLEDGE_RUNTIME_DISABLED");
const status = await disabled.getStatus();
assert.equal(status.activation, "DISABLED");
assert.equal(status.readiness.activationAllowed, false);\nconst firestoreShape = { collection: () => ({}), runTransaction: async () => {} };\nconst firestoreReady = inspectDarknetKnowledgeReadiness({ firestore: firestoreShape, createKnowledgeRecord: () => ({}), centralKnowledgeStore: { archive: async () => ({}), durable: true, idempotent: true } });\nassert.ok(!firestoreReady.missing.includes("DURABLE_ATOMIC_REPOSITORY"), "injected Firestore should wire the durable repository adapter");\nassert.ok(!firestoreReady.missing.includes("DURABLE_CANONICAL_KNOWLEDGE_ARCHIVE"), "injected Firestore should wire the canonical archive adapter");
console.log("darknet-knowledge-runtime.test: OK");
