import assert from "node:assert/strict";
import { createDarknetKnowledgeServerComposition } from "./darknet-knowledge-server-composition.js";

const records = new Map();
const repository = {
  durable: true, atomic: true, type: "composition-test-store",
  async insertIfAbsent(id, record) {
    if (records.has(id)) return { inserted: false, record: structuredClone(records.get(id)) };
    records.set(id, structuredClone(record));
    return { inserted: true, record: structuredClone(record) };
  },
  async get(id) { return records.has(id) ? structuredClone(records.get(id)) : null; },
  async compareAndSet(id, expected, next) {
    const current = records.get(id);
    if (!current || current.status !== expected) return false;
    records.set(id, structuredClone(next));
    return true;
  },
  async listByStatus(status, { limit = 100 } = {}) {
    return [...records.values()].filter(x => x.status === status).slice(0, limit).map(structuredClone);
  },
  async searchValidated(query, { limit = 10 } = {}) {
    const q = String(query || "").toLowerCase();
    return [...records.values()].filter(x => x.status === "VALIDATED" &&
      (!q || (x.title + " " + x.summary).toLowerCase().includes(q))).slice(0, limit).map(structuredClone);
  },
  async countByStatus(status) { return [...records.values()].filter(x => x.status === status).length; }
};

const connectionStore = {
  async load({ providerId, accountId }) {
    if (providerId !== "RESEARCH_API" || accountId !== "research-account") return null;
    return { providerId, accountId, status: "PERSISTED", capabilities: ["KNOWLEDGE_RESEARCH"], title: "Research account" };
  },
  async loadTokens() { return { access_token: "server-only-access-token" }; }
};
const audits = [];
let receivedCredential = false;
const runtime = createDarknetKnowledgeServerComposition({
  enabled: true,
  connectionStore,
  repository,
  knowledgeConnections: [{ providerId: "RESEARCH_API", accountId: "research-account", capability: "KNOWLEDGE_RESEARCH" }],
  providerHandlers: {
    RESEARCH_API: {
      search: async ({ query, credential }) => {
        assert.equal(query, "integration contract");
        receivedCredential = credential?.access_token === "server-only-access-token";
        return { results: [{
          sourceId: "doc-1", url: "https://example.org/doc-1",
          title: "Integration contract", content: "A verified public integration contract.",
          rights: "PUBLIC", tags: ["integration"]
        }] };
      }
    }
  },
  authenticateIncomingService: async context => context?.serviceToken === "server-test-token"
    ? { authenticated: true, actorId: "darknet-service", sessionId: "session-test" }
    : null,
  authorizeConnection: async () => ({ allowed: true, approvalId: "connection-approval" }),
  auditConnection: async event => { audits.push(event); },
  authorizeDarknet: async () => ({ allowed: true, approvalId: "darknet-approval" }),
  authorizeWordDark: async () => ({ allowed: true, approvalId: "worddark-approval" }),
  authorizeReview: async () => ({ allowed: true, approvalId: "review-approval" }),
  authorizeKnowledgeRead: async () => ({ allowed: true, approvalId: "read-approval" }),
  auditDarknet: async event => { audits.push(event); },
  auditWordDark: async event => { audits.push(event); },
  auditReview: async event => { audits.push(event); },
  auditKnowledgeRead: async event => { audits.push(event); },
  createKnowledgeRecord: fields => ({ ...fields, validate() {}, isValidated() { return this.status === "VALIDATED"; }, toJSON() { return { ...fields }; } }),
  centralKnowledgeStore: {
    durable: true, idempotent: true,
    async archive(record) { return { recordId: "ARCHIVE-" + record.knowledgeId }; }
  }
});

const denied = await runtime.runtime.learn({ providerId: "RESEARCH_API", query: "integration contract", requestContext: { authenticated: true, actorId: "spoofed", sessionId: "spoofed" } });
assert.equal(denied.status, "TRUSTED_SERVICE_IDENTITY_REQUIRED");
const learned = await runtime.runtime.learn({ providerId: "RESEARCH_API", query: "integration contract", limit: 5, requestContext: { serviceToken: "server-test-token" } });
assert.equal(learned.success, true, JSON.stringify(learned));
assert.equal(receivedCredential, true, "persisted credentials must reach the server-side provider only");
assert.ok(audits.some(event => event.event === "EXTERNAL_KNOWLEDGE_REQUEST_AUTHORIZED"));
assert.ok(!JSON.stringify(learned).includes("server-only-access-token"));
assert.equal((await runtime.getStatus()).readiness.ready, true);

console.log("darknet-knowledge-server-composition.test: OK");
