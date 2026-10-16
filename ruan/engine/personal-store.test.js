import assert from "node:assert/strict";
import { createPersonalStore, PERSONAL_STORAGE_KEY, LEGACY_KEYS } from "./personal-store.js";
import { createRuanEngine } from "./central-engine.js";

function memoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
    dump(key) { return data.has(key) ? JSON.parse(data.get(key)) : null; }
  };
}

let clock = "2026-10-14T12:00:00.000Z";
let id = 0;
const now = () => clock;
const idFactory = () => "test-" + (++id);
const legacyStorage = memoryStorage({
  [LEGACY_KEYS.tasks]: JSON.stringify([{ id: "old-task", title: "Tarefa antiga", dueDate: "2026-10-15", done: false }]),
  [LEGACY_KEYS.finance]: JSON.stringify([
    { id: "old-income", title: "Salário", type: "income", amount: 2000, date: "2026-10-02" },
    { id: "old-expense", title: "Mercado", type: "expense", amount: 150, date: "2026-10-03" },
    { id: "old-bill", title: "Luz", type: "bill", amount: 90, date: "2026-10-01", dueDate: "2026-10-10", status: "pending" }
  ])
});
const store = createPersonalStore({ storage: legacyStorage, now, idFactory, eventTarget: null });
let state = store.getSnapshot();
assert.equal(state.tasks.length, 1);
assert.equal(state.transactions.length, 2);
assert.equal(state.bills[0].status, "open");
assert.equal(store.dashboardSummary({ now: clock }).overdueBills, 1);

const task = store.create("tasks", { title: "Lavar roupa", dueDate: "2026-10-14", recurrence: "weekly", done: false });
const completion = store.completeTask(task.id, true);
assert.equal(completion.task.done, true);
assert.equal(completion.followUp.dueDate, "2026-10-21");
assert.equal(store.list("tasks").length, 3);

const shopping = store.create("shoppingLists", { title: "Mercado da semana" });
const item = store.addShoppingItem(shopping.id, { title: "Arroz" });
store.toggleShoppingItem(shopping.id, item.id, true);
assert.equal(store.list("shoppingLists")[0].items[0].done, true);

store.create("transactions", { title: "Freelance", type: "income", amount: 300, date: "2026-10-14" });
store.create("bills", { title: "Internet", amount: 100, dueDate: "2026-10-20", date: "2026-10-14" });
assert.throws(() => store.create("bills", { title: "Conta sem valor", amount: 0, dueDate: "2026-10-20" }), /maior que zero/i);
const internetBill = store.list("bills").find(item => item.title === "Internet");
assert.throws(() => store.update("bills", internetBill.id, { amount: 0 }), /maior que zero/i);
assert.equal(store.calculateFinance({ now: clock }).monthIncome, 2300);
assert.equal(store.calculateFinance({ now: clock }).monthExpenses, 150);
assert.equal(store.calculateFinance({ now: clock }).billsDueThisMonth.length, 2);
assert.ok(legacyStorage.dump(PERSONAL_STORAGE_KEY));
assert.equal(legacyStorage.dump(LEGACY_KEYS.tasks).length, 3);
assert.equal(legacyStorage.dump(LEGACY_KEYS.finance).length, 5);

store.create("goals", { title: "Guardar dinheiro", status: "active" });
store.captureQuick({ title: "Ideia", content: "Revisar orçamento", target: "note" });
assert.equal(store.search("orçamento").length, 1);
const backup = store.exportBackup();
const otherStorage = memoryStorage();
const other = createPersonalStore({ storage: otherStorage, now, idFactory, eventTarget: null });
const imported = other.importBackup(backup);
assert.equal(imported.tasks.length, 3);
assert.equal(imported.shoppingLists.length, 1);
assert.equal(imported.goals.length, 1);
assert.throws(() => other.importBackup({ app: "Outro" }), /exportação válida/i);

const appStorage = memoryStorage({
  [LEGACY_KEYS.tasks]: JSON.stringify([{ id: "compat-task", title: "Compatibilidade", dueDate: "", done: false }]),
  [LEGACY_KEYS.finance]: JSON.stringify([{ id: "compat-income", title: "Entrada", type: "income", amount: 50, date: "2026-10-14" }])
});
const app = createRuanEngine({ storage: appStorage, now, idFactory, eventTarget: null });
assert.equal(app.getSnapshot().openTasks.length, 1);
assert.equal(app.getSnapshot().balance, 50);
app.addTask({ title: "Nova tarefa", dueDate: "2026-10-15" });
app.addFinanceEntry({ title: "Conta de água", type: "bill", amount: 40, date: "2026-10-14", dueDate: "2026-10-18" });
assert.equal(app.getSnapshot().openTasks.length, 2);
assert.equal(app.getSnapshot().pendingBills.length, 1);
assert.equal(appStorage.dump(LEGACY_KEYS.tasks).length, 2);
const bill = app.getSnapshot().finance.find(entry => entry.type === "bill");
app.markBillPaid(bill.id);
assert.equal(app.getSnapshot().pendingBills.length, 0);

console.log("Ruan personal store tests passed.");
