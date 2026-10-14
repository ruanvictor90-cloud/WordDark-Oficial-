import assert from "node:assert/strict";
import { createKnowledgeSearchAdapter, registerKnowledgeSearchAdapter } from "./knowledge-search-adapter.js";

let searchCalls = 0, fetchCalls = 0;
const adapter = createKnowledgeSearchAdapter({
  providerId: "RESEARCH_API",
  search: async ({ query, limit, credential }) => {
    searchCalls++;
    assert.equal(query, "how to organize a workflow");
    assert.equal(limit, 2);
    assert.equal(credential, "runtime-secret");
    return { results: [
      { id: "doc-1", url: "https://example.org/1", title: "Workflow", content: "Steps", rights: "PUBLIC" },
      { id: "doc-2", url: "https://example.org/2", title: "Checklist", content: "Checklist", rights: "LICENSED", license: "License A" },
      { id: "doc-3", url: "https://example.org/3", title: "Extra", content: "Limited" }
    ] };
  },
  fetchSource: async ({ sourceId }) => {
    fetchCalls++;
    assert.equal(sourceId, "doc-1");
    return { id: sourceId, url: "https://example.org/1", title: "Workflow", content: "Full article", rights: "PUBLIC" };
  },
  now: () => "2026-10-14T00:00:00Z"
});
const context = { account: { id: "acct-1" }, credential: "runtime-secret" };
const request = { providerId: "RESEARCH_API", capability: "KNOWLEDGE_RESEARCH", action: "SEARCH_KNOWLEDGE", requestId: "REQ-1", payload: { query: "how to organize a workflow", limit: 2 } };
const result = await adapter.execute(request, context);
assert.equal(result.status, "KNOWLEDGE_SEARCH_COMPLETED");
assert.equal(result.result.results.length, 2);
assert.equal(result.result.results[0].sourceId, "doc-1");
assert.equal(result.result.results[0].rights, "PUBLIC");
assert.equal(searchCalls, 1);
assert.equal((await adapter.execute({ ...request, capability: "CONTENT_PUBLICATION" }, context)).status, "KNOWLEDGE_CAPABILITY_REQUIRED");
assert.equal((await adapter.execute({ ...request, providerId: "OTHER" }, context)).status, "KNOWLEDGE_PROVIDER_MISMATCH");
assert.equal((await adapter.execute({ ...request, payload: { query: "", limit: 2 } }, context)).status, "KNOWLEDGE_QUERY_INVALID");
const fetched = await adapter.execute({ providerId: "RESEARCH_API", capability: "KNOWLEDGE_RESEARCH", action: "FETCH_KNOWLEDGE", requestId: "REQ-2", payload: { sourceId: "doc-1" } }, context);
assert.equal(fetched.status, "KNOWLEDGE_FETCH_COMPLETED");
assert.equal(fetched.result.content, "Full article");
assert.equal(fetchCalls, 1);
const invalidFetch = createKnowledgeSearchAdapter({
  providerId: "RESEARCH_API",
  search: async () => [],
  fetchSource: async () => ({ id: "doc-bad", url: "https://example.org/bad", title: "Unlicensed", content: "Must not be accepted" })
});
assert.equal((await invalidFetch.execute({
  providerId: "RESEARCH_API", capability: "KNOWLEDGE_RESEARCH", action: "FETCH_KNOWLEDGE",
  requestId: "REQ-3", payload: { sourceId: "doc-bad" }
}, context)).status, "KNOWLEDGE_SOURCE_METADATA_INVALID");
let registered = null;
assert.deepEqual(registerKnowledgeSearchAdapter({
  gateway: { registerAdapter: (id, value) => { registered = { id, value }; return { success: true, status: "ADAPTER_REGISTERED" }; } },
  providerId: "RESEARCH_API", search: async () => []
}), { success: true, status: "ADAPTER_REGISTERED" });
assert.equal(registered.id, "RESEARCH_API");
assert.equal(registered.value.getStatus().credentialsExposed, false);
console.log("knowledge-search-adapter.test: OK");
