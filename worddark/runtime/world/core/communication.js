/* WordDark — Communication Bus
 * Transporte bidirecional pela Rodovia Global.
 * Compatível com Node/CommonJS e navegador sem depender de detecção ambígua de require.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory({
      WordDarkRequest: require("../contracts/request"),
      WordDarkMessage: require("../contracts/message"),
      WordDarkReceipt: require("../contracts/receipt")
    });
    return;
  }

  const browserRoot = root || (typeof window !== "undefined" ? window : globalThis);
  browserRoot.WordDarkCommunication = factory({
    WordDarkRequest: browserRoot.WordDarkRequest,
    WordDarkMessage: browserRoot.WordDarkMessage,
    WordDarkReceipt: browserRoot.WordDarkReceipt
  });
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this), function (deps) {
  const WordDarkRequest = deps.WordDarkRequest;
  const WordDarkMessage = deps.WordDarkMessage;
  const WordDarkReceipt = deps.WordDarkReceipt;

  class WordDarkCommunication {
    constructor({road=null,registry=null}={}) {
      this.road=road;
      this.registry=registry;
      this.messages=[];
      this.receipts=[];
      this.pending=new Map();
    }

    generateId(prefix) {
      return prefix+"-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase();
    }

    sendOperationRequest(operation) {
      if(!this.road) return {success:false,reason:"Rodovia não configurada."};
      if(!WordDarkRequest || !WordDarkMessage || !WordDarkReceipt) {
        return {success:false,reason:"Contratos de comunicação não carregados."};
      }

      const request=new WordDarkRequest({
        requestId:"REQ-"+operation.operationId,
        operationId:operation.operationId,
        requesterId:operation.requesterId,
        originId:operation.originId,
        destinationId:operation.destinationId,
        service:operation.operationType,
        task:operation.payload&&operation.payload.task||("Executar operação "+operation.operationType),
        payload:operation.payload
      });

      const validation=request.validate();
      if(!validation.valid) return {success:false,reason:"Pedido inválido.",errors:validation.errors};

      const message=new WordDarkMessage({
        messageId:"MSG-"+operation.operationId,
        requestId:request.requestId,
        type:"OPERATION_REQUEST",
        origin:request.originId,
        destination:request.destinationId,
        service:request.service,
        payload:request.toJSON()
      });

      const delivery=this.road.send(message);
      if(!delivery.success) return delivery;

      this.messages.push(message.toJSON());

      const receipt=new WordDarkReceipt({
        receiptId:this.generateId("RCT"),
        messageId:message.messageId,
        requestId:request.requestId,
        operationId:operation.operationId,
        receiverId:request.destinationId,
        senderId:request.originId,
        routeId:delivery.routeId,
        status:"RECEIVED"
      });

      this.receipts.push(receipt.toJSON());
      this.pending.set(operation.operationId,{request,message,receipt,delivery});
      this.record(operation,"MESSAGE_SENT",{message:message.toJSON(),delivery:delivery.delivery});
      this.record(operation,"MESSAGE_RECEIVED",{receipt:receipt.toJSON()});

      return {
        success:true,
        status:"DELIVERED",
        routeId:delivery.routeId,
        messageId:message.messageId,
        requestId:request.requestId,
        request:request.toJSON(),
        receipt:receipt.toJSON(),
        delivery
      };
    }

    processOperation(operation,executor) {
      const pending=this.pending.get(operation.operationId);
      if(!pending) return {success:false,reason:"Pedido não encontrado para execução."};

      const execution=executor(pending.request);
      if(!execution || execution.success!==true) {
        return {
          success:false,
          stage:"EXECUTION",
          reason:(execution&&execution.reason)||"Execução falhou.",
          result:execution
        };
      }

      const response=new WordDarkMessage({
        messageId:"RMSG-"+operation.operationId,
        requestId:pending.request.requestId,
        type:"OPERATION_RESPONSE",
        origin:pending.request.destinationId,
        destination:pending.request.originId,
        service:pending.request.service,
        responseTo:pending.message.messageId,
        status:"PROCESSED",
        payload:execution.result||execution
      });

      const delivery=this.road.send(response);
      if(!delivery.success) {
        return {success:false,stage:"RETURN_ROAD",reason:delivery.reason,result:execution};
      }

      this.messages.push(response.toJSON());

      const responseReceipt=new WordDarkReceipt({
        receiptId:this.generateId("RCT"),
        messageId:response.messageId,
        requestId:pending.request.requestId,
        operationId:operation.operationId,
        receiverId:pending.request.originId,
        senderId:pending.request.destinationId,
        routeId:delivery.routeId,
        status:"RECEIVED",
        metadata:{responseTo:pending.message.messageId}
      });

      this.receipts.push(responseReceipt.toJSON());
      this.pending.delete(operation.operationId);
      this.record(operation,"RESPONSE_SENT",{message:response.toJSON(),delivery:delivery.delivery});
      this.record(operation,"RESPONSE_RECEIVED",{receipt:responseReceipt.toJSON()});

      return {
        success:true,
        validated:true,
        result:execution.result||execution,
        response:response.toJSON(),
        responseReceipt:responseReceipt.toJSON(),
        routeId:pending.delivery.routeId,
        returnRouteId:delivery.routeId
      };
    }

    record(operation,type,data) {
      if(this.registry && typeof this.registry.recordEvent==="function") {
        this.registry.recordEvent(operation,type,data);
      }
    }

    getStatus() {
      return {
        messages:this.messages.length,
        receipts:this.receipts.length,
        pending:this.pending.size
      };
    }
  }

  return WordDarkCommunication;
});
