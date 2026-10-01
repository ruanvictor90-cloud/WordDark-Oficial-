/* WordDark — Route Contract
 * Define um caminho autorizado para transporte.
 * A rota transporta; não concede permissão para executar.
 */
class WordDarkRoute {
  constructor(source = {}) {
    this.routeId = source.routeId || null;
    this.origin = source.origin || null;
    this.destination = source.destination || null;
    this.service = source.service || "*";
    this.status = source.status || "ACTIVE";
    this.metadata = source.metadata || {};
    this.createdAt = source.createdAt || new Date().toISOString();
  }

  static get STATUSES() { return ["ACTIVE","SUSPENDED","REVOKED"]; }

  validate() {
    const errors = [];
    if (!this.routeId) errors.push("routeId é obrigatório.");
    if (!this.origin) errors.push("origin é obrigatório.");
    if (!this.destination) errors.push("destination é obrigatório.");
    if (!WordDarkRoute.STATUSES.includes(this.status)) errors.push("status de rota inválido.");
    return { valid: errors.length === 0, errors };
  }

  isActive() { return this.status === "ACTIVE"; }

  allows(origin, destination, service) {
    if (!this.isActive()) return false;
    const serviceMatches = this.service === "*" || this.service === service;
    return this.origin === origin && this.destination === destination && serviceMatches;
  }

  toJSON() {
    return {
      routeId:this.routeId, origin:this.origin, destination:this.destination,
      service:this.service, status:this.status, metadata:this.metadata, createdAt:this.createdAt
    };
  }
}
if (typeof module !== "undefined") module.exports = WordDarkRoute;
if (typeof window !== "undefined") window.WordDarkRoute = WordDarkRoute;
