/* WordDark — SucoCast Operation Runner
 * Orquestra uma operação registrada com um ou vários adaptadores externos.
 */
class SucoCastOperationRunner {
  constructor(core, permissions) {
    this.core = core;
    this.permissions = permissions;
  }

  run(operationId, input) {
    const context = input || {};
    const operation = this.core.getOperation(operationId);

    if (!operation) {
      return {
        success:false,
        status:"REJECTED",
        reason:"Operação não registrada.",
        operationId:operationId
      };
    }

    const actor = context.actor || (this.core.identity && this.core.identity.identityId);
    const capability = operation.capability;

    if (capability && !this.permissions.can(actor, capability)) {
      return {
        success:false,
        status:"REJECTED",
        reason:"Capacidade não concedida.",
        operationId:operationId
      };
    }

    const requestedIntegrations = Array.isArray(context.integrationIds)
      ? context.integrationIds
      : (context.integrationId ? [context.integrationId] : []);

    const integrationIds = Array.from(new Set(requestedIntegrations));

    if (integrationIds.length === 0) {
      return {
        success:false,
        status:"REJECTED",
        reason:"Nenhuma integração selecionada.",
        operationId:operationId
      };
    }

    const compatible = operation.compatibleIntegrations || [];
    const incompatible = integrationIds.filter(function(id) {
      return compatible.length > 0 && !compatible.includes(id);
    });

    if (incompatible.length > 0) {
      return {
        success:false,
        status:"REJECTED",
        reason:"Uma ou mais integrações são incompatíveis com a operação.",
        operationId:operationId,
        incompatibleIntegrations:incompatible
      };
    }

    const batchId = context.batchId || ("PUB-" + Math.random().toString(36).slice(2,10).toUpperCase());
    const results = [];

    integrationIds.forEach((integrationId) => {
      const integration = this.core.getIntegration(integrationId);

      if (!integration) {
        const failed = {
          success:false,
          status:"FAILED",
          reason:"Integração não encontrada.",
          integrationId:integrationId
        };
        results.push(failed);
        this.core.record({
          type:"OPERATION_FAILED",
          batchId:batchId,
          operationId:operationId,
          integrationId:integrationId,
          result:failed
        });
        return;
      }

      const result = integration.execute(
        operation.action || "publish",
        context.payload || {}
      );

      results.push(Object.assign({
        integrationId:integrationId
      }, result));

      this.core.record({
        type:result.success ? "OPERATION_CONFIRMED" : "OPERATION_FAILED",
        batchId:batchId,
        operationId:operationId,
        integrationId:integrationId,
        result:result
      });
    });

    const confirmed = results.filter(function(result){ return result.success; }).length;
    const failed = results.length - confirmed;
    const status = failed === 0 ? "CONFIRMED" : (confirmed > 0 ? "PARTIAL" : "FAILED");

    return {
      success: confirmed > 0,
      status: status,
      operationId: operationId,
      batchId: batchId,
      requestedIntegrations: integrationIds,
      confirmedCount: confirmed,
      failedCount: failed,
      results: results
    };
  }
}

if (typeof window !== "undefined") window.SucoCastOperationRunner = SucoCastOperationRunner;
if (typeof module !== "undefined" && module.exports) module.exports = SucoCastOperationRunner;
