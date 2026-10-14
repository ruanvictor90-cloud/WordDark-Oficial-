/**
 * Dark Factory — operator-assisted execution queue.
 *
 * This is the first operational executor for the initial commercial service set.
 * It tracks real human-produced deliverables; it never fabricates completion,
 * sends work to an external AI, publishes content, charges a client, or moves money.
 */
const SERVICE_TYPES = new Set([
  "content.copywriting",
  "content.short-script",
  "content.profile-review",
  "content.digital-package"
]);
const TRANSITIONS = Object.freeze({
  QUEUED: new Set(["IN_PROGRESS", "CANCELLED"]),
  IN_PROGRESS: new Set(["SUBMITTED", "CANCELLED"]),
  SUBMITTED: new Set(["IN_PROGRESS", "READY_TO_DELIVER", "CANCELLED"]),
  READY_TO_DELIVER: new Set(["DELIVERED", "IN_PROGRESS", "CANCELLED"]),
  DELIVERED: new Set(),
  CANCELLED: new Set()
});
const clean = (value) => typeof value === "string" ? value.trim() : "";
const clone = (value) => structuredClone(value);
const deny = (code) => ({ success: false, code });

export function createManualExecutionQueue({
  now = () => new Date().toISOString(),
  idFactory = () => globalThis.crypto?.randomUUID?.() || ("task-" + Math.random().toString(36).slice(2, 12)),
  operatorId = "operator",
  audit = () => {}
} = {}) {
  const tasks = new Map();
  const taskByOrder = new Map();
  const events = [];
  const actor = clean(operatorId);
  if (!actor) throw new TypeError("OPERATOR_ID_REQUIRED");
  if (typeof audit !== "function") throw new TypeError("AUDIT_CALLBACK_REQUIRED");

  function record(event, task, actorId, details = {}) {
    const entry = { event, at: now(), actorId: clean(actorId), taskId: task.taskId, orderId: task.orderId, details: clone(details) };
    events.push(entry);
    audit(clone(entry));
  }
  function getTask(taskId) {
    const task = tasks.get(clean(taskId));
    return task ? clone(task) : null;
  }
  function transition(task, next, actorId, details = {}) {
    if (!TRANSITIONS[task.status]?.has(next)) return deny("INVALID_TASK_TRANSITION");
    task.status = next;
    task.updatedAt = now();
    task.history.push({ status: next, at: task.updatedAt, actorId: clean(actorId), details: clone(details) });
    record("TASK_STATUS_CHANGED", task, actorId, { status: next, ...details });
    return { success: true, task: clone(task) };
  }

  function enqueue(input = {}) {
    const orderId = clean(input.orderId);
    const proposalId = clean(input.proposalId);
    const title = clean(input.title);
    const scope = clean(input.scope);
    const serviceType = clean(input.serviceType);
    const assignedTo = clean(input.assignedTo || actor);
    const approvedBy = clean(input.approvedBy);
    const approvalId = clean(input.approvalId);
    if (!orderId || !title || !scope || !serviceType || !assignedTo) return deny("TASK_FIELDS_REQUIRED");
    if (input.approved !== true || !approvedBy || !approvalId) return deny("EXPLICIT_APPROVAL_REQUIRED");
    if (!SERVICE_TYPES.has(serviceType)) return deny("SERVICE_TYPE_NOT_SUPPORTED");
    if (taskByOrder.has(orderId)) return deny("ORDER_ALREADY_QUEUED");
    const taskId = clean(input.taskId) || "DF-" + clean(idFactory());
    if (!/^[A-Za-z0-9._:-]{1,160}$/.test(taskId) || tasks.has(taskId)) return deny("TASK_ID_INVALID_OR_DUPLICATE");
    const task = {
      taskId, orderId, proposalId: proposalId || null, title, scope, serviceType,
      executorId: "CEU/DARK_FACTORY/MANUAL_OPERATOR",
      assignedTo, approvedBy, approvalId,
      clientId: clean(input.clientId) || null,
      deadline: clean(input.deadline) || null,
      status: "QUEUED",
      deliverables: [],
      review: null,
      delivery: null,
      payment: { status: "NOT_CONFIRMED", amount: null, confirmedBy: null, confirmedAt: null },
      createdAt: now(), updatedAt: now(),
      history: [{ status: "QUEUED", at: now(), actorId: approvedBy, details: { approvalId, serviceType } }]
    };
    tasks.set(taskId, task);
    taskByOrder.set(orderId, taskId);
    record("TASK_QUEUED", task, approvedBy, { serviceType, executorId: task.executorId, assignedTo });
    return { success: true, task: clone(task) };
  }

  function claim(taskId, actorId) {
    const task = tasks.get(clean(taskId));
    if (!task) return deny("TASK_NOT_FOUND");
    if (clean(actorId) !== task.assignedTo) return deny("ASSIGNEE_REQUIRED");
    if (task.status !== "QUEUED") return deny("TASK_NOT_QUEUED");
    return transition(task, "IN_PROGRESS", actorId);
  }

  function submitDeliverables(taskId, actorId, deliverables) {
    const task = tasks.get(clean(taskId));
    if (!task) return deny("TASK_NOT_FOUND");
    if (clean(actorId) !== task.assignedTo) return deny("ASSIGNEE_REQUIRED");
    if (task.status !== "IN_PROGRESS") return deny("TASK_NOT_IN_PROGRESS");
    if (!Array.isArray(deliverables) || deliverables.length === 0) return deny("DELIVERABLES_REQUIRED");
    const normalized = [];
    for (const item of deliverables) {
      const name = clean(item?.name);
      const content = clean(item?.content);
      const format = clean(item?.format) || "text";
      if (!name || !content) return deny("DELIVERABLE_CONTENT_REQUIRED");
      if (content.length > 200000) return deny("DELIVERABLE_TOO_LARGE");
      normalized.push({ name, content, format });
    }
    task.deliverables = normalized;
    task.submittedAt = now();
    const result = transition(task, "SUBMITTED", actorId, { deliverableCount: normalized.length });
    return result;
  }

  function review(taskId, reviewerId, decision, note = "") {
    const task = tasks.get(clean(taskId));
    const reviewer = clean(reviewerId);
    if (!task) return deny("TASK_NOT_FOUND");
    if (!reviewer) return deny("REVIEWER_REQUIRED");
    if (task.status !== "SUBMITTED") return deny("TASK_NOT_SUBMITTED");
    if (!["APPROVE", "RETURN"].includes(decision)) return deny("REVIEW_DECISION_INVALID");
    if (decision === "APPROVE") {
      task.review = { decision, reviewerId: reviewer, note: clean(note), independent: reviewer !== task.assignedTo, at: now() };
      return transition(task, "READY_TO_DELIVER", reviewer, { decision, independentReview: reviewer !== task.assignedTo });
    }
    task.review = { decision, reviewerId: reviewer, note: clean(note), independent: reviewer !== task.assignedTo, at: now() };
    return transition(task, "IN_PROGRESS", reviewer, { decision, note: clean(note) });
  }

  function markDelivered(taskId, actorId, confirmation = {}) {
    const task = tasks.get(clean(taskId));
    if (!task) return deny("TASK_NOT_FOUND");
    if (clean(actorId) !== task.assignedTo && clean(actorId) !== actor) return deny("DELIVERY_ACTOR_NOT_AUTHORIZED");
    if (task.status !== "READY_TO_DELIVER") return deny("TASK_NOT_APPROVED_FOR_DELIVERY");
    if (confirmation.customerConfirmed !== true) return deny("CUSTOMER_DELIVERY_CONFIRMATION_REQUIRED");
    const reference = clean(confirmation.reference);
    if (!reference) return deny("DELIVERY_REFERENCE_REQUIRED");
    task.delivery = { confirmed: true, reference, confirmedBy: clean(actorId), confirmedAt: now() };
    return transition(task, "DELIVERED", actorId, { deliveryReference: reference });
  }

  function confirmPayment(taskId, actorId, input = {}) {
    const task = tasks.get(clean(taskId));
    if (!task) return deny("TASK_NOT_FOUND");
    const amount = Number(input.amount);
    if (task.status !== "DELIVERED") return deny("DELIVERY_REQUIRED_BEFORE_PAYMENT_RECORD");
    if (input.confirmed !== true || !clean(actorId)) return deny("MANUAL_PAYMENT_CONFIRMATION_REQUIRED");
    if (!Number.isFinite(amount) || amount <= 0) return deny("PAYMENT_AMOUNT_INVALID");
    if (task.payment.status === "CONFIRMED") return deny("PAYMENT_ALREADY_CONFIRMED");
    task.payment = { status: "CONFIRMED", amount: Math.round(amount * 100) / 100, confirmedBy: clean(actorId), confirmedAt: now(), reference: clean(input.reference) || null };
    task.updatedAt = now();
    record("PAYMENT_MANUALLY_CONFIRMED", task, actorId, { amount: task.payment.amount, reference: task.payment.reference });
    return { success: true, task: clone(task) };
  }

  function cancel(taskId, actorId, reason) {
    const task = tasks.get(clean(taskId));
    if (!task) return deny("TASK_NOT_FOUND");
    if (clean(actorId) !== actor && clean(actorId) !== task.assignedTo) return deny("CANCELLATION_NOT_AUTHORIZED");
    const note = clean(reason);
    if (!note) return deny("CANCELLATION_REASON_REQUIRED");
    return transition(task, "CANCELLED", actorId, { reason: note });
  }

  return Object.freeze({
    enqueue, claim, submitDeliverables, review, markDelivered, confirmPayment, cancel,
    getTask, listTasks: () => [...tasks.values()].map(clone),
    listEvents: () => events.map(clone),
    getStatus: () => ({
      executorId: "CEU/DARK_FACTORY/MANUAL_OPERATOR",
      mode: "OPERATOR_ASSISTED",
      status: "READY_FOR_MANUAL_ASSIGNMENT",
      supportedServices: [...SERVICE_TYPES],
      tasks: tasks.size,
      externalAutomationEnabled: false,
      externalPublicationEnabled: false,
      paymentIntegrationEnabled: false,
      persistentBackendEnabled: false
    })
  });
}
