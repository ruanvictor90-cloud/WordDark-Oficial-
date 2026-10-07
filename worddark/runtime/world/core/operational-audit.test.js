const assert=require("assert");
const Operation=require("../contracts/operation");
const Request=require("../contracts/request");
const Message=require("../contracts/message");
const Receipt=require("../contracts/receipt");
const Catalog=require("./capability-catalog");
const Road=require("./road");
const Route=require("../contracts/route");
const Communication=require("./communication");

function expect(condition,message){assert.ok(condition,message);}

(function contractAudit(){
  const op=new Operation({operationId:"AUD-OP",requesterId:"AUD-REQ",originId:"terra/test",destinationId:"ceu/test",operationType:"CREATE_CONTENT",action:"CREATE_CONTENT",service:"content.produce",capability:"CONTENT_CREATE",environment:"TEST"});
  expect(op.validate().valid,"Operation contract should validate.");
  expect(op.canTransitionTo("IDENTIFIED"),"Operation should enter IDENTIFIED.");
  op.transition("IDENTIFIED");
  const request=new Request({requestId:"AUD-REQ-1",operationId:"AUD-OP",requesterId:"AUD-REQ",originId:"terra/test",destinationId:"ceu/test",service:"content.produce",task:"Criar conteúdo"});
  expect(request.validate().valid,"Request contract should validate.");
  const message=new Message({messageId:"AUD-MSG-1",requestId:"AUD-REQ-1",type:"OPERATION_REQUEST",origin:"terra/test",destination:"ceu/test",service:"content.produce"});
  expect(message.validate().valid,"Message contract should validate.");
  const receipt=new Receipt({receiptId:"AUD-RCT-1",messageId:"AUD-MSG-1",requestId:"AUD-REQ-1",operationId:"AUD-OP",receiverId:"ceu/test",senderId:"terra/test",routeId:"AUD-ROUTE"});
  expect(receipt.validate().valid,"Receipt contract should validate.");
  console.log("contractAudit: OK");
})();

(function capabilityAudit(){
  const cases=[
    ["CREATE_CONTENT","CONTENT_CREATE","content.produce"],
    ["EDIT_PHOTO","CONTENT_EDIT","content.edit"],
    ["REPLACE_AUDIO","CONTENT_EDIT","content.edit"],
    ["RENDER_CONTENT","CONTENT_RENDER","content.render"],
    ["PUBLISH_CONTENT","CONTENT_PUBLICATION","content.publish"],
    ["MANAGE_CHANNEL","CHANNEL_MANAGEMENT","channel.manage"],
    ["MANAGE_MARKETING","MARKETING_MANAGEMENT","marketing.manage"]
  ];
  for(const [action,capability,service] of cases){
    expect(Catalog.capabilityForAction(action)===capability,action+" capability mapping");
    expect(Catalog.serviceForCapability(capability)===service,capability+" service mapping");
  }
  console.log("capabilityAudit: OK");
})();

(function communicationAudit(){
  const road=new Road();
  road.registerRoute(new Route({routeId:"AUD-OUT",origin:"terra/test",destination:"ceu/test",service:"demo"}));
  road.registerRoute(new Route({routeId:"AUD-IN",origin:"ceu/test",destination:"terra/test",service:"demo"}));
  const communication=new Communication({road});
  const operation={operationId:"AUD-COMM",requesterId:"AUD-REQ",originId:"terra/test",destinationId:"ceu/test",operationType:"demo",service:"demo",payload:{task:"auditoria"}};
  const sent=communication.sendOperationRequest(operation);
  expect(sent.success,"Communication must deliver request.");
  const processed=communication.processOperation(operation,()=>({success:true,result:{status:"OK"}}));
  expect(processed.success,"Communication must return response.");
  expect(communication.getStatus().pending===0,"Communication must close pending request.");
  console.log("communicationAudit: OK");
})();
