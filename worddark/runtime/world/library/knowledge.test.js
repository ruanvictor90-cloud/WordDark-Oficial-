const assert = require("assert");
const { WordDarkKnowledgeRecord } = require("../contracts/knowledge");
const { WordDarkCentralLibrary } = require("./central-library");
const { WordDarkCentralKnowledgeStore } = require("./central-knowledge-store");

const centralLibrary = new WordDarkCentralLibrary();
const store = new WordDarkCentralKnowledgeStore({ library: centralLibrary });

assert.throws(() => {
  store.archive(new WordDarkKnowledgeRecord({
    knowledgeId: "K-001",
    type: WordDarkKnowledgeRecord.TYPES.LEARNING,
    title: "Aprendizado proposto",
    summary: "Ainda precisa de validação.",
    sourceId: "TEST",
    sourceType: "TEST",
    status: WordDarkKnowledgeRecord.STATUS.PROPOSED
  }));
}, /only validated knowledge/);

const record = new WordDarkKnowledgeRecord({
  knowledgeId: "K-002",
  type: WordDarkKnowledgeRecord.TYPES.ARCHITECTURE_DECISION,
  title: "Biblioteca Central é permanente",
  summary: "Conhecimento validado deve ser preservado de forma append-only.",
  sourceId: "world/library",
  sourceType: "ARCHITECTURE",
  status: WordDarkKnowledgeRecord.STATUS.VALIDATED,
  validatedAt: new Date().toISOString(),
  tags: ["library", "architecture"],
  evidence: ["validated-design"]
});

const archived = store.archive(record);
assert.strictEqual(archived.recordId, "KNOWLEDGE-K-002");
assert.strictEqual(centralLibrary.count(), 1);
assert.strictEqual(centralLibrary.get("KNOWLEDGE-K-002").type, "KNOWLEDGE");

assert.throws(() => {
  new WordDarkKnowledgeRecord({
    knowledgeId: "INVALID",
    type: "INVALID",
    title: "x",
    summary: "x",
    sourceId: "x",
    sourceType: "x"
  }).validate();
}, /invalid knowledge type/);

console.log("Knowledge tests passed.");
