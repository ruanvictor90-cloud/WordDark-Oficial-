import assert from "node:assert/strict";
import { createDarknetKnowledgeAdapter } from "./darknet-knowledge-adapter.js";
(async () => {
  let saved = 0, audited = 0;
  const record = {
    contract: "worddark.knowledge-intake", version: 1, recordId: "DNET-KNOW-public-search%3Asrc-1",
    providerId: "public-search", source: { sourceId: "src-1", url: "https://example.org/a", title: "Guide", retrievedAt: "2026-10-13T00:00:00Z" },
    content: "A useful guide.", contentType: "text/plain", rights: "PUBLIC", license: null,
    language: "en", tags: ["guide"], provenance: { acquisition: "DARKNET_PROVIDER_ADAPTER", providerId: "public-search" },
    status: "RECEIVED_PENDING_REVIEW", promotedToKnowledge: false, receivedAt: "2026-10-13T00:00:00Z"
  };
  const deps = {
    knowledgeRegistry: { receivePending: async item => { saved++; assert.equal(item.recordId, record.recordId); return { success: true }; } },
    authorizeRequest: async () => ({ allowed: true, approvalId: "APR-1" }),
    audit: async () => { audited++; }
  };
  const adapter = createDarknetKnowledgeAdapter({ ...deps, enabled: true });
  assert.equal((await adapter.receive(record)).status, "WORDDARK_TRUSTED_IDENTITY_REQUIRED");
  const context = { authenticated: true, actorId: "darknet-service", sessionId: "session-1" };
  assert.equal((await adapter.receive(record, context)).status, "RECEIVED_PENDING_REVIEW");
  assert.equal(saved, 1);
  assert.equal(audited, 1);
  assert.equal((await adapter.receive({ ...record, rights: "UNKNOWN" }, context)).status, "WORDDARK_KNOWLEDGE_RECORD_INVALID");\n  assert.equal((await adapter.receive({ ...record, rights: "LICENSED", license: null }, context)).status, "WORDDARK_KNOWLEDGE_RECORD_INVALID");
  const disabled = createDarknetKnowledgeAdapter({ ...deps });
  assert.equal((await disabled.receive(record, context)).status, "WORDDARK_KNOWLEDGE_INTAKE_DISABLED");
  const noStore = createDarknetKnowledgeAdapter({ enabled: true, authorizeRequest: deps.authorizeRequest, audit: deps.audit });
  assert.equal((await noStore.receive(record, context)).status, "WORDDARK_KNOWLEDGE_REGISTRY_UNAVAILABLE");
  console.log("darknet-knowledge-adapter.test: OK");
})().catch(error => { console.error(error); process.exitCode = 1; });
