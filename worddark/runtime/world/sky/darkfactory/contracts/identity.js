/*
 * WordDark — Identity Contract
 * CONTRACTS v1
 *
 * Responsabilidade:
 * Representar de forma estável quem é uma unidade do WordDark.
 *
 * Identidade não concede autorização.
 */

class WordDarkIdentity {

  constructor({
    identityId,
    type,
    name,
    parentId = null,
    status = "ACTIVE",
    version = 1
  }) {
    this.identityId = identityId;
    this.type = type;
    this.name = name;
    this.parentId = parentId;
    this.status = status;
    this.version = version;
  }

  validate() {
    const errors = [];

    if (!this.identityId) errors.push("identityId não informado.");
    if (!this.type) errors.push("type não informado.");
    if (!this.name) errors.push("name não informado.");
    if (!Number.isInteger(this.version) || this.version < 1) {
      errors.push("version inválida.");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  isActive() {
    return this.status === "ACTIVE";
  }

  toJSON() {
    return {
      identityId: this.identityId,
      type: this.type,
      name: this.name,
      parentId: this.parentId,
      status: this.status,
      version: this.version
    };
  }
}

if (typeof window !== "undefined") {
  window.WordDarkIdentity = WordDarkIdentity;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = WordDarkIdentity;
}
