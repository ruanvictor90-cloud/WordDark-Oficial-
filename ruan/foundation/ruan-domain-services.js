/**
 * Ruan domain services — validated, side-effect-free state transitions.
 * Persistence and UI remain responsible for saving/rendering returned state.
 */
import { SCHEMA_VERSION, COLLECTIONS, normalizeState, createId, createEvent, nextRecurrenceDate, validateState } from "./ruan-core.js";

const TARGETS = Object.freeze({
  task: { collection: "tasks", title: "Tarefas" },
  note: { collection: "notes", title: "Notas e ideias" },
  project: { collection: "projects", title: "Projetos" },
  reminder: { collection: "reminders", title: "Lembretes" },
  shopping: { collection: "shoppingLists", title: "Compras" }
});

const validDate = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(new Date(value + "T12:00:00").getTime()) &&
  new Date(value + "T12:00:00").toISOString().slice(0, 10) === value;
const nonEmpty = value => typeof value === "string" && value.trim().length > 0;

function resultError(code, message) { return { ok: false, code, message }; }
function commit(state, now, entity, entityId, detail = {}) {
  const next = createEvent(state, "updated", entity, entityId, detail, now);
  const valid = validateState(next);
  return valid.valid ? { ok: true, state: next } : resultError("invalid_state", valid.errors.join(" "));
}

/** Create a future bill with explicit amount/date/status validation. */
export function createBill(state, input = {}, options = {}) {
  const now = options.now || new Date().toISOString();
  if (!nonEmpty(input.title)) return resultError("title_required", "Informe o nome da conta.");
  if (!Number.isFinite(input.amount) || input.amount < 0) return resultError("invalid_amount", "O valor da conta precisa ser zero ou maior.");
  if (input.dueDate && !validDate(input.dueDate)) return resultError("invalid_due_date", "Use uma data válida no formato AAAA-MM-DD.");
  const id = (options.idFactory || createId)("bill");
  const next = normalizeState(state, now);
  const record = { id, title: input.title.trim(), amount: input.amount, dueDate: input.dueDate || null,
    category: nonEmpty(input.category) ? input.category.trim() : "Sem categoria",
    status: "open", notes: nonEmpty(input.notes) ? input.notes.trim() : "", createdAt: now, updatedAt: now };
  next.bills.unshift(record);
  const committed = commit(next, now, "bill", id, { action: "created" });
  return committed.ok ? { ...committed, record } : committed;
}

/** Mark a bill as paid; repeated completion is idempotent. */
export function markBillPaid(state, billId, options = {}) {
  const now = options.now || new Date().toISOString();
  const next = normalizeState(state, now);
  const bill = next.bills.find(item => item.id === billId);
  if (!bill) return resultError("bill_not_found", "Conta não encontrada.");
  if (bill.status === "cancelled") return resultError("bill_cancelled", "Uma conta cancelada não pode ser marcada como paga.");
  if (bill.status === "paid") return { ok: true, state: next, record: bill, unchanged: true };
  bill.status = "paid";
  bill.paidAt = now;
  bill.updatedAt = now;
  const committed = commit(next, now, "bill", billId, { action: "paid" });
  return committed.ok ? { ...committed, record: bill } : committed;
}

/** Update goal progress without allowing values outside the 0–100 range. */
export function setGoalProgress(state, goalId, progress, options = {}) {
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) return resultError("invalid_progress", "O progresso precisa ficar entre 0 e 100.");
  const now = options.now || new Date().toISOString();
  const next = normalizeState(state, now);
  const goal = next.goals.find(item => item.id === goalId);
  if (!goal) return resultError("goal_not_found", "Objetivo não encontrado.");
  goal.progress = progress;
  if (progress === 100) goal.status = "done";
  else if (goal.status === "done") goal.status = "active";
  goal.updatedAt = now;
  const committed = commit(next, now, "goal", goalId, { action: "progress", progress });
  return committed.ok ? { ...committed, record: goal } : committed;
}

