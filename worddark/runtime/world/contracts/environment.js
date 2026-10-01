/* WordDark — Environment Contract
 * TEST e PROD são ambientes separados.
 */
class WordDarkEnvironment {
  constructor(source = {}) {
    this.name = source.name || "TEST";
    this.status = source.status || "ACTIVE";
    this.metadata = source.metadata || {};
  }

  static get NAMES() { return ["TEST","PROD"]; }
  static get STATUSES() { return ["ACTIVE","LOCKED"]; }

  validate() {
    const errors = [];
    if (!WordDarkEnvironment.NAMES.includes(this.name)) errors.push("environment inválido.");
    if (!WordDarkEnvironment.STATUSES.includes(this.status)) errors.push("status de environment inválido.");
    return { valid:errors.length === 0, errors };
  }

  isActive() { return this.status === "ACTIVE"; }
  toJSON() { return { name:this.name, status:this.status, metadata:this.metadata }; }
}
if (typeof module !== "undefined") module.exports = WordDarkEnvironment;
if (typeof window !== "undefined") window.WordDarkEnvironment = WordDarkEnvironment;
