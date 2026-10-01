import assert from "node:assert/strict";
import { runCommerceRuntime, deliverCommerceRuntime, refundCommercePayment, recoverCommerceRuntime, openCommerceIncident, analyzeCommerceIncident, requeueCommerceIncident, reanalyzeCommerceIncident, resolveCommerceIncident, openIncidentAfterSales, advanceIncidentAfterSales } from "./runtime.js";

const result = runCommerceRuntime({
  operationId:"WD-OP-CC-RUNTIME-001",
  gateId:"WD-GATE-CC-RUNTIME-001",
  messageId:"WD-MSG-CC-RUNTIME-001",
  attendanceId:"WD-ATT-CC-RUNTIME-001",
  sessionId:"WD-SES-CC-RUNTIME-001",
  accountId:"WD-ACC-CC-RUNTIME-001",
  supplierOrderId:"WD-SUPORD-CC-RUNTIME-001",
  shipmentId:"WD-SHIP-CC-RUNTIME-001",
  customerId:"WD-CUS-CC-RUNTIME-001",
  channel:"SOCIAL",
  message:"Quero comprar o produto de teste.",
  orderId:"WD-ORD-CC-RUNTIME-001",
  supplierId:"WD-SUP-CC-RUNTIME-001",
  productId:"WD-PROD-CC-RUNTIME-001",
  amount:199.90,
  afterSalesCaseId:"WD-AS-CC-RUNTIME-001",
  afterSalesType:"TRACKING",
  afterSalesDescription:"Cliente solicitou acompanhamento da entrega."
});

assert.equal(result.status,"COMPLETED");
assert.equal(result.gate.status,"ROUTED");
assert.equal(result.communication.destination,"ATTENDANCE");
assert.equal(result.attendance.step,"CONFIRM_ORDER");
assert.equal(result.account.status,"SETTLED");
assert.equal(result.order.status,"SHIPPED");
assert.equal(result.order.total,199.90);
assert.equal(result.afterSales.status,"OPEN");
assert.equal(result.afterSales.type,"TRACKING");
assert.equal(result.supplierOrder.status,"SENT");
assert.equal(result.shipment.status,"IN_TRANSIT");
assert.equal(result.operation.status,"COMMERCE_CLOSED");
assert.equal(result.operation.history.length,10);

const delivered = deliverCommerceRuntime({
  operation: result.operation,
  order: result.order,
  shipment: result.shipment,
  trackingCode: "BR-TRACK-001"
});
assert.equal(delivered.order.status,"DELIVERED");
assert.equal(delivered.shipment.status,"DELIVERED");
assert.equal(delivered.shipment.trackingCode,"BR-TRACK-001");
assert.equal(delivered.operation.status,"ORDER_DELIVERED");

const refund = refundCommercePayment({
  operation: delivered.operation,
  order: delivered.order,
  account: result.account,
  note: "Teste de reembolso após entrega."
});
assert.equal(refund.order.status,"REFUNDED");
assert.equal(refund.account.status,"REFUNDED");
assert.equal(refund.account.type,"REFUND");
assert.equal(refund.operation.status,"PAYMENT_REFUNDED");

const incidentFlow = openCommerceIncident({
  operation: result.operation,
  order: result.order,
  incidentId: "WD-ERR-CC-RUNTIME-FLOW-001",
  source: "LOGISTICS",
  type: "DELIVERY_EXCEPTION",
  description: "Falha simulada de entrega."
});
assert.equal(incidentFlow.order.status,"INCIDENT");
assert.equal(incidentFlow.operation.status,"INCIDENT_OPEN");
assert.equal(incidentFlow.incident.status,"OPEN");

const analyzingIncident = analyzeCommerceIncident({
  operation: incidentFlow.operation,
  incident: incidentFlow.incident
});
assert.equal(analyzingIncident.operation.status,"INCIDENT_ANALYZING");
assert.equal(analyzingIncident.incident.status,"ANALYZING");

const requeued = requeueCommerceIncident({
  operation: analyzingIncident.operation,
  incident: analyzingIncident.incident
});
assert.equal(requeued.operation.status,"INCIDENT_REQUEUED");
assert.equal(requeued.incident.status,"REQUEUED");

const reanalyzed = reanalyzeCommerceIncident({
  operation: requeued.operation,
  incident: requeued.incident
});
assert.equal(reanalyzed.operation.status,"INCIDENT_ANALYZING");
assert.equal(reanalyzed.incident.status,"ANALYZING");

const resolved = resolveCommerceIncident({
  operation: reanalyzed.operation,
  incident: reanalyzed.incident,
  order: incidentFlow.order,
  action: "RESUME",
  resolution: "Transportadora reprocessará a entrega."
});
assert.equal(resolved.operation.status,"INCIDENT_RESOLVED");
assert.equal(resolved.incident.status,"RESOLVED");
assert.equal(resolved.order.status,"VALIDATING");
assert.equal(resolved.account,null);

const deliveredAfterSales = openIncidentAfterSales({
  operation: delivered.operation,
  order: delivered.order,
  customerId: delivered.order.customerId,
  afterSalesCaseId: "WD-AS-CC-RUNTIME-DELIVERED-001",
  type: "SUPPORT",
  description: "Suporte aberto após entrega."
});
assert.equal(deliveredAfterSales.afterSales.status,"OPEN");
const progressedAfterSales = advanceIncidentAfterSales(deliveredAfterSales.afterSales);
assert.equal(progressedAfterSales.status,"IN_PROGRESS");

const afterSales = openIncidentAfterSales({
  operation: result.operation,
  order: result.order,
  customerId: result.order.customerId,
  afterSalesCaseId: "WD-AS-CC-INCIDENT-001",
  type: "EXCHANGE",
  description: "Cliente solicitou troca após ocorrência."
});
assert.equal(afterSales.operation.status,"AFTER_SALES_OPENED");
assert.equal(afterSales.afterSales.status,"OPEN");

const afterSalesProgress = advanceIncidentAfterSales(afterSales.afterSales);
assert.equal(afterSalesProgress.status,"IN_PROGRESS");

const incident = recoverCommerceRuntime({
  operationId:"WD-OP-CC-RUNTIME-ERR-001",
  source:"LOGISTICS",
  type:"DELIVERY_EXCEPTION",
  description:"Falha simulada de entrega."
});
assert.equal(incident.status,"ANALYZING");

console.log("Commerce runtime: PASS");
