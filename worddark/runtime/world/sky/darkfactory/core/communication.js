class DarkFactoryCommunication {
  constructor(factory, router = null) {
    this.factory=factory;
    this.router=router;
    this.name="DF-Communication";
    this.version="DF-0.5";
    this.status="ONLINE";
  }

  send(request) {
    const envelope=this.createRequestEnvelope(request);

    if(!request) {
      return {
        success:false,status:"REJEITADO",stage:"ENVIO",
        reason:"Solicitação ausente.",requestMessageId:envelope.messageId,
        requestEnvelope:envelope,responseEnvelope:null
      };
    }

    if(this.router) {
      const routing=this.router.send({
        envelope,
        origin:request.origin,
        destination:request.destination,
        service:request.taskType || "test"
      });
      if(!routing.success) {
        return {...routing,requestMessageId:envelope.messageId,requestEnvelope:envelope,responseEnvelope:null};
      }
    }

    const response=this.receive(envelope);
    return {...response,requestMessageId:envelope.messageId,requestEnvelope:envelope,responseEnvelope:response};
  }

  createRequestEnvelope(request) {
    return {
      protocol:"DF-0.5",
      messageId:this.generateId("MSG"),
      requestId:request ? request.id : null,
      origin:request ? request.origin : null,
      destination:request ? request.destination : null,
      type:"REQUEST",
      createdAt:new Date().toISOString(),
      payload:request ? request.toJSON() : null
    };
  }

  receive(envelope) {
    if(!envelope) return {success:false,status:"REJEITADO",stage:"RECEBIMENTO",reason:"Mensagem ausente."};
    if(!envelope.payload) return {
      success:false,status:"REJEITADO",stage:"RECEBIMENTO",
      reason:"Mensagem sem payload.",messageId:envelope.messageId || null,requestId:envelope.requestId || null
    };

    const request=this.rebuildRequest(envelope.payload,envelope.requestId);
    return this.processReceivedRequest(envelope,request);
  }

  rebuildRequest(data,originalRequestId) {
    const request=new DarkFactoryRequest({
      requester:data.requester,
      origin:data.origin,
      destination:data.destination,
      task:data.task,
      taskType:data.taskType || "test",
      permission:data.permission,
      payload:data.payload || null
    });

    request.id=originalRequestId || data.id || request.id;
    request.status=data.status || request.status;
    request.rejectionReason=data.rejectionReason || null;
    request.createdAt=data.createdAt || request.createdAt;
    return request;
  }

  processReceivedRequest(envelope,request) {
    return this.createResponseEnvelope(envelope,request,this.factory.process(request));
  }

  createResponseEnvelope(envelope,request,result) {
    const responseEnvelope={
      success:result.success,
      status:result.status,
      protocol:"DF-0.5",
      messageId:this.generateId("MSG"),
      responseTo:envelope.messageId,
      requestId:request.id,
      origin:request.destination,
      destination:request.origin,
      type:"RESPONSE",
      createdAt:new Date().toISOString(),
      result:result
    };

    if(this.router) {
      responseEnvelope.route=this.router.send({
        envelope:responseEnvelope,
        origin:responseEnvelope.origin,
        destination:responseEnvelope.destination,
        service:request.taskType || "test"
      });
    }
    return responseEnvelope;
  }

  getStatus() { return {name:this.name,version:this.version,status:this.status}; }

  generateId(prefix) {
    const time=Date.now().toString(36).toUpperCase();
    const random=Math.random().toString(36).substring(2,6).toUpperCase();
    return prefix+"-"+time+"-"+random;
  }
}

if(typeof window!=="undefined") window.DarkFactoryCommunication=DarkFactoryCommunication;
