class WordDarkLocalLibrary {
  constructor({ libraryId, ownerId, parentId = null, metadata = {} } = {}) {
    if (!libraryId) throw new Error("libraryId é obrigatório.");
    if (!ownerId) throw new Error("ownerId é obrigatório.");

    this.libraryId = libraryId;
    this.ownerId = ownerId;
    this.parentId = parentId;
    this.metadata = { ...metadata };
    this.records = new Map();
  }

  save(record) {
    if (!record || !record.recordId) {
      throw new Error("Registro inválido para a Biblioteca Local.");
    }

    const stored = {
      ...record,
      libraryId: this.libraryId,
      ownerId: this.ownerId,
      updatedAt: new Date().toISOString()
    };

    this.records.set(record.recordId, stored);
    return stored;
  }

  get(recordId) {
    return this.records.get(recordId) || null;
  }

  list() {
    return [...this.records.values()];
  }

  remove(recordId) {
    return this.records.delete(recordId);
  }

  clear() {
    this.records.clear();
  }

  toJSON() {
    return {
      libraryId: this.libraryId,
      ownerId: this.ownerId,
      parentId: this.parentId,
      metadata: { ...this.metadata },
      records: this.list()
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = { WordDarkLocalLibrary };
}
if (typeof window !== "undefined") {
  window.WordDarkLocalLibrary = WordDarkLocalLibrary;
}
