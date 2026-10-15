import assert from "node:assert/strict";
import {
  SCHEMA_VERSION, createInitialState, normalizeState, validateState,
  createEvent, calculateFinance, nextRecurrenceDate, createExportPayload,
  parseImportPayload, searchPersonalData, createDashboardSummary
} from "./personal-core.js";

const initial = createInitialState();
assert.equal(initial.schemaVersion, SCHEMA_VERSION);
assert.deepEqual(initial.tasks, []);
assert.deepEqual(initial.budgets, []);
assert.deepEqual(initial.projects, []);
assert.deepEqual(initial.bills, []);
assert.deepEqual(initial.preferences, { weekStartsOn: 1, currency: "BRL" });
assert.equal(validateState(initial).valid, true);

const migrated = normalizeState({ schemaVersion: 2, tasks: [{ id: "t1" }], transactions: null }, "2026-10-14T12:00:00.000Z");
assert.equal(migrated.schemaVersion, SCHEMA_VERSION);
assert.equal(migrated.tasks.length, 1);
assert.deepEqual(migrated.transactions, []);
assert.deepEqual(migrated.projects, []);
assert.equal(validateState(migrated).valid, true);
assert.equal(validateState({ transactions: [{ type: "expense", amount: -5, title: "x" }] }).valid, false);
assert.equal(validateState({ bills: [{ title: "Conta", amount: -1, dueDate: "2026-10-01" }] }).valid, false);
assert.equal(validateState({ bills: [{ title: "Conta", amount: 10, dueDate: "2026-02-30" }] }).valid, false);
assert.equal(validateState({ schemaVersion: SCHEMA_VERSION + 1 }).valid, false);

const logged = createEvent(initial, "created", "task", "t1", { title: "Arrumar cama" }, "2026-10-14T12:00:00.000Z");
assert.equal(logged.events[0].entityId, "t1");
assert.equal(logged.events[0].detail.title, "Arrumar cama");

const financeState = {
  transactions: [
    { id: "1", title: "Pagamento", type: "income", amount: 2000, date: "2026-10-02" },
    { id: "2", title: "Mercado", type: "expense", amount: 300, date: "2026-10-03", category: "Mercado" },
    { id: "3", title: "Conta antiga", type: "expense", amount: 100, date: "2026-09-03", category: "Casa" }
  ],
  assets: [{ type: "reserve", amount: 500 }, { type: "investment", amount: 120 }],
  budgets: [{ id: "b1", category: "Mercado", limit: 250 }],
  bills: [
    { id: "bill1", title: "Luz atrasada", amount: 80, dueDate: "2026-10-01", status: "open" },
    { id: "bill2", title: "Internet", amount: 100, dueDate: "2026-10-20", status: "open" },
    { id: "bill3", title: "Quitada", amount: 50, dueDate: "2026-10-10", status: "paid" }
  ]
};
const summary = calculateFinance(financeState, { now: "2026-10-14T12:00:00.000Z" });
assert.equal(summary.balance, 1600);
assert.equal(summary.monthIncome, 2000);
assert.equal(summary.monthExpenses, 300);
assert.equal(summary.reserves, 500);
assert.equal(summary.investmentsRecorded, 120);
assert.equal(summary.budgets[0].remaining, -50);
assert.equal(summary.budgets[0].percent, 120);
assert.deepEqual(summary.overdueBills.map(b => b.id), ["bill1"]);
assert.deepEqual(summary.billsDueThisMonth.map(b => b.id), ["bill1", "bill2"]);

assert.equal(nextRecurrenceDate({ dueDate: "2026-10-14", recurrence: "daily" }, new Date("2026-10-14T12:00:00")), "2026-10-15");
assert.equal(nextRecurrenceDate({ dueDate: "2026-10-14", recurrence: "weekly" }, new Date("2026-10-15T12:00:00")), "2026-10-21");
assert.equal(nextRecurrenceDate({ dueDate: "2026-01-31", recurrence: "monthly" }, new Date("2026-02-01T12:00:00")), "2026-02-28");
assert.equal(nextRecurrenceDate({ dueDate: "2026-10-14", recurrence: "yearly" }, new Date("2026-10-15T12:00:00")), null);

const searchState = {
  tasks: [{ id: "t1", title: "Limpar cozinha", dueDate: "2026-10-14" }],
  notes: [{ id: "n1", title: "Ideia para projeto", content: "app pessoal" }],
  projects: [{ id: "p1", title: "Projeto Ruan", status: "active" }]
};
assert.equal(searchPersonalData(searchState, "cozinha")[0].id, "t1");
assert.equal(searchPersonalData(searchState, "ruan", { collections: ["projects"] })[0].kind, "projects");
assert.deepEqual(searchPersonalData(searchState, "   "), []);

const dashboard = createDashboardSummary({
  tasks: [{ id: "a", title: "Hoje", date: "2026-10-14", done: false }, { id: "b", title: "Atrasada", date: "2026-10-13", done: false }],
  reminders: [{ id: "r", title: "Ligar", done: false }],
  shoppingLists: [{ items: [{ done: false }, { done: true }] }],
  projects: [{ status: "active" }],
  goals: [{ status: "active" }],
  bills: [{ title: "Vencida", amount: 20, dueDate: "2026-10-01", status: "open" }]
}, { now: "2026-10-14T12:00:00.000Z" });
assert.equal(dashboard.openTasks, 2);
assert.equal(dashboard.overdueTasks, 1);
assert.equal(dashboard.activeReminders, 1);
assert.equal(dashboard.uncheckedShoppingItems, 1);
assert.equal(dashboard.activeProjects, 1);
assert.equal(dashboard.activeGoals, 1);
assert.equal(dashboard.overdueBills, 1);

const payload = createExportPayload(migrated, "2026-10-14T12:00:00.000Z");
const parsed = parseImportPayload(payload);
assert.equal(parsed.valid, true);
assert.equal(parsed.data.tasks.length, 1);
assert.equal(parseImportPayload({ app: "Other" }).valid, false);
assert.equal(parseImportPayload({ app: "Ruan", kind: "personal-data-export", schemaVersion: SCHEMA_VERSION + 1, data: { schemaVersion: SCHEMA_VERSION + 1 } }).valid, false);
assert.equal(parseImportPayload({ app: "Ruan", kind: "personal-data-export", schemaVersion: SCHEMA_VERSION + 1, data: { schemaVersion: SCHEMA_VERSION } }).valid, false);

console.log("Ruan personal core tests passed.");
