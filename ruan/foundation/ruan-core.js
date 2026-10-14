/**
 * Ruan Personal Core — domain contracts and pure data operations.
 * No DOM, network, account access or external side effects.
 */
export const SCHEMA_VERSION = 3;
export const DATA_KEY = "ruan.personal.foundation.v1";
export const COLLECTIONS = Object.freeze([
  "tasks", "shoppingLists", "reminders", "transactions", "assets",
  "budgets", "goals", "notes", "events", "projects", "calendarItems",
  "habits", "routineLogs", "documents", "wellbeingLogs", "quickCaptures",
  "bills"
]);

export function createInitialState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [], shoppingLists: [], reminders: [], transactions: [], assets: [],
    budgets: [], goals: [], notes: [], events: [], projects: [], calendarItems: [],
    habits: [], routineLogs: [], documents: [], wellbeingLogs: [], quickCaptures: [],
    bills: [], preferences: { weekStartsOn: 1, currency: "BRL" }
  };
}

/** Add newly introduced collections without discarding older user data. */
export function normalizeState(input, now = new Date().toISOString()) {
  const base = createInitialState();
  if (!input || typeof input !== "object" || Array.isArray(input)) return base;
  const state = { ...base, ...input };
  for (const key of COLLECTIONS) {
    if (!Array.isArray(state[key])) state[key] = [];
  }
  state.preferences = input.preferences && typeof input.preferences === "object" && !Array.isArray(input.preferences)
    ? { ...base.preferences, ...input.preferences }
    : base.preferences;
  state.schemaVersion = SCHEMA_VERSION;
  state.createdAt = typeof input.createdAt === "string" ? input.createdAt : base.createdAt;
  state.updatedAt = now;
  return state;
}

export function validateState(input) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, errors: ["O arquivo precisa conter um objeto de dados do Ruan."] };
  }
  if (input.schemaVersion !== undefined && !Number.isInteger(input.schemaVersion)) errors.push("Versão do esquema inválida.");
  for (const key of COLLECTIONS) {
    if (input[key] !== undefined && !Array.isArray(input[key])) errors.push('A coleção "' + key + '" precisa ser uma lista.');
  }
  if (input.preferences !== undefined && (!input.preferences || typeof input.preferences !== "object" || Array.isArray(input.preferences))) {
    errors.push("As preferências precisam ser um objeto.");
  }
  for (const item of (Array.isArray(input.transactions) ? input.transactions : [])) {
    if (!item || typeof item.title !== "string" || !["income", "expense"].includes(item.type) ||
        !Number.isFinite(item.amount) || item.amount <= 0) {
      errors.push("Há um lançamento financeiro inválido.");
      break;
    }
  }
  for (const item of (Array.isArray(input.bills) ? input.bills : [])) {
    if (!item || typeof item.title !== "string" || !item.title.trim() ||
        !Number.isFinite(item.amount) || item.amount < 0 ||
        (item.status && !["open", "paid", "cancelled"].includes(item.status))) {
      errors.push("Há uma conta futura inválida.");
      break;
    }
  }
  return { valid: errors.length === 0, errors };
}

export function createId(prefix = "item", random = Math.random, clock = Date.now) {
  return prefix + "_" + clock().toString(36) + "_" + random().toString(36).slice(2, 10);
}

export function createEvent(state, type, entity, entityId, detail = {}, now = new Date().toISOString()) {
  const next = normalizeState(state, now);
  next.events.unshift({ id: createId("evt"), type: String(type), entity: String(entity), entityId: String(entityId),
    detail: detail && typeof detail === "object" ? detail : {}, createdAt: now });
  next.events = next.events.slice(0, 500);
  next.updatedAt = now;
  return next;
}

