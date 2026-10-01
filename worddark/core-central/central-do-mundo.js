export class CentralWorld {
 constructor({registry=null,capabilities=null,creation=null}={}){this.registry=registry;this.capabilities=capabilities;this.creation=creation;this.requests=[];}
 resolve(service){const capability=this.capabilities?.find?.(service);return capability?{success:true,type:"CAPABILITY",capability}:{success:false,type:"MISSING_CAPABILITY",service};}
 receiveRequest(operation,reason="CAPABILITY_NOT_FOUND"){
  const request={id:operation.id,origin:operation.origin,destination:operation.destination,service:operation.service,reason,status:"PENDING",at:new Date().toISOString()};
  this.requests.push(request);
  if(this.creation?.propose){request.proposal=this.creation.propose(operation,reason);}
  return request;
 }
 listRequests(){return [...this.requests];}
}
