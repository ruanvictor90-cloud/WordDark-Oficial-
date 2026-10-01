/* WordDark — Core V1 Composition Bridge
 * Ponte isolada entre o laboratório Core V1 e o runtime operacional consolidado.
 *
 * Regra:
 * 1. O bloco V1 valida contexto, portão e permissão contextual.
 * 2. Nenhum contrato existente de world/core é substituído.
 * 3. A operação é traduzida para o contrato global existente.
 * 4. A execução continua pertencendo ao WordDarkWorldRuntime/OperationEngine.
 */
class WordDarkCoreV1CompositionBridge {
  constructor({ runtime = null, gate = null, permissionSet = null } = {}) {
    this.runtime = runtime;
    this.gate = gate;
    this.permissionSet = permissionSet;
  }

  validateDependencies() {
    const errors = [];
    if (!this.runtime || typeof this.runtime.createOperation !== "function" ||
        typeof this.runtime.runOperation !== "function") {
      errors.push("Runtime operacional consolidado não configurado.");
    }
    if (!this.gate || typeof this.gate.receive !== "function") {
      errors.push("Gate V1 não configurado.");
    }
    if (!this.permissionSet || typeof this.permissionSet.authorize !== "function") {
      errors.push("PermissionSet V1 não configurado.");
    }
    return { valid: errors.length === 0, errors };
  }

  buildLegacySource(labOperation) {
    const context = labOperation.context.toJSON();
    const permission = labOperation.permission || {};

    return {
      operationId: labOperation.operationId,
      requesterId: labOperation.requesterId,
      originId: context.originId,
      destinationId: context.destinationId,
      operationType: context.serviceId,
      environment: context.environment,
      clientId: context.clientId,
      projectId: context.projectId,
      resourceId: context.resourceId,
      serviceId: context.serviceId,
      context,
      request: { ...labOperation.request },
      payload: {
        ...labOperation.request,
        identityId: labOperation.requesterId,
        capability: permission.capability || context.serviceId,
        action: permission.action || "request",
        scope: permission.scope || context.destinationId,
        clientId: context.clientId,
        projectId: context.projectId,
        resourceId: context.resourceId,
        labContext: context,
        labPermission: permission
      }
    };
  }

  authorizeEntry(labOperation, profile) {
    const context = labOperation.context.toJSON();
    const permission = labOperation.permission || {};

    const gateResult = this.gate.receive({
      profile,
      context
    });

    if (!gateResult.success) return gateResult;

    const allowed = this.permissionSet.authorize({
      profile,
      capability: permission.capability,
      action: permission.action,
      resourceId: context.resourceId,
      clientId: context.clientId,
      environment: context.environment
    });

    if (!allowed) {
      return {
        success: false,
        status: "REJECTED",
        reason: "ACCESS_DENIED",
        gateId: this.gate.gateId,
        destinationId: context.destinationId
      };
    }

    return {
      success: true,
      status: "ACCEPTED",
      gate: gateResult
    };
  }

  process(labOperation, { profile = null } = {}) {
    const dependencies = this.validateDependencies();
    if (!dependencies.valid) {
      return { success: false, status: "BLOCKED", errors: dependencies.errors };
    }

    const validation = labOperation.validate();
    if (!validation.valid) {
      return { success: false, status: "REJECTED", stage: "V1_VALIDATION", errors: validation.errors };
    }

    const entry = this.authorizeEntry(labOperation, profile);
    if (!entry.success) {
      return { success: false, status: "REJECTED", stage: "V1_ENTRY", ...entry };
    }

    const source = this.buildLegacySource(labOperation);
    const operation = this.runtime.createOperation(source);

    if (operation.status === "REJECTED") {
      return {
        success: false,
        status: "REJECTED",
        stage: "LEGACY_VALIDATION",
        operation
      };
    }

    const result = this.runtime.runOperation(operation);

    labOperation.addHistory("COMPOSITION_BRIDGE_EXECUTED", {
      legacyOperationId: operation.operationId,
      legacyStatus: result && result.status ? result.status : null
    });

    return {
      success: true,
      status: "DELEGATED",
      labOperation,
      legacyOperation: result
    };
  }
}

if (typeof module !== "undefined") module.exports = WordDarkCoreV1CompositionBridge;
if (typeof window !== "undefined") {
  window.WordDarkCoreV1CompositionBridge = WordDarkCoreV1CompositionBridge;
}
