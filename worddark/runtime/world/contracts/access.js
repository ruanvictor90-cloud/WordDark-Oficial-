/* WordDark — Global Access Contract
 * Regra explícita de acesso: identidade + capability + action + ambiente + escopo + validade.
 */
class WordDarkAccessRule {
  constructor(source = {}) {
    this.identityId = source.identityId || null;
    this.capability = source.capability || null;
    this.action = source.action || null;
    this.environment = source.environment || "TEST";
    this.scope = source.scope || "*";
    this.expiresAt = source.expiresAt || null;
    this.grantedAt = source.grantedAt || new Date().toISOString();
  }

  static get ENVIRONMENTS() { return ["TEST","PROD"]; }

  validate() {
    const errors = [];
    if (!this.identityId) errors.push("identityId é obrigatório.");
    if (!this.capability) errors.push("capability é obrigatória.");
    if (!this.action) errors.push("action é obrigatória.");
    if (!WordDarkAccessRule.ENVIRONMENTS.includes(this.environment)) {
      errors.push("environment deve ser TEST ou PROD.");
    }
    if (!this.scope) errors.push("scope é obrigatório.");
    if (this.expiresAt && !Number.isFinite(new Date(this.expiresAt).getTime())) {
      errors.push("expiresAt deve ser uma data válida.");
    }
    if (this.grantedAt && !Number.isFinite(new Date(this.grantedAt).getTime())) {
      errors.push("grantedAt deve ser uma data válida.");
    }
    return {valid:errors.length===0,errors};
  }

  matches(request={}) {
    if (this.identityId!==request.identityId ||
        this.capability!==request.capability ||
        this.action!==request.action ||
        this.environment!==request.environment) return false;
    if (this.scope!=="*" && this.scope!==request.scope) return false;
    if (this.expiresAt && new Date(this.expiresAt).getTime()<=Date.now()) return false;
    return true;
  }

  toJSON() {
    return {
      identityId:this.identityId, capability:this.capability, action:this.action,
      environment:this.environment, scope:this.scope, expiresAt:this.expiresAt,
      grantedAt:this.grantedAt
    };
  }
}
if (typeof module !== "undefined") module.exports = WordDarkAccessRule;
if (typeof window !== "undefined") window.WordDarkAccessRule = WordDarkAccessRule;
