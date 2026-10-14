import assert from "node:assert/strict";
import { createCentralKnowledgeArchiver } from "./central-knowledge-archiver.js";

let archived = null;
const archiver = createCentralKnowledgeArchiver({
  createKnowledgeRecord: fields => ({ ...fields, validate() { assert.equal(this.status, "VALIDATED"); }, isValidated() { return this.status === "VALIDATED"; } }),
  centralKnowledgeStore: { archive: async (record, options) => {
    record.validate();
    assert.equal(record.isValidated(), true);
    assert.equal(options.reason, "DARKNET_KNOWLEDGE_VALIDATED");
    archived = record;
    return { recordId: "KNOWLEDGE-" + record.knowledgeId };
  }}
});
assert.equal((await archiver.archiveValidated({ status: "PROPOSED" })).status, "KNOWLEDGE_VALIDATION_REQUIRED");
const result = await archiver.archiveValidated({
  knowledgeId: "WD-K-1", type: "LEARNING", title: "Guide", summary: "Useful procedure",
  sourceId: "https://example.org/guide", sourceType: "DARKNET_EXTERNAL", status: "VALIDATED",
  version: "1.0.0", tags: ["guide"], evidence: [{ rights: "PUBLIC" }],
  createdAt: "2026-10-13T00:00:00Z", validatedAt: "2026-10-13T01:00:00Z", metadata: { content: "procedure" }
});
assert.equal(result.status, "KNOWLEDGE_ARCHIVED");
assert.equal(archived.knowledgeId, "WD-K-1");
assert.equal(archived.metadata.content, "procedure");
console.log("central-knowledge-archiver.test: OK");
