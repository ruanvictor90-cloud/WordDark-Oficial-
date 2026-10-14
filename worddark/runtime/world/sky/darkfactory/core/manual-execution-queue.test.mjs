import assert from "node:assert/strict";
import { createManualExecutionQueue } from "./manual-execution-queue.js";

let tick = 0;
const audit = [];
const queue = createManualExecutionQueue({
  now: () => new Date(1760400000000 + tick++ * 1000).toISOString(),
  idFactory: () => "fixture-001",
  operatorId: "operator-1",
  audit: event => audit.push(event)
});

assert.equal(queue.getStatus().mode, "OPERATOR_ASSISTED");
assert.equal(queue.getStatus().externalAutomationEnabled, false);
assert.equal(queue.enqueue({ orderId: "order-1", title: "Pacote de conteúdo", scope: "3 textos e 1 roteiro", serviceType: "content.digital-package" }).code, "EXPLICIT_APPROVAL_REQUIRED");
assert.equal(queue.enqueue({ orderId: "order-1", title: "Pacote de conteúdo", scope: "3 textos e 1 roteiro", serviceType: "unknown", approved: true, approvedBy: "operator-1", approvalId: "approval-1" }).code, "SERVICE_TYPE_NOT_SUPPORTED");

const created = queue.enqueue({
  orderId: "order-1", proposalId: "proposal-1", title: "Pacote de conteúdo",
  scope: "3 textos e 1 roteiro", serviceType: "content.digital-package",
  assignedTo: "operator-1", approved: true, approvedBy: "operator-1", approvalId: "approval-1",
  clientId: "client-1", deadline: "2026-10-21"
});
assert.equal(created.success, true);
assert.equal(created.task.status, "QUEUED");
assert.equal(created.task.executorId, "CEU/DARK_FACTORY/MANUAL_OPERATOR");
assert.equal(queue.enqueue({ orderId: "order-1", title: "Duplicado", scope: "x", serviceType: "content.copywriting", approved: true, approvedBy: "operator-1", approvalId: "approval-2" }).code, "ORDER_ALREADY_QUEUED");

const id = created.task.taskId;
assert.equal(queue.claim(id, "someone-else").code, "ASSIGNEE_REQUIRED");
assert.equal(queue.claim(id, "operator-1").task.status, "IN_PROGRESS");
assert.equal(queue.submitDeliverables(id, "operator-1", []).code, "DELIVERABLES_REQUIRED");
assert.equal(queue.submitDeliverables(id, "operator-1", [{ name: "post", content: " " }]).code, "DELIVERABLE_CONTENT_REQUIRED");
assert.equal(queue.submitDeliverables(id, "operator-1", [
  { name: "Texto 1", format: "text", content: "Texto real produzido para a primeira publicação." },
  { name: "Roteiro", format: "text", content: "Roteiro real produzido para um vídeo curto." }
]).task.status, "SUBMITTED");
assert.equal(queue.markDelivered(id, "operator-1", { customerConfirmed: true, reference: "link-entrega" }).code, "TASK_NOT_APPROVED_FOR_DELIVERY");
assert.equal(queue.review(id, "operator-1", "APPROVE", "Revisado").task.status, "READY_TO_DELIVER");
assert.equal(queue.getTask(id).review.independent, false);
assert.equal(queue.markDelivered(id, "operator-1", { customerConfirmed: false, reference: "link-entrega" }).code, "CUSTOMER_DELIVERY_CONFIRMATION_REQUIRED");
assert.equal(queue.markDelivered(id, "operator-1", { customerConfirmed: true }).code, "DELIVERY_REFERENCE_REQUIRED");
assert.equal(queue.markDelivered(id, "operator-1", { customerConfirmed: true, reference: "link-entrega" }).task.status, "DELIVERED");
assert.equal(queue.confirmPayment(id, "operator-1", { confirmed: true, amount: 75 }).task.payment.status, "CONFIRMED");
assert.equal(queue.confirmPayment(id, "operator-1", { confirmed: true, amount: 75 }).code, "PAYMENT_ALREADY_CONFIRMED");
assert.ok(audit.some(event => event.event === "TASK_QUEUED"));
assert.ok(audit.some(event => event.event === "PAYMENT_MANUALLY_CONFIRMED"));
assert.equal(queue.listEvents().length, audit.length);
console.log("Dark Factory manual execution queue tests passed.");
