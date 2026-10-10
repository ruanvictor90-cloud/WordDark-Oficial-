class WordDarkIPRegistry {
  constructor() { this.records = new Map(); }

  register(input = {}) {
    if (!input.ipId) throw new Error("ipId é obrigatório");
    if (!input.name) throw new Error("name é obrigatório");
    const record = {
      ipId: input.ipId, name: input.name, type: input.type || "CREATIVE_ASSET",
      scope: input.scope || "INTERNAL", ownerId: input.ownerId || "WORDDARK-ADM",
      creatorId: input.creatorId || null,
      contributorIds: Array.isArray(input.contributorIds) ? [...input.contributorIds] : [],
      origin: input.origin || null, sourceIds: Array.isArray(input.sourceIds) ? [...input.sourceIds] : [],
      rightsStatus: input.rightsStatus || "UNKNOWN", license: input.license || null,
      version: input.version || "1.0.0", status: input.status || "RECORDED",
      evidence: Array.isArray(input.evidence) ? [...input.evidence] : [],
      externalIdentities: Array.isArray(input.externalIdentities) ? [...input.externalIdentities] : [],
      externalRegistrations: Array.isArray(input.externalRegistrations) ? [...input.externalRegistrations] : [],
      contracts: Array.isArray(input.contracts) ? [...input.contracts] : [],
      hashes: Array.isArray(input.hashes) ? [...input.hashes] : [],
      createdAt: input.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    this.records.set(record.ipId, record);
    return { ...record };
  }

  get(ipId) { const r = this.records.get(ipId); return r ? { ...r } : null; }

  list(filter = {}) {
    return [...this.records.values()]
      .filter(r => !filter.type || r.type === filter.type)
      .filter(r => !filter.scope || r.scope === filter.scope)
      .filter(r => !filter.status || r.status === filter.status)
      .filter(r => !filter.ownerId || r.ownerId === filter.ownerId)
      .map(r => ({ ...r }));
  }

  update(ipId, patch = {}) {
    const current = this.records.get(ipId);
    if (!current) throw new Error("Ativo de PI não encontrado");
    const updated = { ...current, ...patch, ipId: current.ipId, updatedAt: new Date().toISOString() };
    this.records.set(ipId, updated);
    return { ...updated };
  }

  addEvidence(ipId, evidence) {
    if (!evidence) throw new Error("evidence é obrigatório");
    const current = this.get(ipId);
    if (!current) throw new Error("Ativo de PI não encontrado");
    return this.update(ipId, { evidence: [...current.evidence, evidence] });
  }

  addExternalIdentity(ipId, identity) {
    if (!identity || !identity.platform || !identity.identifier) throw new Error("external identity exige platform e identifier");
    const current = this.get(ipId);
    if (!current) throw new Error("Ativo de PI não encontrado");
    return this.update(ipId, { externalIdentities: [...current.externalIdentities, identity] });
  }

  addExternalRegistration(ipId, registration) {
    if (!registration || !registration.authority || !registration.status) throw new Error("external registration exige authority e status");
    const current = this.get(ipId);
    if (!current) throw new Error("Ativo de PI não encontrado");
    return this.update(ipId, { externalRegistrations: [...current.externalRegistrations, registration] });
  }

  addHash(ipId, hash) {
    if (!hash || !hash.algorithm || !hash.value) throw new Error("hash exige algorithm e value");
    const current = this.get(ipId);
    if (!current) throw new Error("Ativo de PI não encontrado");
    return this.update(ipId, { hashes: [...current.hashes, hash] });
  }

  promote(ipId, nextStatus = "VALIDATED") { return this.update(ipId, { status: nextStatus }); }
  toJSON() { return this.list(); }
}

const WordDarkIntellectualProperty = new WordDarkIPRegistry();
if (typeof window !== "undefined") window.WordDarkIntellectualProperty = WordDarkIntellectualProperty;
if (typeof module !== "undefined") module.exports = { WordDarkIPRegistry, WordDarkIntellectualProperty };
