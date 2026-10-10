import assert from "node:assert/strict";
import test from "node:test";
import {
  createOperatingPlan,
  generateRecurringObligations,
  nextBillingDate,
  summarizeObligations,
  validateOperatingPlan
} from "./operating-plans.mjs";

const plan = (overrides = {}) => createOperatingPlan({
  planId: "PLAN-STUDIO",
  name: "Plano Studio",
  state: "ACTIVE",
  billingCycle: "MONTHLY",
  amountMinor: 4990,
  currency: "BRL",
  startDate: "2026-01-31",
  nextDueDate: "2026-01-31",
  anchorDay: 31,
  graceDays: 5,
  entitlements: { activeChannels: 3, monthlyProductions: 20 },
  ...overrides
});

test("validates plan contracts and rejects invalid amounts", () => {
  assert.equal(validateOperatingPlan(plan()).valid, true);
  assert.throws(() => createOperatingPlan({ ...plan(), amountMinor: -1 }), /Plano operacional inválido/);
});

test("month-end recurrence keeps its original billing anchor", () => {
  assert.equal(nextBillingDate("2026-01-31", "MONTHLY", 31), "2026-02-28");
  assert.equal(nextBillingDate("2026-02-28", "MONTHLY", 31), "2026-03-31");
  assert.equal(nextBillingDate("2026-01-31", "QUARTERLY", 31), "2026-04-30");
});

test("creates recurring obligations through the requested date", () => {
  const result = generateRecurringObligations([plan()], "2026-03-31");
  assert.deepEqual(result.map(item => item.dueDate), ["2026-01-31", "2026-02-28", "2026-03-31"]);
  assert.equal(result[0].amountMinor, 4990);
  assert.equal(result[0].currency, "BRL");
  assert.equal(result[0].paymentAttempted, false);
});

test("scheduler is idempotent when existing obligations are supplied", () => {
  const first = generateRecurringObligations([plan()], "2026-02-28");
  const second = generateRecurringObligations([plan()], "2026-02-28", first);
  assert.deepEqual(second, []);
});

test("paused and draft plans do not create obligations", () => {
  const result = generateRecurringObligations([
    plan({ planId: "PAUSED", state: "PAUSED" }),
    plan({ planId: "DRAFT", state: "DRAFT" })
  ], "2026-12-31");
  assert.deepEqual(result, []);
});

test("income and expense obligations are summarized separately", () => {
  const obligations = [
    { state: "DUE", kind: "INCOME", amountMinor: 10000 },
    { state: "OVERDUE", kind: "EXPENSE", amountMinor: 2500 },
    { state: "VOID", kind: "INCOME", amountMinor: 999 }
  ];
  assert.deepEqual(summarizeObligations(obligations), {
    count: 3, DUE: 1, OVERDUE: 1, PAID: 0, VOID: 1, SCHEDULED: 0,
    incomeMinor: 10000, expensesMinor: 2500
  });
});

console.log("WordDark Operating Plans tests: OK");
