const REQUIRED = ["sectorId", "name", "domain", "status"];
const STATUSES = new Set(["ACTIVE", "PLANNED", "MAINTENANCE", "DISABLED"]);
export class WordDarkSectorRegistry {
  constructor({ sectors = [] } = {}) { this.sectors = new Map(); for (const sector of sectors) this.register(sector); }
  register(source) {
    const sector = {
      sectorId: source?.sectorId || null, name: source?.name || null, domain: source?.domain || null,
      status: source?.status || "PLANNED", capabilities: [...new Set(Array.isArray(source?.capabilities) ? source.capabilities : [])],
      visibleApp: source?.visibleApp !== false, ownerNucleus: source?.ownerNucleus || "world-core",
      description: source?.description || "", metadata: structuredClone(source?.metadata && typeof source.metadata === "object" ? source.metadata : {})
    };
    const missing = REQUIRED.filter(field => !sector[field] || typeof sector[field] !== "string");
    if (missing.length) return { success: false, reason: "SECTOR_FIELDS_REQUIRED", fields: missing };
    if (!STATUSES.has(sector.status)) return { success: false, reason: "INVALID_SECTOR_STATUS" };
    if (this.sectors.has(sector.sectorId)) return { success: false, reason: "SECTOR_ID_ALREADY_EXISTS", sectorId: sector.sectorId };
    this.sectors.set(sector.sectorId, sector);
    return { success: true, sector: this.get(sector.sectorId) };
  }
  updateStatus(sectorId, status) {
    const sector = this.sectors.get(sectorId);
    if (!sector) return { success: false, reason: "SECTOR_NOT_FOUND" };
    if (!STATUSES.has(status)) return { success: false, reason: "INVALID_SECTOR_STATUS" };
    sector.status = status; return { success: true, sector: this.get(sectorId) };
  }
  get(sectorId) { const sector = this.sectors.get(sectorId); return sector ? structuredClone(sector) : null; }
  findCapability(capability) { return this.list({ includeHidden: true }).filter(sector => sector.status === "ACTIVE" && sector.capabilities.includes(capability)); }
  list({ includeHidden = false, domain = null } = {}) {
    return [...this.sectors.values()].filter(sector => (includeHidden || sector.visibleApp) && (!domain || sector.domain === domain))
      .sort((a, b) => a.name.localeCompare(b.name)).map(sector => structuredClone(sector));
  }
  snapshot() {
    const all = [...this.sectors.values()];
    return { total: all.length, active: all.filter(s => s.status === "ACTIVE").length, planned: all.filter(s => s.status === "PLANNED").length,
      maintenance: all.filter(s => s.status === "MAINTENANCE").length, disabled: all.filter(s => s.status === "DISABLED").length,
      visibleApps: all.filter(s => s.visibleApp).length, hiddenInfrastructure: all.filter(s => !s.visibleApp).length };
  }
}
