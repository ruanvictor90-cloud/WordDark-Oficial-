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
assert.equal(status.readiness.activationAllowed, false);
const firestoreShape = { collection: () => ({}), runTransaction: async () => {} };
const firestoreReady = inspectDarknetKnowledgeReadiness({ firestore: firestoreShape, createKnowledgeRecord: () => ({}), centralKnowledgeStore: { archive: async () => ({}), durable: true, idempotent: true } });
assert.ok(!firestoreReady.missing.includes("DURABLE_ATOMIC_REPOSITORY"), "injected Firestore should wire the durable repository adapter");
assert.ok(!firestoreReady.missing.includes("DURABLE_CANONICAL_KNOWLEDGE_ARCHIVE"), "injected Firestore should wire the canonical archive adapter");

const protectedRuntime = createDarknetKnowledgeRuntime({
  enabled: true,
  firestore: firestoreShape,
  externalConnectionGateway: { execute: async () => ({ success: true, result: { results: [] } }), getStatus: () => ({ adapters: ["RESEARCH_API"] }) },
  knowledgeConnections: [{ providerId: "RESEARCH_API", accountId: "account-1", capability: "KNOWLEDGE_RESEARCH" }],
  authenticateService: async request => {
    if (request?.serviceToken !== "test-secret") throw new Error("AUTH_REJECTED");
    return { authenticated: true, actorId: "reviewer-1", sessionId: "trusted-session" };
  },
  authorizeDarknet: async () => ({ allowed: true, approvalId: "DNET-APPROVAL" }),
  authorizeWordDark: async () => ({ allowed: true, approvalId: "WD-APPROVAL" }),
  authorizeReview: async () => ({ allowed: true, approvalId: "REVIEW-APPROVAL" }),
  authorizeKnowledgeRead: async () => ({ allowed: true, approvalId: "READ-APPROVAL" }),
  auditDarknet: async () => {},
  auditWordDark: async () => {},
  auditReview: async () => {},
  auditKnowledgeRead: async () => {},
  createKnowledgeRecord: fields => ({ ...fields, validate() {}, isValidated() { return this.status === "VALIDATED"; }, toJSON() { return { ...fields }; } }),
  centralKnowledgeStore: { durable: true, idempotent: true, archive: async () => ({ recordId: "ARCHIVED" }) }
});
const spoofedReview = await protectedRuntime.review({
  recordId: "DNET-FAKE", decision: "VALIDATE",
  requestContext: { authenticated: true, actorId: "forged", sessionId: "forged" }
});
assert.equal(spoofedReview.status, "TRUSTED_SERVICE_AUTHENTICATION_FAILED");
const spoofedRead = await protectedRuntime.searchValidated({
  query: "secret", requestContext: { authenticated: true, actorId: "forged", sessionId: "forged" }
});
assert.equal(spoofedRead.status, "TRUSTED_SERVICE_AUTHENTICATION_FAILED");
const authenticatedReview = await protectedRuntime.review({
  recordId: "DNET-UNKNOWN", decision: "VALIDATE", requestContext: { serviceToken: "test-secret" }
});
assert.equal(authenticatedReview.status, "DURABLE_KNOWLEDGE_READ_FAILED", "a trusted request must pass authentication before touching the repository");

console.log("darknet-knowledge-runtime.test: OK");
