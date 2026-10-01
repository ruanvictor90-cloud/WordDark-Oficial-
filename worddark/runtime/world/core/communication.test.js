const WordDarkRoad=require("./road");
const WordDarkRoute=require("../contracts/route");
const WordDarkMessage=require("../contracts/message");
const WordDarkRequest=require("../contracts/request");
const WordDarkReceipt=require("../contracts/receipt");
const WordDarkCommunication=require("./communication");

const road=new WordDarkRoad();
road.registerRoute(new WordDarkRoute({routeId:"R-OUT",origin:"terra/test",destination:"ceu/test",service:"demo"}));
road.registerRoute(new WordDarkRoute({routeId:"R-IN",origin:"ceu/test",destination:"terra/test",service:"demo"}));

const communication=new WordDarkCommunication({road});
const operation={operationId:"OP-COMM-TEST",requesterId:"CITY-TEST",originId:"terra/test",destinationId:"ceu/test",operationType:"demo",payload:{task:"Teste de comunicação"}};

const sent=communication.sendOperationRequest(operation);
if(!sent.success) throw new Error("O pedido deveria sair pela Rodovia.");
if(sent.receipt.status!=="RECEIVED") throw new Error("O recebimento deveria ser registrado.");

const processed=communication.processOperation(operation,(request)=>{
  if(!(request instanceof WordDarkRequest)) throw new Error("Pedido recebido deve usar o contrato global.");
  return {success:true,result:{status:"OK",echo:request.task}};
});

if(!processed.success) throw new Error("A resposta deveria retornar pela Rodovia.");
if(processed.response.type!=="OPERATION_RESPONSE") throw new Error("Resposta deve ser OPERATION_RESPONSE.");
if(processed.responseReceipt.status!=="RECEIVED") throw new Error("O recebimento da resposta deveria ser registrado.");
if(communication.messages.length!==2) throw new Error("Deveriam existir mensagem de ida e resposta.");
if(communication.receipts.length!==2) throw new Error("Deveriam existir dois recebimentos.");

console.log("communication.test: OK");
