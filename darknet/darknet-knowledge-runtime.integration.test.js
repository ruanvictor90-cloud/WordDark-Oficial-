import assert from "node:assert/strict";
import Registry from "../worddark/runtime/world/core/connections/connection-registry.js";
import Gateway from "../worddark/runtime/world/core/connections/connection-gateway.js";
import { registerKnowledgeSearchAdapter } from "../worddark/runtime/world/core/connections/knowledge-search-adapter.js";
import { createDarknetKnowledgeRuntime } from "./darknet-knowledge-runtime.js";

function createStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
}

function createAtomicBackend() {
  const records = new Map();
  return {
    durable: true,
    atomic: true,
    type: "integration-test-double",
    async insertIfAbsent(id, record) {
      if (records.has(id)) return { inserted: false, record: structuredClone(records.get(id)) };
      records.set(id, structuredClone(record));
      return { inserted: true, record: structuredClone(record) };
    },
    async get(id) { return records.has(id) ? structuredClone(records.get(id)) : null; },
    async compareAndSet(id, expectedStatus, nextRecord) {
      const current = records.get(id);
      if (!current || current.status !== expectedStatus) return false;
      records.set(id, structuredClone(nextRecord));
      return true;
    },
    async listByStatus(status, { limit = 100 } = {}) {
      return [...records.values()].filter(record => record.status === status).slice(0, limit).map(record => structuredClone(record));
    },
    async searchValidated(query, { limit = 10 } = {}) {
      const terms = String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
      return [...records.values()]
        .filter(record => record.status === "VALIDATED")
        .filter(record => !terms.length || terms.every(term =>
          [record.title, record.summary, record.metadata?.content, ...(record.tags || [])].join(" ").toLowerCase().includes(term)))
        .slice(0, limit)
        .map(record => structuredClone(record));
    },
    async countByStatus(status) { return [...records.values()].filter(record => record.status === status).length; }
  };
}

const storage = createStorage();
const registry = new Registry(storage);
storage.setItem("wd.external.connections", JSON.stringify([{
  providerId: "RESEARCH_API",
  accountId: "research-account",
  status: "CONNECTED",
  capabilities: ["KNOWLEDGE_RESEARCH"]
}]));
assert.equal(registry.setRuntimeCredential("RESEARCH_API", "research-account", "test-only-secret"), true);

const gateway = new Gateway({ registry, enabled: true });
registerKnowledgeSearchAdapter({
  gateway,
  providerId: "RESEARCH_API",
  search: async ({ query, limit, credential }) => {
    assert.equal(query, "workflow review");
    assert.equal(limit, 5);
    assert.equal(credential, "test-only-secret");
    return { results: [{
      sourceId: "guide-1",
      url: "https://example.org/workflow-guide",
      title: "Workflow guide",
      content: "A repeatable workflow review procedure.",
      rights: "PUBLIC",
      language: "en",
      tags: ["workflow", "review"]
    }] };
  }
});

const auditEvents = [];
const archived = new Map();
const backend = createAtomicBackend();
const runtime = createDarknetKnowledgeRuntime({
  enabled: true,
  externalConnectionGateway: gateway,
  knowledgeConnections: [{
    providerId: "RESEARCH_API",
    accountId: "research-account",
    capability: "KNOWLEDGE_RESEARCH",
    operationIdFactory: () => "DNET-TEST-REQUEST-1"
  }],
  repository: backend,
  authenticateService: async context => {
    if (context?.serviceToken !== "integration-test-token") throw new Error("AUTH_REJECTED");
    return { authenticated: true, actorId: "test-operator", sessionId: "trusted-test-session" };
  },
  authorizeDarknet: async () => ({ allowed: true, approvalId: "DNET-APPROVAL-1" }),
  authorizeWordDark: async () => ({ allowed: true, approvalId: "WD-APPROVAL-1" }),
  authorizeReview: async ({ decision }) => ({ allowed: true, approvalId: decision === "VALIDATE" ? "REVIEW-APPROVAL-1" : null }),
  authorizeKnowledgeRead: async () => ({ allowed: true, approvalId: "READ-APPROVAL-1" }),
  auditDarknet: async event => { auditEvents.push(event); },
  auditWordDark: async event => { auditEvents.push(event); },
  auditReview: async event => { auditEvents.push(event); },
  auditKnowledgeRead: async event => { auditEvents.push(event); },
  createKnowledgeRecord: fields => ({
    ...fields,
    validate() {
      if (!this.knowledgeId || !this.title || !this.validatedAt) throw new Error("INVALID_KNOWLEDGE_RECORD");
    },
    isValidated() { return this.status === "VALIDATED"; },
    toJSON() {
      return {
        knowledgeId: this.knowledgeId,
        title: this.title,
        summary: this.summary,
        status: this.status,
        validatedAt: this.validatedAt,
        sourceId: this.sourceId,
        evidence: this.evidence,
        metadata: this.metadata
      };
    }
  }),
  centralKnowledgeStore: {
    durable: true,
    idempotent: true,
    async archive(record) {
      record.validate();
      if (!record.isValidated()) throw new Error("VALIDATED_RECORD_REQUIRED");
      const recordId = "KNOWLEDGE-" + record.knowledgeId;
      if (!archived.has(recordId)) archived.set(recordId, record.toJSON());
      return { success: true, recordId };
    }
  },
  now: () => "2026-10-14T00:00:00.000Z"
});

const requestContext = { serviceToken: "integration-test-token" };
const learned = await runtime.learn({
  providerId: "RESEARCH_API",
  query: "workflow review",
  limit: 5,
  requestContext
});
assert.equal(learned.success, true);
assert.equal(learned.status, "KNOWLEDGE_RECEIVED_PENDING_REVIEW");
assert.equal(learned.received, 1);
const recordId = learned.outcomes[0].recordId;
assert.ok(recordId.startsWith("DNET-KNOW-"));

const pending = await runtime.listPending({ requestContext });
assert.equal(pending.success, true);
assert.equal(pending.records.length, 1);
assert.equal(pending.records[0].status, "PROPOSED");

const reviewed = await runtime.review({
  recordId,
  decision: "VALIDATE",
  reason: "Integration test validates the source and declared rights.",
  requestContext
});
assert.equal(reviewed.success, true);
assert.equal(reviewed.status, "KNOWLEDGE_VALIDATED_AND_ARCHIVED");
assert.equal(archived.size, 1);

const results = await runtime.searchValidated({ query: "repeatable procedure", requestContext });
assert.equal(results.success, true);
assert.equal(results.records.length, 1);
assert.equal(results.records[0].status, "VALIDATED");
assert.equal(auditEvents.some(event => event.event === "DARKNET_KNOWLEDGE_SEARCH_AUTHORIZED"), true);
assert.equal(auditEvents.some(event => event.event === "WORDDARK_KNOWLEDGE_VALIDATED_AND_ARCHIVED"), true);

const status = await runtime.getStatus();
assert.equal(status.readiness.ready, true);
assert.equal(status.activation, "ENABLED_BY_TRUSTED_BACKEND_CONFIGURATION");
assert.equal(JSON.stringify(status).includes("test-only-secret"), false);
console.log("darknet-knowledge-runtime.integration.test: OK");
