/**
 * Ruan Personal Core — isolated foundation.
 * Pure data operations only: no DOM, network, account access or external side effects.
 */
export const SCHEMA_VERSION = 2;
export const DATA_KEY = "ruan.personal.foundation.v1";
export const COLLECTIONS = Object.freeze([
  "tasks", "shoppingLists", "reminders", "transactions", "assets",
  "budgets", "goals", "notes", "events"
]);

export function createInitialState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [],
    shoppingLists: [],
    reminders: [],
    transactions: [],
    assets: [],
    budgets: [],
    goals: [],
    notes: [],
    events: []
  };
}

export function normalizeState(input, now = new Date().toISOString()) {
  const base = createInitialState();
  if (!input || typeof input !== "object" || Array.isArray(input)) return base;
  const state = { ...base, ...input };
  for (const key of COLLECTIONS) {
    if (!Array.isArray(state[key])) state[key] = [];
  }
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
  if (input.schemaVersion !== undefined && !Number.isInteger(input.schemaVersion)) {
    errors.push("Versão do esquema inválida.");
  }
  for (const key of COLLECTIONS) {
    if (input[key] !== undefined && !Array.isArray(input[key])) {
      errors.push('A coleção "' + key + '" precisa ser uma lista.');
    }
  }
  for (const item of (Array.isArray(input.transactions) ? input.transactions : [])) {
    if (!item || typeof item.title !== "string" ||
        !["income", "expense"].includes(item.type) ||
        !Number.isFinite(item.amount) || item.amount <= 0) {
      errors.push("Há um lançamento financeiro inválido.");
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
  next.events.unshift({
    id: createId("evt"),
    type: String(type),
    entity: String(entity),
    entityId: String(entityId),
    detail: detail && typeof detail === "object" ? detail : {},
    createdAt: now
  });
  next.events = next.events.slice(0, 500);
  next.updatedAt = now;
  return next;
}

export function calculateFinance(state, options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const month = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  const transactions = Array.isArray(state?.transactions) ? state.transactions : [];
  const assets = Array.isArray(state?.assets) ? state.assets : [];
  const budgets = Array.isArray(state?.budgets) ? state.budgets : [];
  const validTransactions = transactions.filter(t =>
    t && Number.isFinite(t.amount) && t.amount > 0 &&
    ["income", "expense"].includes(t.type)
  );
  const inMonth = validTransactions.filter(t => String(t.date || t.createdAt || "").slice(0, 7) === month);
  const sum = (items, type) => items.filter(t => !type || t.type === type).reduce((total, t) => total + t.amount, 0);
  const income = sum(validTransactions, "income");
  const expenses = sum(validTransactions, "expense");
  const monthIncome = sum(inMonth, "income");
  const monthExpenses = sum(inMonth, "expense");
  const budgetStatus = budgets.map(b => {
    const spent = inMonth.filter(t => t.type === "expense" && String(t.category || "").toLowerCase() === String(b.category || "").toLowerCase()).reduce((n, t) => n + t.amount, 0);
    const limit = Number(b.limit) || 0;
    return { id: b.id, category: b.category, limit, spent, remaining: limit - spent, percent: limit > 0 ? Math.round(spent / limit * 100) : null };
  });
  return {
    balance: income - expenses,
    totalIncome: income,
    totalExpenses: expenses,
    month,
    monthIncome,
    monthExpenses,
    monthBalance: monthIncome - monthExpenses,
    reserves: assets.filter(a => a.type === "reserve").reduce((n, a) => n + (Number(a.amount) || 0), 0),
    investmentsRecorded: assets.filter(a => a.type === "investment").reduce((n, a) => n + (Number(a.amount) || 0), 0),
    budgets: budgetStatus
  };
}

/**
 * Calculate the next due date for a recurring task.
 * The caller is responsible for materializing and persisting generated tasks.
 */
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
  return {
    app: "Ruan",
    kind: "personal-data-export",
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now,
    data: normalized
  };
}

export function parseImportPayload(payload) {
  if (!payload || payload.app !== "Ruan" || payload.kind !== "personal-data-export" || !payload.data) {
    return { valid: false, errors: ["Este arquivo não parece ser uma exportação válida do Ruan."] };
  }
  const validation = validateState(payload.data);
  if (!validation.valid) return validation;
  return { valid: true, errors: [], data: normalizeState(payload.data) };
}
