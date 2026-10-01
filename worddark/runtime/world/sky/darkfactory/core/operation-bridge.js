/* WordDark — Dark Factory Operation Bridge
 * A Rodovia Global é o transporte real entre Terra e Dark Factory.
 */
class DarkFactoryOperationBridge {
  constructor({factory,communication,serviceMap={}}={}){this.factory=factory||null;this.communication=communication||null;this.serviceMap=serviceMap;}
  getService(operation){return this.serviceMap[operation.operationType]||operation.operationType;}
  createRequest(operation){return new DarkFactoryRequest({requester:operation.requesterId,origin:operation.originId,destination:operation.destinationId||"world/sky/darkfactory",task:operation.payload&&operation.payload.task||("Executar operação "+operation.operationType),taskType:this.getService(operation),permission:"approved",payload:operation.payload});}
  route(operation){if(!this.communication)return {success:false,reason:"Comunicação/Rodovia não configurada."};return this.communication.sendOperationRequest(operation);}
  execute(operation){if(!this.factory)return {success:false,reason:"Dark Factory não configurada."};if(!this.communication)return {success:false,reason:"Comunicação/Rodovia não configurada."};return this.communication.processOperation(operation,(request)=>this.factory.process(this.createRequestFromGlobal(request)));}
  createRequestFromGlobal(request){return new DarkFactoryRequest({requester:request.requesterId,origin:request.originId,destination:request.destinationId,task:request.task,taskType:request.service,permission:"approved",payload:request.payload});}
}
if(typeof module!=="undefined") module.exports=DarkFactoryOperationBridge;
if(typeof window!=="undefined") window.DarkFactoryOperationBridge=DarkFactoryOperationBridge;
