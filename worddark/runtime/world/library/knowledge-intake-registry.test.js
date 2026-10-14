import assert from "node:assert/strict";
import { createKnowledgeIntakeRegistry } from "./knowledge-intake-registry.js";

let archives = 0, audits = 0;
const registry = createKnowledgeIntakeRegistry({
  enabled: true,
  authorizeReview: async ({ decision }) => ({ allowed: decision === "VALIDATE", approvalId: "REVIEW-APPROVAL" }),
  audit: async () => { audits++; },
  archiveValidated: async record => { archives++; assert.equal(record.status, "VALIDATED"); return { success: true }; },
  now: () => "2026-10-13T23:00:00.000Z"
});
const incoming = {
  contract: "worddark.knowledge-intake", version: 1, recordId: "DNET-KNOW-provider%3Adoc-1",
  providerId: "provider", source: { sourceId: "doc-1", url: "https://example.org/doc", title: "Reusable procedure" },
  content: "Use a repeatable checklist.", rights: "PUBLIC", license: null, tags: ["procedure"],
  provenance: { providerId: "provider" }, receivedAt: "2026-10-13T22:00:00.000Z"
};
const accepted = await registry.receivePending(incoming, { actorId: "darknet-service" });
assert.equal(accepted.status, "RECEIVED_PENDING_REVIEW");
assert.equal(registry.listPending().length, 1);
assert.equal(registry.searchValidated("repeatable").length, 0, "unreviewed information must not be used as validated knowledge");
assert.equal((await registry.review(incoming.recordId, { decision: "VALIDATE" })).status, "KNOWLEDGE_REVIEW_IDENTITY_REQUIRED");
const reviewer = { authenticated: true, actorId: "world-reviewer", sessionId: "review-session" };
assert.equal((await registry.review(incoming.recordId, { decision: "VALIDATE", trustedContext: reviewer, reason: "Source checked" })).status, "KNOWLEDGE_VALIDATED_AND_ARCHIVED");
assert.equal(archives, 1);
assert.equal(registry.listPending().length, 0);
assert.equal(registry.searchValidated("repeatable")[0].status, "VALIDATED");
assert.equal(registry.searchValidated("not-found").length, 0);
assert.equal(audits, 1);
console.log("knowledge-intake-registry.test: OK");
