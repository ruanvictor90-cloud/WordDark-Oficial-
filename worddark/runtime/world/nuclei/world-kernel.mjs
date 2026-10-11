import { createWorldRequest, validateWorldRequest } from "./request-contract.mjs";

export class WordDarkKernel {
  constructor({ sectorRegistry, eventBus, approvalCenter, operationEngine, emergencyStop = null, audit = null, clock = () => new Date().toISOString() } = {}) {
    if (!sectorRegistry || !eventBus || !approvalCenter) throw new TypeError("Registry, Event Bus e Approval Center são obrigatórios.");
    this.sectorRegistry = sectorRegistry; this.eventBus = eventBus; this.approvalCenter = approvalCenter;
    this.operationEngine = operationEngine || null; this.emergencyStop = emergencyStop;
    this.audit = typeof audit === "function" ? audit : () => {}; this.clock = clock; this.submitted = 0;
  }
  async submit(source = {}) {
    const request = createWorldRequest(source);
    const validation = validateWorldRequest(request);
    if (!validation.valid) {
      this.#emit("request.rejected", { requestId: request.requestId, errors: validation.errors });
      return { success: false, status: "REJECTED", reason: "INVALID_WORLD_REQUEST", errors: validation.errors };
    }
    const sector = this.sectorRegistry.get(request.targetSectorId);
    if (!sector || sector.status !== "ACTIVE") {
      this.#emit("request.rejected", { requestId: request.requestId, reason: sector ? "TARGET_SECTOR_INACTIVE" : "TARGET_SECTOR_NOT_FOUND" });
      return { success: false, status: "REJECTED", reason: sector ? "TARGET_SECTOR_INACTIVE" : "TARGET_SECTOR_NOT_FOUND" };
    }
    if (!sector.capabilities.includes(request.capability)) {
      this.#emit("request.rejected", { requestId: request.requestId, reason: "CAPABILITY_NOT_REGISTERED" });
      return { success: false, status: "REJECTED", reason: "CAPABILITY_NOT_REGISTERED" };
    }
    this.submitted += 1;
    this.#emit("request.received", { requestId: request.requestId, operationId: request.operationId, sectorId: sector.sectorId, capability: request.capability, environment: request.environment });
    const approvalRequired = request.requiresApproval || request.environment === "PROD";
    if (approvalRequired && !request.approvalId) {
      const approvalResult = this.approvalCenter.request({ operationId: request.operationId, requesterId: request.requesterId, sectorId: request.targetSectorId,
        action: request.action, environment: request.environment, scope: request.scope, reason: source.approvalReason || "Autorização necessária para " + request.action + ".",
        risk: source.risk || (request.environment === "PROD" ? "PRODUCTION" : "REVIEW") });
      if (!approvalResult.success) return { success: false, status: "REJECTED", reason: approvalResult.reason, fields: approvalResult.fields };
      this.#emit("approval.required", { requestId: request.requestId, operationId: request.operationId, approvalId: approvalResult.approval.approvalId, sectorId: sector.sectorId });
      return { success: true, status: "WAITING_APPROVAL", requestId: request.requestId, operationId: request.operationId, approvalId: approvalResult.approval.approvalId };
    }
    if (approvalRequired) {
      const consumed = this.approvalCenter.consume(request.approvalId, { operationId: request.operationId, action: request.action, environment: request.environment, scope: request.scope, consumerId: "worddark-kernel" });
      if (!consumed.success) return { success: false, status: "REJECTED", reason: consumed.reason, field: consumed.field };
    }
    if (this.emergencyStop?.assertRunning) {
      const running = this.emergencyStop.assertRunning(request.operationId);
      if (!running?.allowed) {
        this.#emit("operation.stopped", { operationId: request.operationId, reason: running.reason || "EMERGENCY_STOP_ACTIVE" });
        return { success: false, status: "CANCELLED", reason: running.reason || "EMERGENCY_STOP_ACTIVE" };
      }
    }
    if (!this.operationEngine || typeof this.operationEngine.create !== "function" || typeof this.operationEngine.run !== "function") {
      this.#emit("operation.not-dispatched", { operationId: request.operationId, reason: "OPERATION_ENGINE_NOT_CONFIGURED" });
      return { success: false, status: "NOT_CONFIGURED", reason: "OPERATION_ENGINE_NOT_CONFIGURED" };
    }
    try {
      const operation = this.operationEngine.create({ operationId: request.operationId, requesterId: request.requesterId, originId: request.originId,
        destinationId: request.targetSectorId, operationType: request.capability, capability: request.capability, action: request.action,
        environment: request.environment, context: { scope: request.scope, correlationId: request.correlationId }, payload: request.payload });
      const result = await this.operationEngine.run(operation);
      const status = result?.status || operation?.status || "UNKNOWN";
      this.#emit("operation.dispatched", { requestId: request.requestId, operationId: request.operationId, sectorId: sector.sectorId, status });
      this.audit({ type: "WORLD_OPERATION_DISPATCHED", requestId: request.requestId, operationId: request.operationId, sectorId: sector.sectorId, status, occurredAt: this.clock() });
      return { success: status === "COMPLETED", status, requestId: request.requestId, operationId: request.operationId, result };
    } catch (error) {
      this.#emit("operation.failed", { requestId: request.requestId, operationId: request.operationId, reason: "OPERATION_ENGINE_ERROR" });
      this.audit({ type: "WORLD_OPERATION_FAILED", requestId: request.requestId, operationId: request.operationId, reason: String(error?.message || error), occurredAt: this.clock() });
      return { success: false, status: "FAILED", reason: "OPERATION_ENGINE_ERROR" };
    }
  }
  snapshot() {
    return { nucleus: "WORDDARK", status: this.operationEngine ? "COMPOSED" : "FOUNDATION_ONLY", submittedRequests: this.submitted,
      sectors: this.sectorRegistry.snapshot(), approvals: this.approvalCenter.snapshot(), events: this.eventBus.snapshot(),
      emergencyStopAvailable: Boolean(this.emergencyStop?.assertRunning), operationEngineConnected: Boolean(this.operationEngine) };
  }
  #emit(type, detail) {
    const event = this.eventBus.publish(type, { ...detail, occurredAt: this.clock() });
    this.audit({ type, detail: event.detail, eventId: event.eventId, occurredAt: event.occurredAt }); return event;
  }
}
