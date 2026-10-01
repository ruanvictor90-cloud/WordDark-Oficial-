const { WordDarkKnowledgeRecord } =
  typeof require === "function"
    ? require("../contracts/knowledge")
    : { WordDarkKnowledgeRecord: window.WordDarkKnowledgeRecord };

class WordDarkCentralKnowledgeStore {
  constructor({ library = null } = {}) {
    this.library = library;
  }

  archive(record, { reason = "KNOWLEDGE_VALIDATED" } = {}) {
    if (!(record instanceof WordDarkKnowledgeRecord)) {
      throw new Error("record must be a WordDarkKnowledgeRecord");
    }

    record.validate();

    if (!record.isValidated()) {
      throw new Error("only validated knowledge can be archived");
    }

    if (!this.library) {
      throw new Error("central library is required");
    }

    return this.library.append({
      recordId: `KNOWLEDGE-${record.knowledgeId}`,
      type: "KNOWLEDGE",
      source: "CENTRAL_KNOWLEDGE_STORE",
      reason,
      knowledgeId: record.knowledgeId,
      data: record.toJSON()
    });
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { WordDarkCentralKnowledgeStore };
}

if (typeof window !== "undefined") {
  window.WordDarkCentralKnowledgeStore = WordDarkCentralKnowledgeStore;
}
