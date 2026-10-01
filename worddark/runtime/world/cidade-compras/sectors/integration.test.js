import assert from "node:assert/strict";
import {
  receiveAtGate, receiveCommunication, startAttendance, advanceAttendance,
  createCommerceSession, createAccountOperation, settleAccountOperation,
  createMarketingRequest, planMarketingRequest, sendToFactory, receiveFactoryResult, prepareDistribution, createSupplierOrder, sendSupplierOrder,
  createShipment, updateShipment, createAfterSalesCase, closeAfterSalesCase,
  createIncident, transitionIncident, recordCommerceKnowledge
} from "./index.js";

const gate = receiveAtGate({ id:"WD-GATE-CC-TEST-001", source:"SOCIAL", destination:"ATTENDANCE", actorId:"WD-USR-TEST-001" });
assert.equal(gate.status,"RECEIVED");

const communication = receiveCommunication({
  id:"WD-MSG-CC-TEST-001", channel:"SOCIAL", customerId:"WD-CUS-TEST-001",
  message:"Quero comprar o produto TEST-001."
});

const attendance = startAttendance({
  id:"WD-ATT-CC-TEST-001", communicationId:communication.id, customerId:communication.customerId
});
const attendanceConfirmed = advanceAttendance(attendance,"CONFIRM_ORDER");
assert.equal(attendanceConfirmed.step,"CONFIRM_ORDER");

const session = createCommerceSession({
  id:"WD-SES-CC-TEST-001", customerId:communication.customerId, channel:communication.channel
});
assert.equal(session.status,"OPEN");

const account = createAccountOperation({
  id:"WD-ACC-CC-TEST-001", type:"CHARGE", orderId:"WD-ORD-CC-TEST-001", amount:199.90
});
assert.equal(settleAccountOperation(account).status,"SETTLED");

const supplierOrder = createSupplierOrder({
  id:"WD-SUPORD-CC-TEST-001", orderId:"WD-ORD-CC-TEST-001",
  supplierId:"WD-SUP-TEST-001", items:[{productId:"WD-PROD-TEST-001",quantity:1}]
});
assert.equal(sendSupplierOrder(supplierOrder).status,"SENT");

const shipment = createShipment({ id:"WD-SHIP-CC-TEST-001", orderId:"WD-ORD-CC-TEST-001" });
assert.equal(updateShipment(shipment,"IN_TRANSIT","TEST-TRACK-001").status,"IN_TRANSIT");
assert.equal(updateShipment(shipment,"IN_TRANSIT","TEST-TRACK-001").trackingCode,"TEST-TRACK-001");

const marketing = createMarketingRequest({
  id:"WD-MKT-CC-TEST-001", source:"COMMERCE_CITY",
  brief:"Produzir conteúdo de teste para o produto TEST-001",
  channelIds:["WD-CH-TEST-001"], requestedBy:"COMMERCE_CITY"
});
const plannedMarketing = planMarketingRequest(marketing);
assert.equal(plannedMarketing.status,"PLANNED");
const factoryRequest = sendToFactory(plannedMarketing);
assert.equal(factoryRequest.status,"SENT_TO_FACTORY");
assert.equal(factoryRequest.currentService,"DARK_FACTORY");

const afterSales = createAfterSalesCase({
  id:"WD-AS-CC-TEST-001", orderId:"WD-ORD-CC-TEST-001",
  customerId:communication.customerId, type:"TRACKING", description:"Solicitação de rastreio."
});
assert.equal(closeAfterSalesCase(afterSales,"Rastreio enviado.").status,"CLOSED");

const incident = createIncident({
  id:"WD-ERR-CC-TEST-001", source:"LOGISTICS",
  operationId:"WD-OP-CC-TEST-001", type:"DELIVERY_EXCEPTION",
  description:"Exceção simulada para teste de recuperação."
});
const incidentAnalyzing = transitionIncident(incident,"ANALYZING");
assert.equal(incidentAnalyzing.status,"ANALYZING");
assert.equal(transitionIncident(incidentAnalyzing,"REQUEUED","Retornar à etapa necessária.").status,"REQUEUED");

assert.equal(recordCommerceKnowledge({
  id:"WD-KNOW-CC-TEST-001", source:"INCIDENT", type:"LESSON",
  data:{lesson:"Ocorrência registrada sem apagar histórico."}
}).status,"RECORDED");

console.log("Commerce integration flow: PASS");


// Content flow: Commerce -> Marketing -> Dark Factory -> Marketing -> Channel
const contentRequest = createMarketingRequest({
  id:"WD-MKT-CC-TEST-002", source:"COMMERCE_CITY",
  brief:"Produzir conteúdo de teste para o produto TEST-002", channelIds:["WD-CH-TEST-002"],
  requestedBy:"COMMERCE_CITY"
});
const plannedContent = planMarketingRequest(contentRequest);
assert.equal(plannedContent.nextService,"DARK_FACTORY");
const sentToFactory = sendToFactory(plannedContent);
assert.equal(sentToFactory.currentService,"DARK_FACTORY");
const returnedToMarketing = receiveFactoryResult(sentToFactory,"WD-RES-CC-TEST-002");
assert.equal(returnedToMarketing.currentService,"MARKETING");
const readyForChannel = prepareDistribution(returnedToMarketing);
assert.equal(readyForChannel.nextService,"CHANNEL");
assert.deepEqual(readyForChannel.history.map(entry => entry.status),["REQUESTED","PLANNED","SENT_TO_FACTORY","RESULT_RETURNED","READY_FOR_DISTRIBUTION"]);
