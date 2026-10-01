/* WordDark — Global Identity Contract
 * Identidade responde: "quem é?"
 */

class WordDarkIdentity {
  constructor(source = {}) {
    this.identityId = source.identityId || null;
    this.type = source.type || "UNIT";
    this.ownerId = source.ownerId || null;
    this.parentId = source.parentId || null;
    this.status = source.status || "ACTIVE";
    this.metadata = source.metadata || {};
    this.createdAt = source.createdAt || new Date().toISOString();
  }
  static get TYPES() { return ["PERSON","DEV","SYSTEM","UNIT","SERVICE"]; }
  static get STATUSES() { return ["ACTIVE","SUSPENDED","REVOKED"]; }
  validate() {
    const errors = [];
    if (!this.identityId) errors.push("identityId é obrigatório.");
    if (!WordDarkIdentity.TYPES.includes(this.type)) errors.push("type de identidade inválido.");
    if (!WordDarkIdentity.STATUSES.includes(this.status)) errors.push("status de identidade inválido.");
    return { valid: errors.length === 0, errors };
  }
  isActive() { return this.status === "ACTIVE"; }
  toJSON() { return { identityId:this.identityId,type:this.type,ownerId:this.ownerId,parentId:this.parentId,status:this.status,metadata:this.metadata,createdAt:this.createdAt }; }
}
if (typeof module !== "undefined") module.exports = WordDarkIdentity;
if (typeof window !== "undefined") window.WordDarkIdentity = WordDarkIdentity;