/**
 * WordDark Core — Authority Boundary v1
 *
 * ADM Dono is an external trust boundary, NOT a role that the world can assign.
 * This module evaluates internal permissions only. It cannot create or grant
 * sovereign authority, authenticate people, or replace server-side identity checks.
 */
export const WORLD_ZONES = Object.freeze(["ADM", "DEV", "PUBLIC"]);
export const WORLD_ACTIONS = Object.freeze([
  "world.read", "world.operate", "world.configure",
  "dev.read", "dev.write", "dev.test",
  "public.read", "service.use",
  "authority.grant", "authority.revoke", "security.audit"
]);

const ROLE_PERMISSIONS = Object.freeze({
  "world-admin": Object.freeze([
    "world.read", "world.operate", "world.configure", "dev.read", "dev.test", "security.audit"
  ]),
  "developer": Object.freeze(["world.read", "dev.read", "dev.write", "dev.test"]),
  "public": Object.freeze(["public.read", "service.use"])
});

const INTERNAL_ROLES = new Set(Object.keys(ROLE_PERMISSIONS));

export function normalizePrincipal(principal = {}) {
  return {
    principalId: typeof principal.principalId === "string" ? principal.principalId : null,
    role: INTERNAL_ROLES.has(principal.role) ? principal.role : null,
    zone: WORLD_ZONES.includes(principal.zone) ? principal.zone : null,
    authenticated: principal.authenticated === true,
    active: principal.active === true,
    externalApproval: principal.externalApproval === true
  };
}

/**
 * Fail-closed internal authorization decision.
 * externalApproval is a context signal, not a credential; this function never
 * treats it as sufficient to grant a permission.
 */
export function authorizeWorldAction(principalInput, action) {
  const principal = normalizePrincipal(principalInput);
  const deny = reason => Object.freeze({ allowed: false, reason, principalId: principal.principalId, action });
  if (!principal.principalId || !principal.authenticated || !principal.active) {
    return deny("IDENTITY_NOT_ACTIVE");
  }
  if (!WORLD_ACTIONS.includes(action)) return deny("ACTION_NOT_RECOGNIZED");
  if (!principal.role || !principal.zone) return deny("ROLE_OR_ZONE_NOT_RECOGNIZED");

  // Internal principals can never enter the sovereign external authority layer.
  if (principal.role === "world-admin" && principal.zone !== "ADM") return deny("ROLE_ZONE_MISMATCH");
  if (principal.role === "developer" && principal.zone !== "DEV") return deny("ROLE_ZONE_MISMATCH");
  if (principal.role === "public" && principal.zone !== "PUBLIC") return deny("ROLE_ZONE_MISMATCH");

  if (action === "authority.grant" || action === "authority.revoke") {
    return deny("SOVEREIGN_AUTHORITY_OUTSIDE_WORLD");
  }
  if (principal.role === "world-admin" && ["dev.write"].includes(action)) {
    return deny("SEPARATION_OF_DUTIES");
  }
  if (principal.role === "developer" && ["world.operate", "world.configure", "world.write", "security.audit"].includes(action)) {
    return deny("DEV_CANNOT_ADMINISTER_WORLD");
  }
  if (principal.role === "public" && !["public.read", "service.use"].includes(action)) {
    return deny("PUBLIC_INTERFACE_ONLY");
  }
  if (!ROLE_PERMISSIONS[principal.role].includes(action)) return deny("PERMISSION_NOT_GRANTED");
  return Object.freeze({ allowed: true, reason: "PERMISSION_GRANTED", principalId: principal.principalId, action });
}

export function describeWorldBoundary() {
  return Object.freeze({
    version: 1,
    zones: Object.freeze(["ADM", "DEV", "PUBLIC"]),
    sovereignAuthority: "ADM_DONO_EXTERNAL",
    sovereignAuthorityIsInternalRole: false,
    defaultDecision: "DENY",
    publicCanInspectInternalBlueprint: false,
    developerCanGrantSovereignAuthority: false,
    worldCanGrantSovereignAuthority: false
  });
}
