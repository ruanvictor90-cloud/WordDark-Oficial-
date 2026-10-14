import assert from "node:assert/strict";
import { createPersistedKnowledgeGateway } from "../worddark/runtime/world/core/connections/persisted-knowledge-gateway.js";
import { createKnowledgeSearchAdapter } from "../worddark/runtime/world/core/connections/knowledge-search-adapter.js";
import { createDarknetKnowledgeRuntime } from "./darknet-knowledge-runtime.js";

const intake = new Map();
const archived = new Map();
const auditEvents = [];
const repository = {
  durable: true, atomic: true, type: "integration-test-atomic-store",
  async insertIfAbsent(id, record) {
    if (intake.has(id)) return { inserted: false, record: intake.get(id) };
    intake.set(id, structuredClone(record));
    return { inserted: true, record: structuredClone(record) };
  },
  async get(id) { return intake.has(id) ? structuredClone(intake.get(id)) : null; },
  async compareAndSet(id, expectedStatus, nextRecord) {
    const current = intake.get(id);
    if (!current || current.status !== expectedStatus) return false;
    intake.set(id, structuredClone(nextRecord));
    return true;
  },
  async listByStatus(status, { limit = 100 } = {}) { return [...intake.values()].filter(row => row.status === status).slice(0, limit).map(row => structuredClone(row)); },
  async searchValidated(query, { limit = 10 } = {}) {
    const terms = String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
    return [...intake.values()].filter(row => row.status === "VALIDATED")
      .filter(row => terms.every(term => [row.title, row.summary, row.metadata?.content].join(" ").toLowerCase().includes(term)))
      .slice(0, limit).map(row => structuredClone(row));
  },
  async countByStatus(status) { return [...intake.values()].filter(row => row.status === status).length; }
};
const connectionStore = {
  async load({ providerId, accountId }) {
    if (providerId !== "RESEARCH_API" || accountId !== "ACCOUNT-1") return null;
    return { providerId, accountId, status: "PERSISTED", capabilities: ["KNOWLEDGE_RESEARCH"], title: "Configured research provider" };
  },
  async loadTokens() { return { access_token: "SERVER_SIDE_ACCESS_SECRET", refresh_token: "SERVER_SIDE_REFRESH_SECRET" }; }
};
const providerAdapter = createKnowledgeSearchAdapter({
  providerId: "RESEARCH_API",
  search: async ({ query, credential }) => {
    assert.equal(query, "repeatable procedure");
    assert.equal(credential.access_token, "SERVER_SIDE_ACCESS_SECRET");
    return { results: [{
      sourceId: "DOC-1",
      url: "https://example.org/repeatable-procedure",
      title: "Repeatable procedure",
      content: "A repeatable procedure for the operation.",
      rights: "PUBLIC",
      tags: ["operations"]
    }] };
  }
});
const gateway = createPersistedKnowledgeGateway({
  connectionStore,
  adapters: { RESEARCH_API: providerAdapter },
  authenticateService: async context => context?.authenticated === true && context?.actorId && context?.sessionId ? context : null,
  authorize: async ({ capability }) => ({ allowed: capability === "KNOWLEDGE_RESEARCH", approvalId: "GATEWAY-APPROVAL" }),
  audit: async event => { auditEvents.push(event); },
  enabled: true
});
const centralKnowledgeStore = {
  durable: true, idempotent: true,
  async archive(record) {
    if (!record.isValidated()) throw new Error("VALIDATED_RECORD_REQUIRED");
    const recordId = "KNOWLEDGE-" + record.knowledgeId;
    if (!archived.has(recordId)) archived.set(recordId, record.toJSON());
    return { recordId };
  }
};
const runtime = createDarknetKnowledgeRuntime({
  enabled: true,
  externalConnectionGateway: gateway,
  knowledgeConnections: [{ providerId: "RESEARCH_API", accountId: "ACCOUNT-1", capability: "KNOWLEDGE_RESEARCH" }],
  repository,
  centralKnowledgeStore,
  createKnowledgeRecord: fields => ({
    ...fields,
    validate() { if (this.status !== "VALIDATED" || !this.knowledgeId) throw new Error("KNOWLEDGE_RECORD_INVALID"); },
    isValidated() { return this.status === "VALIDATED"; },
    toJSON() { return { ...fields, status: this.status, validatedAt: this.validatedAt }; }
  }),
  authenticateService: async context => context?.serviceToken === "integration-secret"
    ? { authenticated: true, actorId: "operator-integration", sessionId: "session-integration" }
    : null,
  authorizeDarknet: async () => ({ allowed: true, approvalId: "DARKNET-APPROVAL" }),
  authorizeWordDark: async () => ({ allowed: true, approvalId: "WORDDARK-APPROVAL" }),
  authorizeReview: async () => ({ allowed: true, approvalId: "REVIEW-APPROVAL" }),
  authorizeKnowledgeRead: async () => ({ allowed: true, approvalId: "READ-APPROVAL" }),
  auditDarknet: async event => { auditEvents.push(event); },
  auditWordDark: async event => { auditEvents.push(event); },
  auditReview: async event => { auditEvents.push(event); },
  auditKnowledgeRead: async event => { auditEvents.push(event); }
});
const requestContext = { serviceToken: "integration-secret" };
const learned = await runtime.learn({ providerId: "research_api", query: "repeatable procedure", requestContext });
assert.equal(learned.success, true);
assert.equal(learned.received, 1);
assert.equal(learned.status, "KNOWLEDGE_RECEIVED_PENDING_REVIEW");
const recordId = learned.outcomes[0].recordId;
const pending = await runtime.listPending({ requestContext });
assert.equal(pending.success, true);
assert.equal(pending.records.length, 1);
assert.equal(pending.records[0].status, "PROPOSED");
const reviewed = await runtime.review({ recordId, decision: "VALIDATE", reason: "Source rights and provenance verified.", requestContext });
assert.equal(reviewed.success, true);
assert.equal(reviewed.status, "KNOWLEDGE_VALIDATED_AND_ARCHIVED");
assert.equal(archived.size, 1);
const found = await runtime.searchValidated({ query: "repeatable procedure", requestContext });
assert.equal(found.success, true);
assert.equal(found.records.length, 1);
assert.equal(found.records[0].status, "VALIDATED");
assert.equal(JSON.stringify({ learned, pending, reviewed, found }).includes("SERVER_SIDE_ACCESS_SECRET"), false);
assert.equal(JSON.stringify({ learned, pending, reviewed, found }).includes("SERVER_SIDE_REFRESH_SECRET"), false);
assert.equal(auditEvents.some(event => event.event === "EXTERNAL_KNOWLEDGE_REQUEST_AUTHORIZED"), true);
assert.equal(auditEvents.some(event => event.event === "WORDDARK_KNOWLEDGE_VALIDATED_AND_ARCHIVED"), true);
console.log("darknet-knowledge-persisted-gateway.integration.test: OK");
