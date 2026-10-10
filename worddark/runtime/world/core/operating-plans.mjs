/**
 * WordDark — Operating Plans & Recurring Finance v0.1
 *
 * Defines plan entitlements and creates predictable recurring obligations.
 * It does NOT charge payment methods, contact banks, or store credentials.
 * All dates are ISO calendar dates (YYYY-MM-DD) interpreted in UTC.
 */
export const PLAN_STATES = Object.freeze(["DRAFT", "ACTIVE", "PAUSED", "RETIRED"]);
export const BILLING_CYCLES = Object.freeze(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]);
export const OBLIGATION_STATES = Object.freeze(["SCHEDULED", "DUE", "OVERDUE", "PAID", "VOID"]);

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDate = value => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError("A data deve usar o formato YYYY-MM-DD.");
  }
  const date = new Date(value + "T00:00:00.000Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new TypeError("Data de calendário inválida.");
  }
  return date;
};
const formatDate = date => date.toISOString().slice(0, 10);
const daysInMonth = (year, monthIndex) => new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

export function validateOperatingPlan(plan = {}) {
  const errors = [];
  if (!plan.planId || typeof plan.planId !== "string") errors.push("planId é obrigatório.");
  if (!plan.name || typeof plan.name !== "string") errors.push("name é obrigatório.");
  if (!PLAN_STATES.includes(plan.state || "DRAFT")) errors.push("Estado de plano inválido.");
  if (!BILLING_CYCLES.includes(plan.billingCycle)) errors.push("Ciclo de cobrança inválido.");
  if (!Number.isSafeInteger(plan.amountMinor) || plan.amountMinor < 0) {
    errors.push("amountMinor deve ser um inteiro não negativo em unidade monetária mínima.");
  }
  if (!/^[A-Z]{3}$/.test(plan.currency || "")) errors.push("currency deve ser um código ISO de três letras.");
  if (!plan.startDate) errors.push("startDate é obrigatório.");
  if (plan.startDate) {
    try { isoDate(plan.startDate); } catch (error) { errors.push(error.message); }
  }
  if (plan.nextDueDate) {
    try { isoDate(plan.nextDueDate); } catch (error) { errors.push(error.message); }
  }
  if (plan.graceDays !== undefined && (!Number.isInteger(plan.graceDays) || plan.graceDays < 0 || plan.graceDays > 90)) {
    errors.push("graceDays deve ser um inteiro entre 0 e 90.");
  }
  if (plan.kind && !["INCOME", "EXPENSE"].includes(plan.kind)) errors.push("kind deve ser INCOME ou EXPENSE.");
  return { valid: errors.length === 0, errors };
}

export function createOperatingPlan(input = {}) {
  const plan = {
    state: "DRAFT",
    kind: "INCOME",
    currency: "BRL",
    graceDays: 5,
    autoRenew: false,
    entitlements: {},
    ...input
  };
  const validation = validateOperatingPlan(plan);
  if (!validation.valid) {
    const error = new TypeError("Plano operacional inválido: " + validation.errors.join(" "));
    error.errors = validation.errors;
    throw error;
  }
  return Object.freeze({ ...plan, entitlements: Object.freeze({ ...plan.entitlements }) });
}

/**
 * Advances a calendar date without month-end drift.
 * Example: a plan anchored on day 31 bills on Feb 28/29, then Mar 31.
 */
export function nextBillingDate(dateValue, cycle, anchorDay) {
  const date = isoDate(dateValue);
  const day = anchorDay || date.getUTCDate();
  if (!Number.isInteger(day) || day < 1 || day > 31) throw new TypeError("anchorDay deve ficar entre 1 e 31.");
  let next;
  if (cycle === "WEEKLY") next = new Date(date.getTime() + 7 * DAY_MS);
  else if (cycle === "MONTHLY" || cycle === "QUARTERLY") {
    const increment = cycle === "MONTHLY" ? 1 : 3;
    const firstOfTarget = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + increment, 1));
    next = new Date(Date.UTC(
      firstOfTarget.getUTCFullYear(),
      firstOfTarget.getUTCMonth(),
      Math.min(day, daysInMonth(firstOfTarget.getUTCFullYear(), firstOfTarget.getUTCMonth()))
    ));
  } else if (cycle === "YEARLY") {
    const year = date.getUTCFullYear() + 1;
    const month = date.getUTCMonth();
    next = new Date(Date.UTC(year, month, Math.min(day, daysInMonth(year, month))));
  } else {
    throw new TypeError("Ciclo de cobrança desconhecido.");
  }
  return formatDate(next);
}

/**
 * Generates due obligations through an inclusive date.
 * Existing obligation IDs are honored, so running the scheduler twice is safe.
 * This function records intent only; it never attempts a real payment.
 */
export function generateRecurringObligations(plans = [], throughDate, existing = []) {
  const cutoff = isoDate(throughDate);
  const existingIds = new Set(existing.map(item => item.obligationId));
  const generated = [];

  for (const plan of plans) {
    const validation = validateOperatingPlan(plan);
    if (!validation.valid) throw new TypeError("Plano " + (plan.planId || "(sem ID)") + " inválido: " + validation.errors.join(" "));
    if (plan.state !== "ACTIVE") continue;

    const anchorDay = plan.anchorDay || isoDate(plan.startDate).getUTCDate();
    let due = plan.nextDueDate || plan.startDate;
    let guard = 0;
    while (isoDate(due) <= cutoff) {
      if (++guard > 1200) throw new RangeError("Limite de recorrências excedido para " + plan.planId + ".");
      const periodStart = due;
      const obligationId = plan.planId + ":" + periodStart;
      if (!existingIds.has(obligationId)) {
        const overdueAt = new Date(isoDate(due).getTime() + (plan.graceDays || 0) * DAY_MS);
        generated.push({
          obligationId,
          planId: plan.planId,
          kind: plan.kind || "INCOME",
          description: plan.name,
          amountMinor: plan.amountMinor,
          currency: plan.currency,
          periodStart,
          dueDate: due,
          state: overdueAt < cutoff ? "OVERDUE" : "DUE",
          autoRenew: Boolean(plan.autoRenew),
          paymentAttempted: false
        });
        existingIds.add(obligationId);
      }
      due = nextBillingDate(due, plan.billingCycle, anchorDay);
    }
  }
  return generated;
}

export function summarizeObligations(obligations = []) {
  return obligations.reduce((summary, item) => {
    summary.count += 1;
    summary[item.state] = (summary[item.state] || 0) + 1;
    const key = item.kind === "EXPENSE" ? "expensesMinor" : "incomeMinor";
    if (item.state !== "VOID") summary[key] += item.amountMinor;
    return summary;
  }, { count: 0, DUE: 0, OVERDUE: 0, PAID: 0, VOID: 0, SCHEDULED: 0, incomeMinor: 0, expensesMinor: 0 });
}
