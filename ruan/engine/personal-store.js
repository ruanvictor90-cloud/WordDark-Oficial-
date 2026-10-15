import {
  DATA_KEY, COLLECTIONS, createInitialState, normalizeState, validateState,
  createEvent, createId, calculateFinance, createDashboardSummary,
  searchPersonalData, nextRecurrenceDate, createExportPayload, parseImportPayload
} from "./personal-core.js";

export const PERSONAL_STORAGE_KEY = "ruan.personal.data.v1";
export const LEGACY_KEYS = Object.freeze({
  tasks: "ruan.pessoal.tasks.v1",
  finance: "ruan.pessoal.finance.v1"
});

const safeArray = value => Array.isArray(value) ? value : [];
const text = (value, label = "Título") => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(label + " é obrigatório.");
  return value.trim();
};
const amount = value => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new TypeError("O valor precisa ser maior que zero.");
  return Math.round(n * 100) / 100;
};
const dateKey = value => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + "T12:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

/**
 * Single local data store for Ruan's personal modules.
 * Browser-local only: this is not cloud sync, authentication, or a bank connection.
 */
export function createPersonalStore({
  storage = globalThis.localStorage,
  now = () => new Date().toISOString(),
  idFactory = () => createId("ruan"),
  eventTarget = globalThis.window
} = {}) {
  if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function") {
    throw new TypeError("O Ruan precisa de um armazenamento compatível.");
  }

  function readJson(key, fallback) {
    try {
      const parsed = JSON.parse(storage.getItem(key) || "null");
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function migrateLegacy() {
    const state = createInitialState();
    const legacyTasks = safeArray(readJson(LEGACY_KEYS.tasks, []));
    const legacyFinance = safeArray(readJson(LEGACY_KEYS.finance, []));
    state.tasks = legacyTasks.map(item => ({ ...item, id: item.id || idFactory() }));
    for (const item of legacyFinance) {
      const record = { ...item, id: item.id || idFactory() };
      if (record.type === "bill") {
        state.bills.push({
          ...record,
          status: record.status === "paid" ? "paid" : record.status === "cancelled" ? "cancelled" : "open",
          dueDate: record.dueDate || ""
        });
      } else if (["income", "expense"].includes(record.type)) {
        state.transactions.push(record);
      }
    }
    state.updatedAt = now();
    return state;
  }

  function readState() {
    const raw = readJson(PERSONAL_STORAGE_KEY, null);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return migrateLegacy();
    return normalizeState(raw, now());
  }

  function legacyFinance(state) {
    return [
      ...state.transactions.map(item => ({ ...item, type: item.type })),
      ...state.bills.map(item => ({
        ...item,
        type: "bill",
        status: item.status === "paid" ? "paid" : item.status === "cancelled" ? "cancelled" : "pending"
      }))
    ];
  }

  function persist(state, event = null) {
    const normalized = normalizeState(state, now());
    const validation = validateState(normalized);
    if (!validation.valid) throw new TypeError(validation.errors.join(" "));
    storage.setItem(PERSONAL_STORAGE_KEY, JSON.stringify(normalized));
    // Keep the two old storage contracts synchronized while existing screens are migrated.
    storage.setItem(LEGACY_KEYS.tasks, JSON.stringify(normalized.tasks));
    storage.setItem(LEGACY_KEYS.finance, JSON.stringify(legacyFinance(normalized)));
    try {
      eventTarget?.dispatchEvent?.(new CustomEvent("ruan:data-changed", {
        detail: { key: PERSONAL_STORAGE_KEY, event }
      }));
    } catch {}
    return normalized;
  }

  function mutate(type, collection, entityId, detail, change) {
    const state = readState();
    const next = change(state);
    const recorded = createEvent(next, type, collection, entityId, detail, now());
    persist(recorded, { type, collection, entityId });
    return recorded;
  }

  function list(collection) {
    if (!COLLECTIONS.includes(collection)) throw new TypeError("Coleção pessoal desconhecida.");
    return readState()[collection];
  }

  function create(collection, input = {}) {
    if (!COLLECTIONS.includes(collection)) throw new TypeError("Coleção pessoal desconhecida.");
    const timestamp = now();
    const item = {
      ...input,
      id: input.id || idFactory(),
      createdAt: input.createdAt || timestamp,
      updatedAt: timestamp
    };
    if (["tasks", "reminders", "notes", "goals", "projects", "calendarItems", "habits", "documents", "quickCaptures", "bills", "transactions", "budgets"].includes(collection)) {
      item.title = text(input.title, "Título");
    }
    if (collection === "transactions") {
      if (!["income", "expense"].includes(item.type)) throw new TypeError("Tipo financeiro inválido.");
      item.amount = amount(item.amount);
      item.date = item.date || timestamp.slice(0, 10);
      if (!dateKey(item.date)) throw new TypeError("Data do lançamento inválida.");
    }
    if (collection === "bills") {
      item.amount = Number(item.amount);
      if (!Number.isFinite(item.amount) || item.amount < 0) throw new TypeError("Valor da conta inválido.");
      item.dueDate = item.dueDate || "";
      if (item.dueDate && !dateKey(item.dueDate)) throw new TypeError("Data de vencimento inválida.");
      item.status = ["open", "paid", "cancelled"].includes(item.status) ? item.status : "open";
    }
    if (collection === "budgets") {
      item.limit = Number(item.limit);
      if (!Number.isFinite(item.limit) || item.limit < 0) throw new TypeError("Limite de orçamento inválido.");
    }
    if (collection === "shoppingLists") {
      item.title = text(input.title || input.name, "Nome da lista");
      item.items = safeArray(input.items).map(entry => ({ ...entry, id: entry.id || idFactory(), done: Boolean(entry.done) }));
    }
    mutate("created", collection, item.id, { title: item.title || item.name || "" }, state => {
      state[collection].unshift(item);
      return state;
    });
    return item;
  }

  function update(collection, entityId, patch = {}) {
    if (!COLLECTIONS.includes(collection)) throw new TypeError("Coleção pessoal desconhecida.");
    let updated;
    mutate("updated", collection, entityId, {}, state => {
      const index = state[collection].findIndex(item => item.id === entityId);
      if (index < 0) throw new Error("Registro não encontrado.");
      updated = { ...state[collection][index], ...patch, id: entityId, updatedAt: now() };
      if (updated.title !== undefined) updated.title = text(updated.title);
      if (collection === "transactions") {
        if (!["income", "expense"].includes(updated.type)) throw new TypeError("Tipo financeiro inválido.");
        updated.amount = amount(updated.amount);
        if (!dateKey(updated.date)) throw new TypeError("Data do lançamento inválida.");
      }
      state[collection][index] = updated;
      return state;
    });
    return updated;
  }

  function remove(collection, entityId) {
    if (!COLLECTIONS.includes(collection)) throw new TypeError("Coleção pessoal desconhecida.");
    let removed = false;
    mutate("deleted", collection, entityId, {}, state => {
      const before = state[collection].length;
      state[collection] = state[collection].filter(item => item.id !== entityId);
      removed = state[collection].length !== before;
      if (!removed) throw new Error("Registro não encontrado.");
      return state;
    });
    return removed;
  }

  function completeTask(entityId, done = true) {
    const state = readState();
    const task = state.tasks.find(item => item.id === entityId);
    if (!task) throw new Error("Tarefa não encontrada.");
    const updated = { ...task, done: Boolean(done), updatedAt: now(), completedAt: done ? now() : null };
    const next = { ...state, tasks: state.tasks.map(item => item.id === entityId ? updated : item) };
    let followUp = null;
    if (done && task.recurrence) {
      const dueDate = nextRecurrenceDate(task, new Date(now()));
      if (dueDate && !state.tasks.some(item => item.title === task.title && item.dueDate === dueDate && item.recurrence === task.recurrence && !item.done)) {
        followUp = { ...task, id: idFactory(), dueDate, done: false, createdAt: now(), updatedAt: now(), completedAt: null };
        next.tasks.unshift(followUp);
      }
    }
    persist(createEvent(next, done ? "completed" : "reopened", "tasks", entityId, { followUpId: followUp?.id || null }, now()), { type: "task-status", entityId });
    return { task: updated, followUp };
  }

  function markBillPaid(entityId, paid = true) {
    const bill = readState().bills.find(item => item.id === entityId);
    if (!bill) throw new Error("Conta não encontrada.");
    return update("bills", entityId, { status: paid ? "paid" : "open", paidAt: paid ? now() : null });
  }

  function addShoppingItem(listId, input = {}) {
    const state = readState();
    const listItem = state.shoppingLists.find(item => item.id === listId);
    if (!listItem) throw new Error("Lista de compras não encontrada.");
    const entry = { ...input, id: input.id || idFactory(), title: text(input.title || input.name, "Item"), done: false, createdAt: now() };
    update("shoppingLists", listId, { items: [...safeArray(listItem.items), entry] });
    return entry;
  }

  function toggleShoppingItem(listId, itemId, done = true) {
    const listItem = readState().shoppingLists.find(item => item.id === listId);
    if (!listItem) throw new Error("Lista de compras não encontrada.");
    const items = safeArray(listItem.items).map(item => item.id === itemId ? { ...item, done: Boolean(done), updatedAt: now() } : item);
    if (!listItem.items.some(item => item.id === itemId)) throw new Error("Item de compra não encontrado.");
    return update("shoppingLists", listId, { items });
  }

  function logHabit(habitId, value = true, date = now().slice(0, 10)) {
    if (!dateKey(date)) throw new TypeError("Data do hábito inválida.");
    return create("routineLogs", { habitId, date, value, loggedAt: now() });
  }

  function captureQuick(input = {}) {
    return create("quickCaptures", {
      title: text(input.title || input.content, "Captura rápida"),
      content: typeof input.content === "string" ? input.content.trim() : "",
      target: ["task", "note", "project", "shopping", "reminder"].includes(input.target) ? input.target : "inbox",
      processed: false
    });
  }

  function getSnapshot(options = {}) {
    return readState();
  }

  function importBackup(payload) {
    const result = parseImportPayload(payload);
    if (!result.valid) throw new TypeError(result.errors.join(" "));
    persist(result.data, { type: "backup-import" });
    return result.data;
  }

  function exportBackup() {
    return createExportPayload(readState(), now());
  }

  return Object.freeze({
    getSnapshot, list, create, update, remove, completeTask, markBillPaid,
    addShoppingItem, toggleShoppingItem, logHabit, captureQuick,
    calculateFinance: options => calculateFinance(readState(), options),
    dashboardSummary: options => createDashboardSummary(readState(), options),
    search: (query, options) => searchPersonalData(readState(), query, options),
    exportBackup, importBackup, validate: state => validateState(state),
    storageKey: PERSONAL_STORAGE_KEY
  });
}
