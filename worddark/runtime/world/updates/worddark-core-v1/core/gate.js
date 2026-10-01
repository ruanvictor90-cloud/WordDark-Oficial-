/* WordDark Lab — Gate Contract
 * O portão recebe e encaminha. Não executa.
 */

class WordDarkLabGate {
  constructor(source = {}) {
    this.gateId = source.gateId || null;
    this.type = source.type || "SERVICE";
    this.destinationId = source.destinationId || null;
    this.allowedProfiles = Array.isArray(source.allowedProfiles)
      ? [...source.allowedProfiles]
      : [];
    this.status = source.status || "ACTIVE";
    this.audit = [];
  }

  validate() {
    const errors = [];
    if (!this.gateId) errors.push("gateId é obrigatório.");
    if (!this.destinationId) errors.push("destinationId é obrigatório.");
    if (!["ACTIVE", "LOCKED"].includes(this.status)) {
      errors.push("status de portão inválido.");
    }
    return { valid: errors.length === 0, errors };
  }

  receive({ profile = null, context = null } = {}) {
    if (this.status !== "ACTIVE") {
      return this._reject("GATE_LOCKED", profile, context);
    }

    if (
      this.allowedProfiles.length > 0 &&
      !this.allowedProfiles.includes(profile)
    ) {
      return this._reject("PROFILE_NOT_ALLOWED", profile, context);
    }

    const entry = {
      success: true,
      status: "ACCEPTED",
      gateId: this.gateId,
      destinationId: this.destinationId,
      profile,
      timestamp: new Date().toISOString()
    };

    this.audit.push(entry);
    return entry;
  }

  _reject(reason, profile, context) {
    const entry = {
      success: false,
      status: "REJECTED",
      reason,
      gateId: this.gateId,
      destinationId: this.destinationId,
      profile,
      context: context || null,
      timestamp: new Date().toISOString()
    };

    this.audit.push(entry);
    return entry;
  }

  getAudit() {
    return [...this.audit];
  }
}

if (typeof module !== "undefined") module.exports = WordDarkLabGate;
if (typeof window !== "undefined") window.WordDarkLabGate = WordDarkLabGate;
