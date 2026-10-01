/**
 * WordDark Knowledge Contract
 * Defines validated knowledge that may be preserved in the Central Library.
 */
class WordDarkKnowledgeRecord {
  constructor({
    knowledgeId,
    type,
    title,
    summary,
    sourceId,
    sourceType,
    status = WordDarkKnowledgeRecord.STATUS.PROPOSED,
    version = "1.0.0",
    tags = [],
    evidence = [],
    createdAt = new Date().toISOString(),
    validatedAt = null,
    metadata = {}
  } = {}) {
    this.knowledgeId = knowledgeId;
    this.type = type;
    this.title = title;
    this.summary = summary;
    this.sourceId = sourceId;
    this.sourceType = sourceType;
    this.status = status;
    this.version = version;
    this.tags = Array.isArray(tags) ? tags : [];
    this.evidence = Array.isArray(evidence) ? evidence : [];
    this.createdAt = createdAt;
    this.validatedAt = validatedAt;
    this.metadata = metadata || {};
  }

  static get TYPES() {
    return Object.freeze({
      DISCOVERY: "DISCOVERY",
      SOLUTION: "SOLUTION",
      ERROR_CORRECTION: "ERROR_CORRECTION",
      ARCHITECTURE_DECISION: "ARCHITECTURE_DECISION",
      PROCEDURE: "PROCEDURE",
      LEARNING: "LEARNING"
    });
  }

  static get STATUS() {
    return Object.freeze({
      PROPOSED: "PROPOSED",
      VALIDATED: "VALIDATED",
      REJECTED: "REJECTED",
      ARCHIVED: "ARCHIVED"
    });
  }

  validate() {
    const validTypes = Object.values(WordDarkKnowledgeRecord.TYPES);
    const validStatuses = Object.values(WordDarkKnowledgeRecord.STATUS);

    if (!this.knowledgeId) throw new Error("knowledgeId is required");
    if (!validTypes.includes(this.type)) throw new Error("invalid knowledge type");
    if (!this.title) throw new Error("title is required");
    if (!this.summary) throw new Error("summary is required");
    if (!this.sourceId) throw new Error("sourceId is required");
    if (!this.sourceType) throw new Error("sourceType is required");
    if (!validStatuses.includes(this.status)) throw new Error("invalid knowledge status");
    if (!this.version) throw new Error("version is required");

    if (this.status === WordDarkKnowledgeRecord.STATUS.VALIDATED && !this.validatedAt) {
      throw new Error("validatedAt is required for validated knowledge");
    }

    return true;
  }

  isValidated() {
    return this.status === WordDarkKnowledgeRecord.STATUS.VALIDATED;
  }

  toJSON() {
    return {
      knowledgeId: this.knowledgeId,
      type: this.type,
      title: this.title,
      summary: this.summary,
      sourceId: this.sourceId,
      sourceType: this.sourceType,
      status: this.status,
      version: this.version,
      tags: [...this.tags],
      evidence: [...this.evidence],
      createdAt: this.createdAt,
      validatedAt: this.validatedAt,
      metadata: { ...this.metadata }
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { WordDarkKnowledgeRecord };
}

if (typeof window !== "undefined") {
  window.WordDarkKnowledgeRecord = WordDarkKnowledgeRecord;
}
