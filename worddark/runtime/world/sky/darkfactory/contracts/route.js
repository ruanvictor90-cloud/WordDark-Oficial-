/*
 * WordDark — Route Contract
 * CONTRACTS v1
 *
 * Responsabilidade:
 * Representar o caminho autorizado de uma comunicação.
 *
 * Route descreve o caminho.
 * Security continua responsável por decidir se a ação é permitida.
 */

class WordDarkRoute {

  constructor({
    routeId,
    origin,
    destination,
    service,
    status = "ACTIVE",
    createdAt = new Date().toISOString()
  }) {
    this.routeId = routeId;
    this.origin = origin;
    this.destination = destination;
    this.service = service;
    this.status = status;
    this.createdAt = createdAt;
  }

  validate() {
    const errors = [];

    if (!this.routeId) errors.push("routeId não informado.");
    if (!this.origin) errors.push("origin não informado.");
    if (!this.destination) errors.push("destination não informado.");
    if (!this.service) errors.push("service não informado.");
    if (!this.createdAt) errors.push("createdAt não informado.");

    return {
      valid: errors.length === 0,
      errors
    };
  }

  isActive() {
    return this.status === "ACTIVE";
  }

  allows(origin, destination, service) {
    return (
      this.isActive() &&
      this.origin === origin &&
      this.destination === destination &&
      this.service === service
    );
  }

  toJSON() {
    return {
      routeId: this.routeId,
      origin: this.origin,
      destination: this.destination,
      service: this.service,
      status: this.status,
      createdAt: this.createdAt
    };
  }
}

if (typeof window !== "undefined") {
  window.WordDarkRoute = WordDarkRoute;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = WordDarkRoute;
}
