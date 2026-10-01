/* WordDark Lab — Autonomous City Runtime
 * Cidade operacional independente.
 *
 * A cidade:
 * 1. recebe operações pelo próprio portão;
 * 2. valida contexto e permissão;
 * 3. executa localmente quando possui serviço + rota;
 * 4. quando não consegue resolver, gera um pedido externo rastreável;
 * 5. nunca executa o serviço de outro setor por conta própria.
 */

const Id = require("./id");
const { Client, Channel, Project, User, Service } = require("./entities");
const { WordDarkLabPermission, WordDarkLabPermissionSet } = require("./permissions");
const Operation = require("./operation");
const OperationPackage = require("./operation-package");
const { WordDarkLabRoute, WordDarkLabRouter } = require("./route");
const Gate = require("./gate");
const ServiceRegistry = require("./service");
const Recovery = require("./error-recovery");
const Inbox = require("./inbox");
const Versioning = require("./versioning");
const Result = require("./result");

class WordDarkLabCity {
  constructor(source = {}) {
    this.cityId = source.cityId || null;
    this.name = source.name || null;
    this.identity = source.identity || this.cityId;
    this.status = source.status || "ACTIVE";

    this.registry = new Map();
    this.permissions = new WordDarkLabPermissionSet();
    this.router = new WordDarkLabRouter();
    this.services = new ServiceRegistry();
    this.recovery = new Recovery();
    this.inbox = new Inbox();
    this.versioning = new Versioning();

    this.gates = new Map();
    this.operations = new Map();
    this.requests = new Map();
    this.results = new Map();
    this.events = [];
    this.sequence = 0;
  }

  validate() {
    const errors = [];
    if (!this.cityId) errors.push("cityId é obrigatório.");
    if (!this.name) errors.push("name é obrigatório.");
    if (!this.identity) errors.push("identity é obrigatória.");
    if (!["ACTIVE", "LOCKED"].includes(this.status)) {
      errors.push("status da cidade inválido.");
    }
    return { valid: errors.length === 0, errors };
  }

  register(entity) {
    if (!entity || !entity.id) throw new Error("Entidade inválida.");
    if (this.registry.has(entity.id)) throw new Error("ID já registrado: " + entity.id);
    this.registry.set(entity.id, entity);
    return entity;
  }

  addGate(gate) {
    const validation = gate.validate();
    if (!validation.valid) throw new Error(validation.errors.join(" "));
    this.gates.set(gate.gateId, gate);
    return gate;
  }

  addPermission(permission) {
    this.permissions.grant(permission);
    return permission;
  }

  addRoute(route) {
    this.router.add(route);
    return route;
  }

  addService(service) {
    this.services.register(service);
    this.register(service);
    return service;
  }

  log(event, data = {}) {
    const entry = {
      event,
      cityId: this.cityId,
      timestamp: new Date().toISOString(),
      data
    };
    this.events.push(entry);
    return entry;
  }

  createOperation(source = {}) {
    const operation = source instanceof Operation
      ? source
      : new Operation(source);

    const validation = operation.validate();
    if (!validation.valid) {
      throw new Error(validation.errors.join(" "));
    }

    if (this.operations.has(operation.operationId)) {
      throw new Error("Operação já registrada: " + operation.operationId);
    }

    this.operations.set(operation.operationId, operation);
    this.versioning.create(operation.operationId, operation.toJSON());
    this.log("OPERATION_CREATED", { operationId: operation.operationId });
    return operation;
  }

  createRequest(operation, reason, target = null) {
    const requestId = Id.create("REQUEST", ++this.sequence);
    const request = {
      requestId,
      operationId: operation.operationId,
      requesterId: operation.requesterId,
      originId: this.identity,
      destinationId: target || operation.destination,
      serviceId: operation.serviceId,
      environment: operation.environment,
      reason,
      task: operation.request,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      history: []
    };

    request.history.push({
      event: "REQUEST_CREATED",
      timestamp: new Date().toISOString(),
      data: { reason, destinationId: request.destinationId }
    });

    this.requests.set(requestId, request);
    this.inbox.pend({
      type: "EXTERNAL_OPERATION_REQUEST",
      requestId,
      operationId: operation.operationId,
      destinationId: request.destinationId,
      serviceId: request.serviceId,
      reason
    });
    this.log("EXTERNAL_REQUEST_CREATED", {
      requestId,
      operationId: operation.operationId,
      destinationId: request.destinationId,
      reason
    });

    return request;
  }

  _getRequester(operation) {
    return this.registry.get(operation.requesterId) || null;
  }

  _authorize(operation, gate, profile) {
    const context = {
      clientId: operation.clientId,
      resourceId: operation.resourceId,
      destinationId: operation.destination,
      serviceId: operation.serviceId,
      environment: operation.environment
    };

    const gateResult = gate.receive({ profile, context });
    if (!gateResult.success) return gateResult;

    const permission = this.permissions.authorize({
      profile,
      capability: "operation.execute",
      action: "request",
      resourceId: operation.resourceId,
      clientId: operation.clientId,
      environment: operation.environment
    });

    if (!permission) {
      return {
        success: false,
        status: "REJECTED",
        reason: "ACCESS_DENIED",
        gateId: gate.gateId,
        destinationId: gate.destinationId
      };
    }

    return { success: true, status: "ACCEPTED", gate: gateResult };
  }

