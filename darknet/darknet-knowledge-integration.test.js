import assert from "node:assert/strict";
import { createDarknetKnowledgeIntegration } from "./darknet-knowledge-integration.js";
import { createKnowledgeIntakeRegistry } from "../worddark/runtime/world/library/knowledge-intake-registry.js";

let saved = 0, darknetAudits = 0, worldAudits = 0, providerCalls = 0;
const registry = createKnowledgeIntakeRegistry({ enabled: true, authorizeReview: async () => ({ allowed: true }), audit: async () => {}, archiveValidated: async () => ({ success: true }) });
const integration = createDarknetKnowledgeIntegration({
  enabled: true,
  providers: [{
    id: "external-research",
    search: async ({ query, limit }) => {
      providerCalls++;
      assert.equal(query, "reusable workflow");
      assert.equal(limit, 3);
      return [{ id: "doc-1", url: "https://example.org/guide", title: "Workflow guide",
        content: "A reusable procedure.", rights: "PUBLIC", language: "en" }];
    }
  }],
  knowledgeRegistry: { receivePending: async record => {
    saved++;
    assert.equal(record.status, "RECEIVED_PENDING_REVIEW");
    assert.equal(record.promotedToKnowledge, false);
    return { success: true };
  }},
  authorizeDarknet: async () => ({ allowed: true, approvalId: "DNET-APPROVAL" }),
  authorizeWordDark: async () => ({ allowed: true, approvalId: "WD-APPROVAL" }),
  auditDarknet: async () => { darknetAudits++; },
  auditWordDark: async () => { worldAudits++; }
});
const trustedContext = { authenticated: true, actorId: "darknet-service", sessionId: "svc-session" };
const result = await integration.learn({ providerId: "external-research", query: "reusable workflow", limit: 3, trustedContext });
assert.equal(result.status, "KNOWLEDGE_RECEIVED_PENDING_REVIEW");
assert.equal(result.received, 1);
assert.equal(providerCalls, 1);
assert.equal(saved, 1);\nassert.equal(registry.listPending().length, 1);\nassert.equal(registry.searchValidated("reusable").length, 0);
assert.equal(darknetAudits, 2);
assert.equal(worldAudits, 1);
assert.equal(integration.getStatus().networkAccess, false);

const off = createDarknetKnowledgeIntegration();
assert.equal((await off.learn({ providerId: "external-research", query: "x", trustedContext })).status, "DARKNET_KNOWLEDGE_PIPELINE_DISABLED");
console.log("darknet-knowledge-integration.test: OK");
