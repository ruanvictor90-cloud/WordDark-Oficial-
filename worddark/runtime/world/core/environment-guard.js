/* WordDark — Environment Guard
 * Barreira explícita entre TEST e PROD.
 * Fail-closed: ambiente ausente, desconhecido ou sem estado verificável é bloqueado.
 * PROD exige aprovação separada da autorização normal da operação.
 */
class WordDarkEnvironmentGuard {
  constructor({ environments = {}, productionApproval = null } = {}) {
    this.environments = environments;
    this.productionApproval = productionApproval;
  }

  canRun(operation) {
    if (!operation || typeof operation !== "object") {
      return { allowed: false, reason: "OPERACAO_INVALIDA" };
    }

    const name = operation.environment;
    if (name !== "TEST" && name !== "PROD") {
      return { allowed: false, reason: "AMBIENTE_INVALIDO" };
    }

    const environment = this.environments[name];
    if (!environment || typeof environment.isActive !== "function") {
      return { allowed: false, reason: "AMBIENTE_NAO_CONFIGURADO" };
    }

    if (!environment.isActive()) {
      return { allowed: false, reason: "AMBIENTE_BLOQUEADO" };
    }

    if (name === "PROD") {
      if (typeof this.productionApproval !== "function") {
        return { allowed: false, reason: "PROD_SEM_APROVACAO_CONFIGURADA" };
      }

      let approval;
      try {
        approval = this.productionApproval(operation);
      } catch {
        return { allowed: false, reason: "PROD_APROVACAO_FALHOU" };
      }

      if (!approval || approval.allowed !== true) {
        return {
          allowed: false,
          reason: (approval && approval.reason) || "PROD_NAO_AUTORIZADO"
        };
      }
    }

    return { allowed: true, reason: "ENVIRONMENT_ALLOWED" };
  }
}

if (typeof module !== "undefined") module.exports = WordDarkEnvironmentGuard;
if (typeof window !== "undefined") window.WordDarkEnvironmentGuard = WordDarkEnvironmentGuard;
