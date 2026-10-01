/* WordDark — Account Contract
 * Conta identifica uma forma de acesso ao WordDark.
 * Autenticação real fica fora deste contrato.
 */
class WordDarkAccount {
  constructor(source = {}) {
    this.accountId = source.accountId || null;
    this.identityId = source.identityId || null;
    this.type = source.type || "PERSONAL";
    this.status = source.status || "ACTIVE";
    this.createdAt = source.createdAt || new Date().toISOString();
    this.metadata = source.metadata || {};
  }

  static get TYPES() { return ["DEV","PERSONAL","SYSTEM"]; }
  static get STATUSES() { return ["ACTIVE","SUSPENDED","REVOKED"]; }

  validate() {
    const errors = [];
    if (!this.accountId) errors.push("accountId é obrigatório.");
    if (!this.identityId) errors.push("identityId é obrigatório.");
    if (!WordDarkAccount.TYPES.includes(this.type)) errors.push("type de conta inválido.");
    if (!WordDarkAccount.STATUSES.includes(this.status)) errors.push("status de conta inválido.");
    return { valid:errors.length === 0, errors };
  }

  isActive() { return this.status === "ACTIVE"; }
  toJSON() { return { accountId:this.accountId, identityId:this.identityId, type:this.type, status:this.status, createdAt:this.createdAt, metadata:this.metadata }; }
}
if (typeof module !== "undefined") module.exports = WordDarkAccount;
if (typeof window !== "undefined") window.WordDarkAccount = WordDarkAccount;
