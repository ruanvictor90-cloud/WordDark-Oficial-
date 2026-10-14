import assert from "node:assert/strict";
import {
  SCHEMA_VERSION, createInitialState, normalizeState, validateState,
  createEvent, calculateFinance, nextRecurrenceDate, createExportPayload,
  parseImportPayload
} from "./ruan-core.js";

const initial = createInitialState();
assert.equal(initial.schemaVersion, SCHEMA_VERSION);
assert.deepEqual(initial.tasks, []);
assert.deepEqual(initial.budgets, []);

const migrated = normalizeState({ tasks: [{ id: "t1" }], transactions: null }, "2026-10-14T12:00:00.000Z");
assert.equal(migrated.schemaVersion, SCHEMA_VERSION);
assert.equal(migrated.tasks.length, 1);
assert.deepEqual(migrated.transactions, []);
assert.equal(validateState(migrated).valid, true);
assert.equal(validateState({ transactions: [{ type: "expense", amount: -5, title: "x" }] }).valid, false);

const logged = createEvent(initial, "created", "task", "t1", { title: "Arrumar cama" }, "2026-10-14T12:00:00.000Z");
assert.equal(logged.events[0].entityId, "t1");
assert.equal(logged.events[0].detail.title, "Arrumar cama");

const financeState = {
  transactions: [
    { id: "1", title: "Pagamento", type: "income", amount: 2000, date: "2026-10-02" },
    { id: "2", title: "Mercado", type: "expense", amount: 300, date: "2026-10-03", category: "Mercado" },
    { id: "3", title: "Conta antiga", type: "expense", amount: 100, date: "2026-09-03", category: "Casa" }
  ],
  assets: [
    { type: "reserve", amount: 500 },
    { type: "investment", amount: 120 }
  ],
  budgets: [{ id: "b1", category: "Mercado", limit: 250 }]
};
const summary = calculateFinance(financeState, { now: "2026-10-14T12:00:00.000Z" });
assert.equal(summary.balance, 1600);
assert.equal(summary.monthIncome, 2000);
assert.equal(summary.monthExpenses, 300);
assert.equal(summary.reserves, 500);
assert.equal(summary.investmentsRecorded, 120);
assert.equal(summary.budgets[0].remaining, -50);
assert.equal(summary.budgets[0].percent, 120);

assert.equal(nextRecurrenceDate({ dueDate: "2026-10-14", recurrence: "daily" }, new Date("2026-10-14T12:00:00")), "2026-10-15");
assert.equal(nextRecurrenceDate({ dueDate: "2026-10-14", recurrence: "weekly" }, new Date("2026-10-15T12:00:00")), "2026-10-21");
assert.equal(nextRecurrenceDate({ dueDate: "2026-01-31", recurrence: "monthly" }, new Date("2026-02-01T12:00:00")), "2026-02-28");
assert.equal(nextRecurrenceDate({ dueDate: "2026-10-14", recurrence: "yearly" }, new Date("2026-10-15T12:00:00")), null);

const payload = createExportPayload(migrated, "2026-10-14T12:00:00.000Z");
const parsed = parseImportPayload(payload);
assert.equal(parsed.valid, true);
assert.equal(parsed.data.tasks.length, 1);
assert.equal(parseImportPayload({ app: "Other" }).valid, false);

console.log("Ruan personal core tests passed.");
