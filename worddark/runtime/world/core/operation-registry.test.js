const assert = require("assert");
const WordDarkOperation = require("../contracts/operation");
const { WordDarkOperationRegistry } = require("./operation-registry");
const { WordDarkLocalLibrary } = require("../library/local-library");
const { WordDarkCentralLibrary } = require("../library/central-library");
const { WordDarkKnowledgeRecord } = require("../contracts/knowledge");

const localLibrary = new WordDarkLocalLibrary({ libraryId: "LIB-TEST-LOCAL", ownerId: "UNIT-TEST" });
const centralLibrary = new WordDarkCentralLibrary();
const registry = new WordDarkOperationRegistry({ localLibrary, centralLibrary });

const operation = new WordDarkOperation({
  operationId: "OP-TEST-001",
  requesterId: "UNIT-TEST",
  originId: "UNIT-TEST",
  destinationId: "world/sky/darkfactory",
  operationType: "content.produce"
});

registry.recordEvent(operation, "CREATED", { test: true });

assert.ok(registry.get("OP-TEST-001"));
assert.strictEqual(registry.getEvents("OP-TEST-001").length, 1);
assert.ok(localLibrary.get("OPERATION-OP-TEST-001"));
assert.ok(localLibrary.get(registry.getEvents("OP-TEST-001")[0].eventId));
assert.ok(centralLibrary.get(registry.getEvents("OP-TEST-001")[0].eventId));

registry.archiveOperation(operation);
assert.strictEqual(centralLibrary.count(), 2);

localLibrary.save({
  recordId: "LEARNING-001",
  type: "LEARNING",
  operationId: "OP-TEST-001",
  data: { lesson: "teste de promoção seletiva" }
});

const promoted = registry.promoteLocalLearning("LEARNING-001", {
  reason: "LEARNING_VALIDATED"
});

assert.ok(promoted);
assert.strictEqual(promoted.type, "LEARNING_PROMOTION");
assert.strictEqual(centralLibrary.count(), 3);
assert.strictEqual(promoted.source, "LIB-TEST-LOCAL");

const knowledge = new WordDarkKnowledgeRecord({
  knowledgeId: "K-OP-001",
  type: WordDarkKnowledgeRecord.TYPES.ARCHITECTURE_DECISION,
  title: "Registry promove conhecimento validado",
  summary: "Decisões arquiteturais validadas podem ser preservadas na Central.",
  sourceId: "OP-TEST-001",
  sourceType: "OPERATION",
  status: WordDarkKnowledgeRecord.STATUS.VALIDATED,
  validatedAt: new Date().toISOString(),
  evidence: ["operation-registry-test"]
});

const promotedKnowledge = registry.promoteKnowledge(knowledge);
assert.ok(promotedKnowledge);
assert.strictEqual(promotedKnowledge.type, "KNOWLEDGE_PROMOTION");
assert.strictEqual(promotedKnowledge.source, "OP-TEST-001");
assert.strictEqual(centralLibrary.count(), 4);

assert.throws(() => {
  registry.promoteKnowledge(new WordDarkKnowledgeRecord({
    knowledgeId: "K-OP-002",
    type: WordDarkKnowledgeRecord.TYPES.LEARNING,
    title: "Hipótese",
    summary: "Ainda não validada.",
    sourceId: "OP-TEST-001",
    sourceType: "OPERATION"
  }));
}, /somente conhecimento VALIDATED/);

console.log("operation-registry.test.js: OK");
