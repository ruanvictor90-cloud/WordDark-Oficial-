import assert from "node:assert/strict";
import { createDarknetKnowledgePipeline } from "./darknet-knowledge-pipeline.js";

let calls = 0, audits = 0;
const received = [];
const pipeline = createDarknetKnowledgePipeline({
  enabled: true,
  providers: [{ id: "public-search", search: async ({ query, limit, trustedContext: providerContext }) => {
    assert.deepEqual(providerContext, trustedContext);
    calls++;
    assert.equal(query, "workflow automation");
    assert.equal(limit, 3);
    return [
      { id: "src-1", url: "https://example.org/a", title: "Public guide", content: "A useful guide.", rights: "PUBLIC", tags: ["guide"] },
      { id: "src-2", url: "http://unsafe.example/b", title: "Unsafe source", content: "Reject this.", rights: "PUBLIC" },
      { id: "src-3", url: "https://example.org/c", title: "No rights", content: "Reject this too." }
    ];
  }}],
  knowledgePort: { receive: async record => { received.push(record); return { success: true }; } },
  authorize: async () => ({ allowed: true, approvalId: "APR-1" }),
  audit: async () => { audits++; }
});
assert.deepEqual(pipeline.listProviders(), ["public-search"]);
const trustedContext = { authenticated: true, actorId: "darknet-service", sessionId: "session-1" };
assert.equal((await pipeline.learn({ providerId: "public-search", query: "workflow automation", principal: "operator", trustedContext, limit: 3 })).received, 1);
assert.equal(calls, 1);
assert.equal(received[0].status, "RECEIVED_PENDING_REVIEW");
assert.equal(received[0].promotedToKnowledge, false);
assert.equal(received[0].rights, "PUBLIC");
assert.equal(received[0].content, "A useful guide.");
assert.equal(received[0].provenance.providerId, "public-search");
assert.equal(audits, 2);
const noLicense = await pipeline.learn({ providerId: "public-search", query: "workflow automation", trustedContext, limit: 3 });
assert.equal(noLicense.rejected, 2);
assert.equal((await pipeline.learn({ providerId: "missing", query: "x", trustedContext })).status, "KNOWLEDGE_PROVIDER_UNAVAILABLE");
assert.equal((await pipeline.learn({ providerId: "public-search", query: "x" })).status, "KNOWLEDGE_TRUSTED_IDENTITY_REQUIRED");
const disabled = createDarknetKnowledgePipeline();
assert.equal((await disabled.learn({ providerId: "public-search", query: "x" })).status, "DARKNET_KNOWLEDGE_PIPELINE_DISABLED");
const denied = createDarknetKnowledgePipeline({ enabled: true, providers: [{ id: "public-search", search: async () => [] }], knowledgePort: { receive: async () => ({ success: true }) } });
assert.equal((await denied.learn({ providerId: "public-search", query: "x", trustedContext })).status, "KNOWLEDGE_REQUEST_DENIED");
let fetchCalls = 0;
const fetchedRecords = [];
const fetchPipeline = createDarknetKnowledgePipeline({
  enabled: true,
  providers: [{
    id: "full-source",
    search: async () => [{ id: "full-1", url: "https://example.org/full", title: "Source metadata", rights: "PUBLIC" }],
    fetch: async ({ sourceId, url }) => {
      fetchCalls++;
      assert.equal(sourceId, "full-1");
      assert.equal(url, "https://example.org/full");
      return { sourceId, url, title: "Fetched guide", content: "Complete procedure from source.", rights: "PUBLIC" };
    }
  }],
  knowledgePort: { receive: async record => { fetchedRecords.push(record); return { success: true, status: "RECEIVED_PENDING_REVIEW" }; } },
  authorize: async () => ({ allowed: true, approvalId: "FETCH-APPROVAL" }),
  audit: async () => {}
});
assert.equal((await fetchPipeline.learn({ providerId: "full-source", query: "guide", trustedContext })).received, 1);
assert.equal(fetchCalls, 1);
assert.equal(fetchedRecords[0].title, "Fetched guide");
assert.equal(fetchedRecords[0].content, "Complete procedure from source.");
console.log("darknet-knowledge-pipeline.test: OK");
