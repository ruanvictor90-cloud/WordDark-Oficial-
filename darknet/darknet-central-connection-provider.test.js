import assert from "node:assert/strict";
import { createCentralConnectionKnowledgeProvider } from "./darknet-central-connection-provider.js";

let calls = 0;
const provider = createCentralConnectionKnowledgeProvider({
  gateway: { execute: async request => {
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
assert.deepEqual(await provider.search({ query: "safe research", limit: 5 }), [{ id: "s1", title: "Guide" }]);
assert.equal(calls, 1);
assert.equal(provider.getStatus().credentialsExposed, false);
const denied = createCentralConnectionKnowledgeProvider({
  gateway: { execute: async () => ({ success: false, status: "CAPABILITY_NOT_GRANTED" }) },
  providerId: "research_api", accountId: "acct-1", capability: "KNOWLEDGE_RESEARCH",
  operationIdFactory: () => "REQ-2"
});
await assert.rejects(() => denied.search({ query: "x" }), /CAPABILITY_NOT_GRANTED/);
assert.throws(() => createCentralConnectionKnowledgeProvider({ providerId: "p", accountId: "a" }), /capability concedida/);
console.log("darknet-central-connection-provider.test: OK");