/** Save a quick capture without making assumptions about its destination. */
export function createQuickCapture(state, input = {}, options = {}) {
  if (!nonEmpty(input.text)) return resultError("capture_required", "Escreva algo antes de salvar.");
  const now = options.now || new Date().toISOString();
  const id = (options.idFactory || createId)("capture");
  const next = normalizeState(state, now);
  const record = { id, text: input.text.trim(), source: nonEmpty(input.source) ? input.source.trim() : "manual",
    status: "inbox", target: null, createdAt: now, updatedAt: now };
  next.quickCaptures.unshift(record);
  const committed = commit(next, now, "quickCapture", id, { action: "captured" });
  return committed.ok ? { ...committed, record } : committed;
}

/**
 * Route an inbox capture to a declared personal domain. This does not execute
 * external actions; it creates a local record and marks the capture as routed.
 */
export function routeQuickCapture(state, captureId, target, options = {}) {
  const destination = TARGETS[target];
  if (!destination) return resultError("invalid_target", "Destino não permitido para captura rápida.");
  const now = options.now || new Date().toISOString();
  const next = normalizeState(state, now);
  const capture = next.quickCaptures.find(item => item.id === captureId);
  if (!capture) return resultError("capture_not_found", "Captura não encontrada.");
  if (capture.status === "routed") return resultError("already_routed", "Esta captura já foi encaminhada.");
  const id = (options.idFactory || createId)(target);
  const title = capture.text.trim();
  const base = { id, title, createdAt: now, updatedAt: now };
  let record;
  if (target === "task") record = { ...base, category: "Pessoal", priority: "normal", dueDate: null, date: null, done: false, recurrence: null };
  else if (target === "note") record = { ...base, content: capture.text, tags: [] };
  else if (target === "project") record = { ...base, status: "active", progress: 0, milestones: [] };
  else if (target === "reminder") record = { ...base, when: null, done: false };
  else record = { ...base, items: [] };
  next[destination.collection].unshift(record);
  capture.status = "routed";
  capture.target = target;
  capture.targetId = id;
  capture.updatedAt = now;
  const committed = commit(next, now, destination.collection, id, { action: "capture_routed", captureId, target });
  return committed.ok ? { ...committed, record, capture } : committed;
}

/** Complete a recurring task by creating its next occurrence at most once. */
export function completeTask(state, taskId, options = {}) {
  const now = options.now || new Date().toISOString();
  const next = normalizeState(state, now);
  const task = next.tasks.find(item => item.id === taskId);
  if (!task) return resultError("task_not_found", "Tarefa não encontrada.");
  if (task.done) return { ok: true, state: next, record: task, unchanged: true };
  task.done = true;
  task.completedAt = now;
  task.updatedAt = now;
  let nextTask = null;
  if (task.recurrence && task.dueDate) {
    const nextDate = nextRecurrenceDate(task, new Date((task.dueDate || now.slice(0, 10)) + "T23:59:59"));
    if (nextDate && !next.tasks.some(item => item.title === task.title && item.dueDate === nextDate && item.recurrence === task.recurrence)) {
      nextTask = { id: (options.idFactory || createId)("task"), title: task.title, category: task.category || "Pessoal",
        priority: task.priority || "normal", recurrence: task.recurrence, recurrenceEnd: task.recurrenceEnd || null,
        dueDate: nextDate, date: nextDate, done: false, createdAt: now, updatedAt: now };
      next.tasks.unshift(nextTask);
    }
  }
  const committed = commit(next, now, "task", taskId, { action: "completed", nextTaskId: nextTask?.id || null });
  return committed.ok ? { ...committed, record: task, nextTask } : committed;
}

/** A narrow helper for callers that need a supported collection check. */
export function isPersonalCollection(value) { return COLLECTIONS.includes(value) && value !== "events"; }
export function getDomainServiceVersion() { return SCHEMA_VERSION; }
