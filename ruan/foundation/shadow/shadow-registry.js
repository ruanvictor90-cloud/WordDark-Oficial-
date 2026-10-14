/**
 * Declarative Shadow module map.
 * Darknet is the planned browser foundation; DarkEye is its contextual HUD layer.
 * No browser engine, AI, network calls, plugin execution, or security enforcement is implemented here.
 */
export const SHADOW_MODULES = Object.freeze([
  { id: "shadow-shell", name: "Shadow", status: "foundation", owns: ["shadow.preferences"], requestedScopes: [] },
  { id: "darknet-browser-core", name: "Darknet — base do navegador", status: "planned", owns: ["darknet.browserProfiles", "darknet.tabs", "darknet.bookmarks"], requestedScopes: ["browser.navigation", "browser.storage"] },
  { id: "darkeye-overlay", name: "DarkEye — camada visual", status: "planned", owns: ["darkeye.preferences", "darkeye.overlayLayout"], requestedScopes: ["context.pageRead", "translation.request", "project.confirmation.read"] },
  { id: "connectors", name: "Central de integrações", status: "planned", owns: ["shadow.connectorSettings"], requestedScopes: ["external.api"] },
  { id: "plugins", name: "Plugins", status: "planned", owns: ["shadow.extensions"], requestedScopes: ["plugin.metadata"] },
  { id: "permissions", name: "Permissões", status: "declarative", owns: ["shadow.permissions"], requestedScopes: ["permission.manage"] },
  { id: "activity", name: "Atividade", status: "planned", owns: ["shadow.activity"], requestedScopes: ["activity.read"] }
]);

export function getShadowModule(moduleId) {
  return SHADOW_MODULES.find(module => module.id === moduleId) || null;
}

export function listShadowModules() {
  return SHADOW_MODULES.map(module => ({ ...module, owns: [...module.owns], requestedScopes: [...module.requestedScopes] }));
}

export function validateExtensionManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return { valid: false, errors: ["manifest_must_be_an_object"] };
  for (const field of ["id", "name", "version", "kind", "publisher"]) {
    if (typeof manifest[field] !== "string" || !manifest[field].trim()) errors.push("missing_" + field);
  }
  if (!["plugin", "connector"].includes(manifest.kind)) errors.push("invalid_kind");
  if (!Array.isArray(manifest.requestedScopes) || manifest.requestedScopes.some(scope => typeof scope !== "string" || !scope.trim())) {
    errors.push("invalid_requested_scopes");
  }
  return { valid: errors.length === 0, errors };
}

/** Planning contract only: runtime security still requires real isolation and enforcement. */
export function authorizeShadowScope({ moduleId, scope, grants = [] } = {}) {
  const module = getShadowModule(moduleId);
  if (!module || !scope) return { allowed: false, reason: "unknown_module_or_scope" };
  if (module.owns.includes(scope)) return { allowed: true, reason: "module_owns_scope" };
  if (module.requestedScopes.includes(scope) && grants.includes(moduleId + ":" + scope)) return { allowed: true, reason: "explicit_grant" };
  return { allowed: false, reason: "scope_not_granted" };
}