  process(operation, { gateId = null, profile = null } = {}) {
    if (this.status !== "ACTIVE") {
      return { success: false, status: "BLOCKED", reason: "CITY_LOCKED" };
    }

    try {
      const validation = operation.validate();
      if (!validation.valid) {
        return {
          success: false,
          status: "REJECTED",
          stage: "CITY_VALIDATION",
          errors: validation.errors
        };
      }

      if (!this.operations.has(operation.operationId)) {
        this.createOperation(operation);
      }

      const requester = this._getRequester(operation);
      if (!requester) {
        throw new Error("REQUESTER_NOT_FOUND");
      }

      const resolvedGateId = gateId || this._findGateFor(operation.destination);
      if (!resolvedGateId) {
        return {
          success: false,
          status: "BLOCKED",
          reason: "GATE_NOT_FOUND"
        };
      }

      const gate = this.gates.get(resolvedGateId);
      const effectiveProfile = profile || requester.profile;
      const entry = this._authorize(operation, gate, effectiveProfile);

      if (!entry.success) {
        this.log("OPERATION_REJECTED", {
          operationId: operation.operationId,
          reason: entry.reason
        });
        return { success: false, status: "REJECTED", stage: "CITY_ENTRY", ...entry };
      }

      const route = this.router.resolve(operation);
      const localService = this.services.get(operation.serviceId);

      /*
       * Não ter serviço local ou rota local não é erro da operação.
       * É o sinal de que a cidade precisa solicitar outro setor.
       */
      if (!route || !localService) {
        const reason = !localService
          ? "SERVICE_NOT_AVAILABLE_LOCALLY"
          : "ROUTE_NOT_AVAILABLE_LOCALLY";

        const request = this.createRequest(operation, reason, operation.destination);

        operation.addHistory("EXTERNAL_REQUEST_CREATED", {
          requestId: request.requestId,
          reason
        });

        this.versioning.create(operation.operationId, operation.toJSON());
        return {
          success: true,
          status: "REQUESTED_EXTERNALLY",
          operation,
          request
        };
      }

      operation.transition("RECEIVED");
      operation.transition("VALIDATED");
      operation.transition("EXECUTING");

      this.log("LOCAL_EXECUTION_STARTED", {
        operationId: operation.operationId,
        routeId: route.routeId,
        serviceId: operation.serviceId
      });

      const execution = this.services.execute(operation.serviceId, operation);

      if (!execution || !execution.success) {
        throw new Error(
          execution && execution.reason
            ? execution.reason
            : "SERVICE_FAILED"
        );
      }

      operation.transition("COMPLETED");
      operation.addHistory("LOCAL_EXECUTION_FINISHED", execution);

      const result = new Result({
        resultId: Id.create("RESULT", ++this.sequence),
        operationId: operation.operationId,
        status: "READY",
        report: execution
      });

      this.results.set(result.resultId, result);
      this.versioning.create(operation.operationId, operation.toJSON());
      this.inbox.notify({
        type: "RESULT_READY",
        operationId: operation.operationId,
        resultId: result.resultId
      });

      this.log("LOCAL_EXECUTION_FINISHED", {
        operationId: operation.operationId,
        resultId: result.resultId
      });

      return {
        success: true,
        status: "COMPLETED_LOCALLY",
        operation,
        result
      };
    } catch (error) {
      const record = this.recovery.capture(operation, error, "CITY_RUNTIME");
      this.inbox.pend({
        type: "OPERATION_ERROR",
        operationId: operation.operationId,
        errorId: record.errorId
      });

      this.log("OPERATION_FAILED", {
        operationId: operation.operationId,
        errorId: record.errorId
      });

      return {
        success: false,
        status: "FAILED",
        error: record
      };
    }
  }

  _findGateFor(destinationId) {
    for (const [gateId, gate] of this.gates.entries()) {
      if (gate.destinationId === destinationId) return gateId;
    }
    return null;
  }

  resolveRequest(requestId) {
    const request = this.requests.get(requestId);
    if (!request) return null;

    request.status = "RESOLVED";
    request.history.push({
      event: "REQUEST_RESOLVED",
      timestamp: new Date().toISOString()
    });

    const pending = this.inbox.pending.find(x => x.pendingId &&
      x.requestId === requestId);

    if (pending) this.inbox.resolve(pending.pendingId);

    this.log("EXTERNAL_REQUEST_RESOLVED", { requestId });
    return request;
  }

  lock(reason = "MANUAL") {
    this.status = "LOCKED";
    this.log("CITY_LOCKED", { reason });
    return this.status;
  }

  unlock(reason = "MANUAL") {
    this.status = "ACTIVE";
    this.log("CITY_UNLOCKED", { reason });
    return this.status;
  }

  getStatus() {
    return {
      cityId: this.cityId,
      name: this.name,
      identity: this.identity,
      status: this.status,
      operations: this.operations.size,
      pendingRequests: [...this.requests.values()]
        .filter(r => r.status === "PENDING").length,
      results: this.results.size,
      openInbox: this.inbox.getOpen().length,
      events: this.events.length
    };
  }
}

module.exports = WordDarkLabCity;
if (typeof window !== "undefined") window.WordDarkLabCity = WordDarkLabCity;
