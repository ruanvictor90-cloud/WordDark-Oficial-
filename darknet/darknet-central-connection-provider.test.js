import assert from "node:assert/strict";
import { createCentralConnectionKnowledgeProvider } from "./darknet-central-connection-provider.js";

let calls = 0;
const provider = createCentralConnectionKnowledgeProvider({
  gateway: { execute: async (request, context) => {
    assert.deepEqual(context.requestContext, { authenticated: true, actorId: "darknet-service", sessionId: "session-1" });
    calls++;
    assert.equal(request.providerId, "RESEARCH_API");
    assert.equal(request.accountId, "acct-1");
    assert.equal(request.capability, "KNOWLEDGE_RESEARCH");
    assert.equal(request.action, "SEARCH_KNOWLEDGE");
    assert.deepEqual(request.payload, { query: "safe research", limit: 5 });
    return { success: true, result: { results: [{ id: "s1", title: "Guide" }] } };
  }},
  providerId: "research_api", accountId: "acct-1", capability: "KNOWLEDGE_RESEARCH",
  operationIdFactory: () => "REQ-1"
});
assert.equal(provider.id, "research_api");
const trustedContext = { authenticated: true, actorId: "darknet-service", sessionId: "session-1" };
assert.deepEqual(await provider.search({ query: "safe research", limit: 5, trustedContext }), [{ id: "s1", title: "Guide" }]);
assert.equal(calls, 1);
assert.equal(provider.getStatus().credentialsExposed, false);
const nested = createCentralConnectionKnowledgeProvider({
  gateway: { execute: async request => ({
    success: true,
    result: {
      success: true,
      status: request.action === "FETCH_KNOWLEDGE" ? "KNOWLEDGE_FETCH_COMPLETED" : "KNOWLEDGE_SEARCH_COMPLETED",
      result: request.action === "FETCH_KNOWLEDGE"
        ? { sourceId: "doc-2", url: "https://example.org/doc-2", title: "Full guide", content: "Full text", rights: "PUBLIC" }
        : { results: [{ sourceId: "doc-2", url: "https://example.org/doc-2", title: "Full guide", content: "Short text", rights: "PUBLIC" }] }
    }
  })},
  providerId: "research_api", accountId: "acct-1", capability: "KNOWLEDGE_RESEARCH",
  operationIdFactory: () => "REQ-NESTED"
});
assert.equal((await nested.search({ query: "nested" }))[0].sourceId, "doc-2");
assert.equal((await nested.fetch({ sourceId: "doc-2" })).content, "Full text");
const denied = createCentralConnectionKnowledgeProvider({
  gateway: { execute: async () => ({ success: false, status: "CAPABILITY_NOT_GRANTED" }) },
  providerId: "research_api", accountId: "acct-1", capability: "KNOWLEDGE_RESEARCH",
  operationIdFactory: () => "REQ-2"
});
await assert.rejects(() => denied.search({ query: "x" }), /CAPABILITY_NOT_GRANTED/);
assert.throws(() => createCentralConnectionKnowledgeProvider({ providerId: "p", accountId: "a" }), /capability concedida/);
console.log("darknet-central-connection-provider.test: OK");
