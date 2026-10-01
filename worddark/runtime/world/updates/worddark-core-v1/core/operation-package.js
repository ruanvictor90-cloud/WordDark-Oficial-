/* WordDark Lab — Operation Package
 * Protótipo de um pacote de operação independente.
 * O objetivo é preparar o futuro contrato sem substituir WD Operation.
 */

const Context = typeof require === "function"
  ? require("./context")
  : (typeof window !== "undefined" ? window.WordDarkLabContext : null);

class WordDarkLabOperationPackage {
  constructor(source = {}) {
    this.operationId = source.operationId || null;
    this.requesterId = source.requesterId || null;
    this.context = source.context instanceof Context
      ? source.context
      : new Context(source.context || {});
    this.permission = source.permission || null;
    this.request = source.request || {};
    this.resources = source.resources || [];
    this.history = Array.isArray(source.history) ? [...source.history] : [];
  }

  validate() {
    const errors = [];

    if (!this.operationId) errors.push("operationId é obrigatório.");
    if (!this.requesterId) errors.push("requesterId é obrigatório.");

    const context = this.context.validate();
    if (!context.valid) errors.push(...context.errors);

    if (!this.permission) errors.push("permission é obrigatório.");
    if (!this.request || typeof this.request !== "object") {
      errors.push("request inválido.");
    }

    return { valid: errors.length === 0, errors };
  }

  addHistory(event, data = {}) {
    this.history.push({
      event,
      timestamp: new Date().toISOString(),
      data
    });
    return this.history[this.history.length - 1];
  }

  toJSON() {
    return {
      operationId: this.operationId,
      requesterId: this.requesterId,
      context: this.context.toJSON(),
      permission: this.permission,
      request: this.request,
      resources: [...this.resources],
      history: [...this.history]
    };
  }
}

if (typeof module !== "undefined") module.exports = WordDarkLabOperationPackage;
if (typeof window !== "undefined") window.WordDarkLabOperationPackage = WordDarkLabOperationPackage;
