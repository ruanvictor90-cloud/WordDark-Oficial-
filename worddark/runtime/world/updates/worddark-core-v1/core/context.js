/* WordDark Lab — Execution Context
 * Protótipo isolado. Não altera o contrato operacional existente.
 */

class WordDarkLabContext {
  constructor(source = {}) {
    this.clientId = source.clientId || null;
    this.projectId = source.projectId || null;
    this.resourceId = source.resourceId || null;
    this.originId = source.originId || null;
    this.destinationId = source.destinationId || null;
    this.serviceId = source.serviceId || null;
    this.environment = source.environment || "TEST";
  }

  validate() {
    const errors = [];
    if (!this.clientId) errors.push("clientId é obrigatório.");
    if (!this.resourceId) errors.push("resourceId é obrigatório.");
    if (!this.originId) errors.push("originId é obrigatório.");
    if (!this.destinationId) errors.push("destinationId é obrigatório.");
    if (!this.serviceId) errors.push("serviceId é obrigatório.");
    if (!["TEST", "PROD"].includes(this.environment)) {
      errors.push("environment deve ser TEST ou PROD.");
    }
    return { valid: errors.length === 0, errors };
  }

  toJSON() {
    return {
      clientId: this.clientId,
      projectId: this.projectId,
      resourceId: this.resourceId,
      originId: this.originId,
      destinationId: this.destinationId,
      serviceId: this.serviceId,
      environment: this.environment
    };
  }
}

if (typeof module !== "undefined") module.exports = WordDarkLabContext;
if (typeof window !== "undefined") window.WordDarkLabContext = WordDarkLabContext;
