import { id } from "./id.js";

export class Road {
  constructor({ registry }) {
    if (!registry) throw new Error("CAPABILITY_REGISTRY_REQUIRED");
    this.registry = registry;
    this.routes = new Map();
    this.deliveries = [];
    this.status = "ONLINE";
    this.version = "1.0.0";
  }

  route(operation) {
    if (!operation?.id) return this._reject("OPERATION_REQUIRED");
    if (!operation.service) return this._reject("SERVICE_REQUIRED");

    const capability = this.registry.find(operation.service);
    if (!capability) {
      return {
        success: false,
        status: "CAPABILITY_NOT_FOUND",
        stage: "ROAD",
        reason: "Nenhuma capacidade ativa para o serviço.",
        operationId: operation.id,
        service: operation.service
      };
    }

    const delivery = this._createDelivery(operation, capability, "ROUTED");
    this.routes.set(delivery.id, delivery);
    this.deliveries.push(delivery);

    return { success: true, status: "ROUTED", capability, delivery };
  }

  deliver(operation, { capability = null, payload = null } = {}) {
    const route = capability
      ? { success: true, capability, delivery: this._createDelivery(operation, capability, "ROUTED") }
      : this.route(operation);

    if (!route.success) return route;

    const delivery = {
      ...route.delivery,
      status: "DELIVERED",
      payload: payload === null ? structuredClone(operation.payload) : structuredClone(payload),
      deliveredAt: new Date().toISOString()
    };

    this.routes.set(delivery.id, delivery);
    this.deliveries.push(delivery);

    return { success: true, status: "DELIVERED", stage: "ROAD", delivery };
  }

  return(operation, result) {
    if (!operation?.id) return this._reject("OPERATION_REQUIRED");

    const delivery = {
      id: id("DLV"),
      operationId: operation.id,
      owner: operation.origin,
      destination: operation.origin,
      service: operation.service,
      status: "RETURNED",
      result: structuredClone(result),
      returnedAt: new Date().toISOString()
    };

    this.deliveries.push(delivery);
    return { success: true, status: "RETURNED", stage: "ROAD", delivery };
  }

  list() { return this.deliveries.map(structuredClone); }

  listRoutes() {
    return [...this.routes.values()].map(structuredClone);
  }

  getStatus() {
    return {
      name: "WordDark Road",
      version: this.version,
      status: this.status,
      routes: this.routes.size,
      deliveries: this.deliveries.length,
      capabilities: this.registry.list().length
    };
  }

  _createDelivery(operation, capability, status) {
    return {
      id: id("DLV"),
      operationId: operation.id,
      origin: operation.origin,
      destination: capability.owner,
      service: capability.id,
      owner: capability.owner,
      layer: capability.layer || null,
      capabilityMetadata: structuredClone(capability.metadata || {}),
      status,
      routedAt: new Date().toISOString()
    };
  }

  _reject(reason) {
    return { success: false, status: "REJECTED", stage: "ROAD", reason };
  }
}
