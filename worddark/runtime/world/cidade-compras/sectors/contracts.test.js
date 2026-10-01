import assert from "node:assert/strict";
import {
  receiveAtGate, receiveCommunication, startAttendance, createCommerceSession,
  createAccountOperation, createMarketingRequest, planMarketingRequest, sendToFactory,
  createSupplierOrder, sendSupplierOrder, createShipment, updateShipment,
  createAfterSalesCase, closeAfterSalesCase, createIncident, transitionIncident,
  recordCommerceKnowledge
} from "./index.js";

const gate = receiveAtGate({ id:"WD-GATE-CC-0001", source:"SOCIAL", destination:"ATTENDANCE" });
assert.equal(gate.status, "RECEIVED");

const communication = receiveCommunication({ id:"WD-MSG-CC-0001", channel:"SOCIAL", customerId:"WD-CUS-0001", message:"Quero comprar o produto X." });
const attendance = startAttendance({ id:"WD-ATT-0001", communicationId:communication.id, customerId:communication.customerId });
assert.equal(attendance.step, "IDENTIFY_CUSTOMER");

const session = createCommerceSession({ id:"WD-SES-0001", customerId:"WD-CUS-0001", channel:"SOCIAL" });
assert.equal(session.status, "OPEN");

const account = createAccountOperation({ id:"WD-ACC-0001", type:"CHARGE", orderId:"WD-ORD-0001", amount:199.9 });
assert.equal(account.status, "PENDING");

const marketing = createMarketingRequest({
  id:"WD-MKT-0001", source:"COMMERCE_CITY",
  brief:"Criar campanha para o produto X", channelIds:["WD-CH-0001"],
  requestedBy:"COMMERCE_CITY"
});
const plannedMarketing = planMarketingRequest(marketing);
assert.equal(plannedMarketing.status, "PLANNED");
const factoryRequest = sendToFactory(plannedMarketing);
assert.equal(factoryRequest.nextService, "DARK_FACTORY");

const supplierOrder = createSupplierOrder({ id:"WD-SUPORD-0001", orderId:"WD-ORD-0001", supplierId:"WD-SUP-0001", items:[{productId:"WD-PROD-0001", quantity:1}] });
assert.equal(sendSupplierOrder(supplierOrder).status, "SENT");

const shipment = createShipment({ id:"WD-SHIP-0001", orderId:"WD-ORD-0001" });
assert.equal(updateShipment(shipment, "IN_TRANSIT").status, "IN_TRANSIT");

const afterSales = createAfterSalesCase({ id:"WD-AS-0001", orderId:"WD-ORD-0001", customerId:"WD-CUS-0001", type:"TRACKING", description:"Cliente solicitou rastreio." });
assert.equal(closeAfterSalesCase(afterSales, "Código de rastreio enviado.").status, "CLOSED");

const incident = createIncident({ id:"WD-ERR-0001", source:"LOGISTICS", operationId:"WD-OP-0001", type:"DELIVERY_EXCEPTION", description:"Entrega com exceção." });
assert.equal(transitionIncident(incident, "ANALYZING").status, "ANALYZING");

assert.equal(recordCommerceKnowledge({ id:"WD-KNOW-0001", source:"INCIDENT", type:"LESSON", data:{ lesson:"Registrar falhas de entrega" }}).status, "RECORDED");

console.log("Commerce sectors: PASS");
