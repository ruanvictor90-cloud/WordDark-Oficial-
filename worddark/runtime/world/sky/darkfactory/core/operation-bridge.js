/* WordDark — Dark Factory Operation Bridge · DF-0.11
 * A Rodovia Global transporta. O motor central autoriza.
 * A Dark Factory executa apenas depois que a operação chega ao Céu.
 */
class DarkFactoryOperationBridge {
  constructor({factory,communication,serviceMap={},requestClass=null}={}){this.factory=factory||null;this.communication=communication||null;this.serviceMap=serviceMap;this.requestClass=requestClass||this.resolveRequestClass();}
  resolveRequestClass(){if(typeof module==="object"&&module.exports){const R=require("./request");return typeof R==="function"?R:(R&&typeof R.DarkFactoryRequest==="function"?R.DarkFactoryRequest:null);}const R=typeof globalThis!=="undefined"?globalThis.DarkFactoryRequest:null;return typeof R==="function"?R:null;}

  getService(operation){return this.serviceMap[operation.operationType]||operation.operationType;}

  createRequest(operation){
    return new this.requestClass({
      requester:operation.requesterId,
      origin:operation.originId,
      destination:operation.destinationId,
      task:operation.payload&&operation.payload.task||("Executar operação "+operation.operationType),
      taskType:this.getService(operation),
      permission:"approved",
      payload:operation.payload
    });
  }

  route(operation){
    if(!this.communication)return{success:false,reason:"Comunicação/Rodovia não configurada."};
    return this.communication.sendOperationRequest(operation);
  }

  execute(operation){
    if(!this.factory)return{success:false,reason:"Dark Factory não configurada."};
    if(!this.communication)return{success:false,reason:"Comunicação/Rodovia não configurada."};

    return this.communication.processOperation(operation,(request)=>{
      const result=this.factory.process(this.createRequestFromGlobal(request));
      if(!result?.success)return result;

      /* Conteúdo: o Bridge continua o ciclo dentro do Céu.
       * O planejamento não é confundido com conclusão.
       */
      const isContent=String(request.service||"").toLowerCase().startsWith("content.")||request.payload?.content===true||!!request.payload?.contentId;
      if(isContent&&result.operationId&&this.factory.contentFactory?.execute){
        return this.factory.contentFactory.execute(result.operationId);
      }

      return result;
    });
  }

  createRequestFromGlobal(request){
    const p=request.payload||{};
    return {
      id:request.requestId||request.operationId,
      requester:request.requesterId,
      origin:request.originId,
      destination:request.destinationId,
      task:request.task,
      taskType:request.service,
      permission:"approved",
      payload:p,
      content:p.content||p.parameters?.content||false,
      contentId:p.contentId||p.parameters?.contentId||null,
      action:p.action||p.parameters?.action||null,
      network:p.network||p.parameters?.network||null,
      accountId:p.accountId||p.parameters?.accountId||null,
      createdAt:request.createdAt||new Date().toISOString(),
      validate(){return {valid:!!(this.requester&&this.origin&&this.destination&&this.task&&this.taskType),errors:[]};},
      toJSON(){return {...this};}
    };
  }
}
if(typeof module!=="undefined")module.exports=DarkFactoryOperationBridge;
if(typeof window!=="undefined")window.DarkFactoryOperationBridge=DarkFactoryOperationBridge;