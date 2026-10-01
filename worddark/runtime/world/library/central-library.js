class WordDarkCentralLibrary {
  constructor({ libraryId = "WORDDARK-CENTRAL-LIBRARY", metadata = {} } = {}) {
    this.libraryId = libraryId;
    this.metadata = { ...metadata };
    this.records = [];
  }

  append(record) {
    if (!record || !record.recordId) {
      throw new Error("Registro inválido para a Biblioteca Central.");
    }

    const stored = {
      ...record,
      libraryId: this.libraryId,
      archivedAt: new Date().toISOString()
    };

    this.records.push(stored);
    return stored;
  }

  get(recordId) {
    return this.records.find(record => record.recordId === recordId) || null;
  }

  list() {
    return [...this.records];
  }

  count() {
    return this.records.length;
  }

  toJSON() {
    return {
      libraryId: this.libraryId,
      metadata: { ...this.metadata },
      records: this.list()
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = { WordDarkCentralLibrary };
}
if (typeof window !== "undefined") {
  window.WordDarkCentralLibrary = WordDarkCentralLibrary;
}
