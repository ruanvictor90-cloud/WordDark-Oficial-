/* WordDark — Rodovia Global
 * Transporte geral entre unidades do mundo.
 * Não autoriza, não executa e não escolhe o destino.
 */
class WordDarkRoad {
  constructor({ messageContract = null } = {}) {
    this.routes = new Map();
    this.deliveries = [];
    this.messageContract = messageContract;
    this.name = "WordDark Road";
    this.version = "0.1";
    this.status = "ONLINE";
  }

  registerRoute(route) {
    const validation = route && typeof route.validate === "function"
      ? route.validate()
      : { valid:false, errors:["Rota inválida."] };
    if (!validation.valid) return { success:false, reason:"Rota inválida.", errors:validation.errors };
    this.routes.set(route.routeId, route);
    return { success:true, routeId:route.routeId };
  }

  findRoute(origin, destination, service) {
    for (const route of this.routes.values()) {
      if (route.allows(origin, destination, service)) return route;
    }
    return null;
  }

  send(message) {
    const validation = message && typeof message.validate === "function"
      ? message.validate()
      : { valid:false, errors:["Mensagem inválida."] };
    if (!validation.valid) return { success:false, status:"REJECTED", stage:"ROAD", reason:"Mensagem inválida.", errors:validation.errors };

    const route = this.findRoute(message.origin, message.destination, message.service);
    if (!route) {
      return {
        success:false, status:"ROUTE_NOT_FOUND", stage:"ROAD",
        reason:"Nenhuma rota ativa encontrada.",
        messageId:message.messageId, requestId:message.requestId,
        origin:message.origin, destination:message.destination, service:message.service
      };
    }

    const delivery = {
      deliveryId:"DLV-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,6).toUpperCase(),
      messageId:message.messageId,
      requestId:message.requestId,
      routeId:route.routeId,
      origin:message.origin,
      destination:message.destination,
      service:message.service,
      status:"DELIVERED",
      deliveredAt:new Date().toISOString()
    };
    this.deliveries.push(delivery);

    return { success:true, status:"DELIVERED", stage:"ROAD", routeId:route.routeId, deliveryId:delivery.deliveryId, message:message.toJSON(), delivery };
  }

  listRoutes() { return [...this.routes.values()].map(route => route.toJSON()); }
  listDeliveries() { return [...this.deliveries]; }
  getStatus() { return { name:this.name, version:this.version, status:this.status, routes:this.routes.size, deliveries:this.deliveries.length }; }
}
if (typeof module !== "undefined") module.exports = WordDarkRoad;
if (typeof window !== "undefined") window.WordDarkRoad = WordDarkRoad;
