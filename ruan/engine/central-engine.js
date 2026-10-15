import { createPersonalStore, LEGACY_KEYS } from "./personal-store.js";
import { calculateFinance } from "./personal-core.js";

export const RUAN_STORAGE_KEYS = LEGACY_KEYS;

const safeArray = value => Array.isArray(value) ? value : [];
const cleanText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(field + " é obrigatório.");
  return value.trim();
};
const dateKey = value => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export function createRuanEngine({
  storage = globalThis.localStorage,
  now = () => new Date().toISOString(),
  idFactory = () => globalThis.crypto?.randomUUID?.() ?? ("r-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10)),
  eventTarget = globalThis.window
} = {}) {
  const personal = createPersonalStore({ storage, now, idFactory, eventTarget });

  function addTask(input) {
    const title = cleanText(input?.title, "Título da tarefa");
    const dueDate = input?.dueDate || "";
    if (dueDate && !dateKey(dueDate)) throw new TypeError("Data da tarefa inválida.");
    return personal.create("tasks", {
      title, details: typeof input?.details === "string" ? input.details.trim() : "",
      dueDate, recurrence: ["daily", "weekly", "monthly"].includes(input?.recurrence) ? input.recurrence : null,
      recurrenceEnd: input?.recurrenceEnd || "", done: false
    });
  }

  function updateTask(id, patch = {}) {
    const safePatch = { ...patch };
    if (safePatch.title !== undefined) safePatch.title = cleanText(safePatch.title, "Título da tarefa");
    if (safePatch.dueDate !== undefined && safePatch.dueDate && !dateKey(safePatch.dueDate)) throw new TypeError("Data da tarefa inválida.");
    return personal.update("tasks", id, safePatch);
  }

  function deleteTask(id) {
    try { return personal.remove("tasks", id); } catch { return false; }
  }

  function addFinanceEntry(input) {
    const type = input?.type;
    if (!["income", "expense", "bill"].includes(type)) throw new TypeError("Tipo financeiro inválido.");
    const title = cleanText(input?.title, "Descrição");
    const date = input?.date || now().slice(0, 10);
    if (!dateKey(date)) throw new TypeError("Data do lançamento inválida.");
    const value = Number(input?.amount);
    if (!Number.isFinite(value) || value <= 0) throw new TypeError("O valor precisa ser maior que zero.");
    const common = { title, amount: Math.round(value * 100) / 100, date, notes: typeof input?.notes === "string" ? input.notes.trim() : "" };
    if (type === "bill") {
      const dueDate = input?.dueDate || "";
      if (!dateKey(dueDate)) throw new TypeError("Conta a pagar precisa de uma data de vencimento válida.");
      return personal.create("bills", { ...common, dueDate, status: "open" });
    }
    return personal.create("transactions", { ...common, type });
  }

  function markBillPaid(id, paid = true) {
    return personal.markBillPaid(id, paid);
  }

  function deleteFinanceEntry(id) {
    const state = personal.getSnapshot();
    const collection = state.transactions.some(item => item.id === id) ? "transactions"
      : state.bills.some(item => item.id === id) ? "bills" : null;
    if (!collection) return false;
    return personal.remove(collection, id);
  }

  function getSnapshot() {
    const state = personal.getSnapshot();
    const today = now().slice(0, 10);
    const finance = [
      ...safeArray(state.transactions),
      ...safeArray(state.bills).map(bill => ({
        ...bill, type: "bill", status: bill.status === "paid" ? "paid" : bill.status === "cancelled" ? "cancelled" : "pending"
      }))
    ].sort((a, b) => String(b.createdAt || b.date || "").localeCompare(String(a.createdAt || a.date || "")));
    const summary = calculateFinance(state, { now: now() });
    const tasks = safeArray(state.tasks);
    return {
      tasks, finance,
      openTasks: tasks.filter(task => !task.done),
      overdueTasks: tasks.filter(task => !task.done && task.dueDate && task.dueDate < today),
      balance: Math.round(summary.balance * 100) / 100,
      pendingBills: finance.filter(item => item.type === "bill" && item.status !== "paid" && item.status !== "cancelled"),
      income: Math.round(summary.totalIncome * 100) / 100,
      expenses: Math.round(summary.totalExpenses * 100) / 100,
      personal: state,
      dashboard: personal.dashboardSummary({ now: now() })
    };
  }

  return Object.freeze({
    addTask, updateTask, deleteTask, addFinanceEntry, markBillPaid, deleteFinanceEntry,
    getSnapshot,
    personal,
    addShoppingList: input => personal.create("shoppingLists", input),
    addReminder: input => personal.create("reminders", input),
    addGoal: input => personal.create("goals", input),
    addProject: input => personal.create("projects", input),
    addNote: input => personal.create("notes", input),
    addCalendarItem: input => personal.create("calendarItems", input),
    addHabit: input => personal.create("habits", input),
    addBudget: input => personal.create("budgets", input),
    addAsset: input => personal.create("assets", input),
    exportPersonalBackup: () => personal.exportBackup(),
    importPersonalBackup: payload => personal.importBackup(payload)
  });
}
