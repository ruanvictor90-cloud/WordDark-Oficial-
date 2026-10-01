/* WordDark — SucoCast Permission Manager
 * Capacidades são específicas; não existe acesso externo genérico.
 */
class SucoCastPermissionManager {
  constructor() {
    this.permissions = new Map();
  }

  grant(subjectId, capability) {
    if (!subjectId || !capability) throw new Error("Permissão inválida.");
    if (!this.permissions.has(subjectId)) this.permissions.set(subjectId, new Set());
    this.permissions.get(subjectId).add(capability);
  }

  revoke(subjectId, capability) {
    const set = this.permissions.get(subjectId);
    if (set) set.delete(capability);
  }

  can(subjectId, capability) {
    const set = this.permissions.get(subjectId);
    return !!set && set.has(capability);
  }

  list(subjectId) {
    const set = this.permissions.get(subjectId);
    return set ? Array.from(set) : [];
  }
}

if (typeof window !== "undefined") window.SucoCastPermissionManager = SucoCastPermissionManager;
if (typeof module !== "undefined" && module.exports) module.exports = SucoCastPermissionManager;
