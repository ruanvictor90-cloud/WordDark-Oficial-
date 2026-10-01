/*
 * WordDark — Routing / Rodovia
 * DF-0.4 foundation
 *
 * Responsabilidade:
 * Transportar solicitações somente por rotas registradas.
 *
 * Routing não autoriza a execução.
 * Routing não executa tarefas.
 * Routing apenas valida o caminho e encaminha o envelope ao destino.
 */

class WordDarkRouter {

  constructor() {
    this.routes = new Map();
    this.name = "DF-Rodovia";
    this.version = "0.1";
    this.status = "ONLINE";
  }

  registerRoute(route) {
    if (!route || typeof route.validate !== "function") {
      return {
        success: false,
        reason: "Rota inválida."
      };
    }

    const validation = route.validate();

    if (!validation.valid) {
      return {
        success: false,
        reason: "Rota inválida.",
        errors: validation.errors
      };
    }

    this.routes.set(route.routeId, route);

    return {
      success: true,
      routeId: route.routeId
    };
  }

  getRoute(routeId) {
    return this.routes.get(routeId) || null;
  }

  listRoutes() {
    return Array.from(this.routes.values()).map(route => route.toJSON());
  }

  findRoute(origin, destination, service) {
    for (const route of this.routes.values()) {
      if (route.allows(origin, destination, service)) {
        return route;
      }
    }

    return null;
  }

  send({ envelope, origin, destination, service }) {
    if (!envelope) {
      return {
        success: false,
        status: "REJEITADO",
        stage: "ROUTING",
        reason: "Envelope ausente."
      };
    }

    const route = this.findRoute(origin, destination, service);

    if (!route) {
      return {
        success: false,
        status: "ROTA_NAO_ENCONTRADA",
        stage: "ROUTING",
        reason: "Nenhuma rota ativa encontrada.",
        origin,
        destination,
        service,
        messageId: envelope.messageId || null,
        requestId: envelope.requestId || null
      };
    }

    return {
      success: true,
      status: "ENCAMINHADO",
      stage: "ROUTING",
      routeId: route.routeId,
      messageId: envelope.messageId || null,
      requestId: envelope.requestId || null,
      origin,
      destination,
      service,
      envelope
    };
  }

  getStatus() {
    return {
      name: this.name,
      version: this.version,
      status: this.status,
      routes: this.routes.size
    };
  }
}

if (typeof window !== "undefined") {
  window.WordDarkRouter = WordDarkRouter;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = WordDarkRouter;
}