function localDateKey(date) { return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0"); }

export function calculateFinance(state, options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const month = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  const transactions = Array.isArray(state?.transactions) ? state.transactions : [];
  const assets = Array.isArray(state?.assets) ? state.assets : [];
  const budgets = Array.isArray(state?.budgets) ? state.budgets : [];
  const bills = Array.isArray(state?.bills) ? state.bills : [];
  const validTransactions = transactions.filter(t => t && Number.isFinite(t.amount) && t.amount > 0 && ["income", "expense"].includes(t.type));
  const inMonth = validTransactions.filter(t => String(t.date || t.createdAt || "").slice(0, 7) === month);
  const sum = (items, type) => items.filter(t => !type || t.type === type).reduce((total, t) => total + t.amount, 0);
  const monthIncome = sum(inMonth, "income");
  const monthExpenses = sum(inMonth, "expense");
  const budgetStatus = budgets.map(b => {
    const spent = inMonth.filter(t => t.type === "expense" && String(t.category || "").toLowerCase() === String(b.category || "").toLowerCase()).reduce((n, t) => n + t.amount, 0);
    const limit = Number(b.limit) || 0;
    return { id: b.id, category: b.category, limit, spent, remaining: limit - spent, percent: limit > 0 ? Math.round(spent / limit * 100) : null };
  });
  const upcomingBills = bills.filter(b => b.status !== "paid" && b.status !== "cancelled" && b.dueDate)
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
  return {
    balance: sum(validTransactions, "income") - sum(validTransactions, "expense"),
    totalIncome: sum(validTransactions, "income"),
    totalExpenses: sum(validTransactions, "expense"),
    month, monthIncome, monthExpenses, monthBalance: monthIncome - monthExpenses,
    reserves: assets.filter(a => a.type === "reserve").reduce((n, a) => n + (Number(a.amount) || 0), 0),
    investmentsRecorded: assets.filter(a => a.type === "investment").reduce((n, a) => n + (Number(a.amount) || 0), 0),
    budgets: budgetStatus,
    upcomingBills,
    overdueBills: upcomingBills.filter(b => b.dueDate < localDateKey(now)),
    billsDueThisMonth: upcomingBills.filter(b => String(b.dueDate).slice(0, 7) === month)
  };
}

/** Search known personal collections. This is local in-memory search, not full-text indexing. */
export function searchPersonalData(state, query, options = {}) {
  const q = String(query || "").trim().toLocaleLowerCase("pt-BR");
  if (!q) return [];
  const sourceMap = {
    tasks: "tasks", shopping: "shoppingLists", reminders: "reminders", finance: "transactions",
    goals: "goals", notes: "notes", projects: "projects", calendar: "calendarItems",
    habits: "habits", documents: "documents", bills: "bills", wellbeing: "wellbeingLogs"
  };
  const allowed = options.collections ? new Set(options.collections) : new Set(Object.keys(sourceMap));
  const results = [];
  for (const [kind, key] of Object.entries(sourceMap)) {
    if (!allowed.has(kind)) continue;
    const records = Array.isArray(state?.[key]) ? state[key] : [];
    for (const record of records) {
      const text = [record.title, record.name, record.description, record.category, record.notes, record.content]
        .filter(value => typeof value === "string").join(" ").toLocaleLowerCase("pt-BR");
      if (text.includes(q)) results.push({ kind, id: record.id || null, title: record.title || record.name || "(sem título)", date: record.dueDate || record.date || record.when || null });
    }
  }
  return results.slice(0, Math.max(1, Math.min(Number(options.limit) || 50, 200)));
}

/** Small summary contract for widgets; values come from actual stored records. */
export function createDashboardSummary(state, options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const today = localDateKey(now);
  const finance = calculateFinance(state, { now });
  const tasks = Array.isArray(state?.tasks) ? state.tasks : [];
  const reminders = Array.isArray(state?.reminders) ? state.reminders : [];
  const shoppingLists = Array.isArray(state?.shoppingLists) ? state.shoppingLists : [];
  const openTasks = tasks.filter(t => !t.done);
  return {
    date: today,
    tasksToday: tasks.filter(t => (t.dueDate || t.date) === today),
    openTasks: openTasks.length,
    overdueTasks: openTasks.filter(t => (t.dueDate || t.date) && (t.dueDate || t.date) < today).length,
    activeReminders: reminders.filter(r => !r.done).length,
    uncheckedShoppingItems: shoppingLists.reduce((n, list) => n + (Array.isArray(list.items) ? list.items.filter(item => !item.done).length : 0), 0),
    activeProjects: (state?.projects || []).filter(p => !["done", "archived"].includes(p.status)).length,
    activeGoals: (state?.goals || []).filter(g => !["done", "archived"].includes(g.status)).length,
    overdueBills: finance.overdueBills.length,
    finance
  };
}

/** Calculate the next due date for a recurring task. */
export function nextRecurrenceDate(task, after = new Date()) {
  if (!task || !task.recurrence || !task.dueDate) return null;
  const date = new Date(task.dueDate + "T12:00:00");
  if (Number.isNaN(date.getTime())) return null;
  const target = new Date(after);
  target.setHours(23, 59, 59, 999);
  const candidate = new Date(date);
  let guard = 0;
  while (candidate <= target && guard < 400) {
    if (task.recurrence === "daily") candidate.setDate(candidate.getDate() + 1);
    else if (task.recurrence === "weekly") candidate.setDate(candidate.getDate() + 7);
    else if (task.recurrence === "monthly") {
      const originalDay = candidate.getDate();
      candidate.setDate(1);
      candidate.setMonth(candidate.getMonth() + 1);
      const lastDay = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate();
      candidate.setDate(Math.min(originalDay, lastDay));
    } else return null;
    guard++;
  }
  if (task.recurrenceEnd && candidate.toISOString().slice(0, 10) > task.recurrenceEnd) return null;
  return candidate.toISOString().slice(0, 10);
}

export function createExportPayload(state, now = new Date().toISOString()) {
  const normalized = normalizeState(state, now);
  return { app: "Ruan", kind: "personal-data-export", schemaVersion: SCHEMA_VERSION, exportedAt: now, data: normalized };
}

export function parseImportPayload(payload) {
  if (!payload || payload.app !== "Ruan" || payload.kind !== "personal-data-export" || !payload.data) {
    return { valid: false, errors: ["Este arquivo não parece ser uma exportação válida do Ruan."] };
  }
  const validation = validateState(payload.data);
  if (!validation.valid) return validation;
  return { valid: true, errors: [], data: normalizeState(payload.data) };
}
