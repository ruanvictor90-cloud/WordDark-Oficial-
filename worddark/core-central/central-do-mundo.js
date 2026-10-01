export class CentralWorld {
  constructor({registry,capabilities,creation=null}={}) {
    this.registry=registry;
    this.capabilities=capabilities;
    this.creation=creation;
    this.requests=[];
  }
  resolve(service){
    const capability=this.capabilities?.find(service);
    if(capability) return {success:true,type:"CAPABILITY",capability};
    return {success:false,type:"MISSING_CAPABILITY",service};
  }
  receiveRequest(operation,reason="CAPABILITY_NOT_FOUND"){
    const request={id:operation.id,origin:operation.origin,destination:operation.destination,service:operation.service,reason,status:"PENDING",at:new Date().toISOString()};
    this.requests.push(request);
    return request;
  }
  listRequests(){return [...this.requests];}
}
