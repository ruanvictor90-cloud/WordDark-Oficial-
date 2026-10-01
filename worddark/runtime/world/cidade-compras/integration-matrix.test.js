import assert from "node:assert/strict";
import {
  receiveAtGate, receiveCommunication, startAttendance, advanceAttendance,
  createCommerceSession, createAccountOperation, settleAccountOperation,
  createMarketingRequest, planMarketingRequest, sendToFactory, receiveFactoryResult, prepareDistribution,
  createSupplierOrder, sendSupplierOrder, createShipment, updateShipment,
  createAfterSalesCase, closeAfterSalesCase, createIncident, transitionIncident,
  recordCommerceKnowledge
} from "./sectors/index.js";

// 1. Multichannel equivalence: every supported channel enters the same communication contract.
for (const [index, channel] of ["SITE","SOCIAL","MESSAGING","MARKETPLACE"].entries()) {
  const item = receiveCommunication({
    id:`WD-MSG-MATRIX-${index+1}`,
    channel,
    customerId:`WD-CUS-MATRIX-${index+1}`,
    message:"Quero comprar o produto de teste."
  });
  assert.equal(item.status, "RECEIVED");
  assert.equal(item.channel, channel);
}

// 2. Human handoff: communication can leave automated attendance without changing its origin.
const handoffMessage = receiveCommunication({
  id:"WD-MSG-MATRIX-HUMAN",
  channel:"MESSAGING",
  customerId:"WD-CUS-MATRIX-HUMAN",
  message:"Preciso falar com uma pessoa."
});
const handedOff = handoffMessage;
assert.equal(handedOff.channel, "MESSAGING");

const attendance = startAttendance({
  id:"WD-ATT-MATRIX-HUMAN",
  communicationId:handoffMessage.id,
  customerId:handoffMessage.customerId
});
const humanStep = advanceAttendance(attendance, "HANDOFF");
assert.equal(humanStep.step, "HANDOFF");

// 3. Payment and refund contract: both financial actions belong to Accounts.
const charge = settleAccountOperation(createAccountOperation({
  id:"WD-ACC-MATRIX-CHARGE",
  type:"CHARGE",
  orderId:"WD-ORD-MATRIX-001",
  amount:299.90
}));
assert.equal(charge.status, "SETTLED");

const refund = createAccountOperation({
  id:"WD-ACC-MATRIX-REFUND",
  type:"REFUND",
  orderId:"WD-ORD-MATRIX-001",
  amount:299.90
});
assert.equal(refund.type, "REFUND");
assert.equal(refund.status, "PENDING");

// 4. Supplier path: commercial order becomes supplier order without moving supplier logic into Commerce.
const supplierOrder = sendSupplierOrder(createSupplierOrder({
  id:"WD-SUPORD-MATRIX-001",
  orderId:"WD-ORD-MATRIX-001",
  supplierId:"WD-SUP-MATRIX-001",
  items:[{productId:"WD-PROD-MATRIX-001",quantity:1}]
}));
assert.equal(supplierOrder.status, "SENT");

// 5. Logistics exception is represented without deleting the shipment history.
const shipment = createShipment({
  id:"WD-SHIP-MATRIX-001",
  orderId:"WD-ORD-MATRIX-001"
});
const exceptionShipment = updateShipment(shipment, "EXCEPTION", "EXCEPTION-001");
assert.equal(exceptionShipment.status, "EXCEPTION");
assert.equal(exceptionShipment.history.length, 2);

// 6. Incident recovery path remains explicit.
const incident = createIncident({
  id:"WD-ERR-MATRIX-001",
  source:"LOGISTICS",
  operationId:"WD-OP-MATRIX-001",
  type:"DELIVERY_EXCEPTION",
  description:"Falha simulada de entrega."
});
const analyzing = transitionIncident(incident, "ANALYZING");
const requeued = transitionIncident(analyzing, "REQUEUED", "Retornar à etapa necessária.");
assert.equal(requeued.status, "REQUEUED");
assert.equal(requeued.history.length, 3);

// 7. Content path: Commerce -> Marketing -> Dark Factory -> Marketing -> Channel.
const request = createMarketingRequest({
  id:"WD-MKT-MATRIX-001",
  source:"COMMERCE_CITY",
  brief:"Produzir conteúdo do produto de teste.",
  channelIds:["WD-CH-MATRIX-001"],
  requestedBy:"COMMERCE_CITY"
});
const planned = planMarketingRequest(request);
const sent = sendToFactory(planned);
const returned = receiveFactoryResult(sent, "WD-RES-MATRIX-001");
const ready = prepareDistribution(returned);
assert.deepEqual(
  ready.history.map(entry => entry.status),
  ["REQUESTED","PLANNED","SENT_TO_FACTORY","RESULT_RETURNED","READY_FOR_DISTRIBUTION"]
);
assert.equal(ready.nextService, "CHANNEL");

// 8. Learning: incidents can produce durable knowledge without altering the original record.
const learning = recordCommerceKnowledge({
  id:"WD-KNOW-MATRIX-001",
  source:"INCIDENT",
  type:"LESSON",
  data:{lesson:"Exceções de logística precisam retornar para análise."}
});
assert.equal(learning.status, "RECORDED");

console.log("Commerce integration matrix: PASS");
