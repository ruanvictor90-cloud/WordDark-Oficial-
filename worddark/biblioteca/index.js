export class LocalLibrary {
  constructor({ libraryId, ownerId, parentId = null, metadata = {} } = {}) {
    if (!libraryId || !ownerId) throw new Error("LIBRARY_OWNER_REQUIRED");
    this.libraryId = libraryId;
    this.ownerId = ownerId;
    this.parentId = parentId;
    this.metadata = { ...metadata };
    this.records = new Map();
  }

  save(record) {
    if (!record?.id) throw new Error("LIBRARY_RECORD_ID_REQUIRED");
    const stored = {
      ...structuredClone(record),
      libraryId: this.libraryId,
      ownerId: this.ownerId,
      updatedAt: new Date().toISOString()
    };
    this.records.set(record.id, stored);
    return structuredClone(stored);
  }

  get(id) { return structuredClone(this.records.get(id) || null); }
  list() { return [...this.records.values()].map(structuredClone); }
  remove(id) { return this.records.delete(id); }
}

export class CentralLibrary {
  constructor({ libraryId = "WORDDARK-CENTRAL-LIBRARY" } = {}) {
    this.libraryId = libraryId;
    this.records = new Map();
  }

  save(record) {
    if (!record?.id) throw new Error("LIBRARY_RECORD_ID_REQUIRED");
    const stored = {
      ...structuredClone(record),
      libraryId: this.libraryId,
      savedAt: new Date().toISOString()
    };
    this.records.set(record.id, stored);
    return structuredClone(stored);
  }

  append(record) {
    if (!record?.id) throw new Error("LIBRARY_RECORD_ID_REQUIRED");
    const id = this.records.has(record.id)
      ? record.id + "-" + Date.now().toString(36).toUpperCase()
      : record.id;
    return this.save({ ...record, id });
  }

  find(predicate) { return [...this.records.values()].filter(predicate).map(structuredClone); }
  get(id) { return structuredClone(this.records.get(id) || null); }
  list() { return [...this.records.values()].map(structuredClone); }
  count() { return this.records.size; }

  promote(localRecord, { source, reason = "LEARNING_PROMOTED" } = {}) {
    if (!localRecord?.id) throw new Error("LOCAL_RECORD_REQUIRED");
    return this.append({
      id: "LEARNING-" + localRecord.id,
      type: "LEARNING_PROMOTION",
      source: source || localRecord.ownerId || null,
      reason,
      data: localRecord
    });
  }
}
