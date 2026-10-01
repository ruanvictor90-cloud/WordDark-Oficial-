/* WordDark — Persistence Contract
 * Abstração substituível. O MVP usa memória; banco real entra depois sem alterar contratos superiores.
 */
class WordDarkMemoryPersistence {
  constructor() {
    this.records = new Map();
  }

  save(key, value) {
    if (!key) throw new Error("Persistence key é obrigatória.");
    this.records.set(String(key), value);
    return value;
  }

  get(key) {
    return this.records.get(String(key)) || null;
  }

  has(key) {
    return this.records.has(String(key));
  }

  delete(key) {
    return this.records.delete(String(key));
  }

  list() {
    return Array.from(this.records.entries()).map(([key,value]) => ({key,value}));
  }

  clear() {
    this.records.clear();
  }
}

if (typeof window !== "undefined") window.WordDarkMemoryPersistence = WordDarkMemoryPersistence;
if (typeof module !== "undefined" && module.exports) module.exports = WordDarkMemoryPersistence;
