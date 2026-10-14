/**
 * Ruan module registry.
 * Describes planned/available personal areas and their default data boundaries.
 * It does not render UI or grant runtime capabilities by itself.
 */
export const RUAN_APPS = Object.freeze([
  { id: "overview", name: "Visão geral", status: "active", owns: [], reads: ["tasks.summary", "shopping.summary", "reminders.summary", "finance.summary", "goals.summary"], actions: ["view"] },
  { id: "tasks", name: "Tarefas", status: "active", owns: ["tasks"], reads: [], actions: ["view", "create", "update", "complete", "delete"] },
  { id: "shopping", name: "Compras", status: "active", owns: ["shoppingLists"], reads: [], actions: ["view", "create", "update", "complete", "delete"] },
  { id: "reminders", name: "Lembretes", status: "active", owns: ["reminders"], reads: [], actions: ["view", "create", "update", "complete", "delete"] },
  { id: "finance", name: "Financeiro", status: "active", owns: ["transactions", "assets", "budgets"], reads: [], actions: ["view", "create", "update", "delete", "export"] },
  { id: "goals", name: "Objetivos", status: "planned", owns: ["goals"], reads: [], actions: ["view", "create", "update", "complete", "delete"] },
  { id: "projects", name: "Projetos", status: "planned", owns: ["projects"], reads: [], actions: ["view", "create", "update", "complete", "delete"] },
  { id: "notes", name: "Notas e ideias", status: "planned", owns: ["notes"], reads: [], actions: ["view", "create", "update", "delete", "export"] },
  { id: "calendar", name: "Calendário", status: "planned", owns: ["calendarItems"], reads: ["tasks.dates", "reminders.dates"], actions: ["view", "create", "update", "delete"] },
  { id: "routine", name: "Rotina e hábitos", status: "planned", owns: ["habits", "routineLogs"], reads: [], actions: ["view", "create", "update", "complete", "delete"] },
  { id: "documents", name: "Documentos pessoais", status: "planned", owns: ["documents"], reads: [], actions: ["view", "create", "update", "delete", "export"] },
  { id: "wellbeing", name: "Bem-estar", status: "planned", owns: ["wellbeingLogs"], reads: [], actions: ["view", "create", "update", "delete", "export"] }
]);

export function getApp(appId) {
  return RUAN_APPS.find(app => app.id === appId) || null;
}

export function listApps({ status } = {}) {
  return RUAN_APPS.filter(app => !status || app.status === status).map(app => ({ ...app, owns: [...app.owns], reads: [...app.reads], actions: [...app.actions] }));
}

/**
 * Access is denied unless the actor is the owner and the app declares the action.
 * Cross-module data reads require a matching explicit grant.
 */
export function authorize({ actor = "owner", appId, action, dataScope, grants = [] } = {}) {
  const app = getApp(appId);
  if (actor !== "owner" || !app || !app.actions.includes(action)) {
    return { allowed: false, reason: "owner_or_action_required" };
  }
  if (!dataScope) return { allowed: true, reason: "declared_app_action" };
  if (app.owns.includes(dataScope)) return { allowed: true, reason: "module_owns_scope" };
  if (app.reads.includes(dataScope)) return { allowed: true, reason: "declared_summary_read" };
  if (grants.includes(appId + ":" + action + ":" + dataScope)) {
    return { allowed: true, reason: "explicit_grant" };
  }
  return { allowed: false, reason: "scope_not_granted" };
}
