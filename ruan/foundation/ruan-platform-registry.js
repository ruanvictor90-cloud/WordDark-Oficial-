/**
 * Ruan platform map.
 * The platform shell is the only owner of the global app drawer.
 * Pessoal and Shadow are independent apps, not nested copies of the shell.
 * Descriptive registry only: it is not a security boundary by itself.
 */
export const RUAN_PLATFORM = Object.freeze({
  id: "ruan",
  name: "Ruan",
  kind: "platform",
  globalNavigationOwner: true,
  apps: Object.freeze([
    { id: "home", name: "Central", path: "/", status: "active", dataScopes: ["platform.preferences", "platform.appStatus"] },
    { id: "personal", name: "Pessoal", path: "/pessoal/", status: "foundation", dataScopes: ["personal.tasks", "personal.shopping", "personal.reminders", "personal.finance", "personal.goals", "personal.projects", "personal.notes", "personal.calendar", "personal.habits", "personal.documents", "personal.wellbeing", "personal.bills", "personal.quickCaptures"] },
    { id: "shadow", name: "Shadow", path: "/shadow/", status: "foundation", dataScopes: ["shadow.preferences", "shadow.browserProfiles", "shadow.permissions", "shadow.extensions"] }
  ])
});

export function getPlatformApp(appId) {
  return RUAN_PLATFORM.apps.find(app => app.id === appId) || null;
}

export function listPlatformApps() {
  return RUAN_PLATFORM.apps.map(app => ({ ...app, dataScopes: [...app.dataScopes] }));
}

/** The global drawer belongs only to the Ruan platform shell. */
export function canRenderGlobalDrawer(surfaceId) {
  return surfaceId === RUAN_PLATFORM.id;
}

/**
 * Planning-time scope contract only. This is not authentication,
 * runtime enforcement, or cryptographic isolation.
 */
export function authorizePlatformScope({ appId, dataScope, grants = [] } = {}) {
  const app = getPlatformApp(appId);
  if (!app || !dataScope) return { allowed: false, reason: "unknown_app_or_scope" };
  if (app.dataScopes.includes(dataScope)) return { allowed: true, reason: "declared_scope" };
  if (grants.includes(appId + ":" + dataScope)) return { allowed: true, reason: "explicit_grant" };
  return { allowed: false, reason: "scope_not_granted" };
}
