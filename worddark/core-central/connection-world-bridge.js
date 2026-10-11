export class ConnectionWorldBridge{
  constructor({boundary,centralManager=null,accountManager=null,router=null}={}){if(!boundary)throw new Error("INFORMATION_BOUNDARY_REQUIRED");this.boundary=boundary;this.centralManager=centralManager;this.accountManager=accountManager;this.router=router;this.id="CONNECTION-WORLD-BRIDGE";}
  ingest(input={}){
    const result=this.boundary.receive(input);if(!result.accepted)return result;
    const event=result.event;
    this.centralManager?.registerCentralOperation?.({id:event.eventId,type:"EXTERNAL_INFORMATION",status:"RECEIVED",source:event.metadata.provider,capability:event.metadata.capability,receivedAt:event.metadata.receivedAt});
    return{accepted:true,eventId:event.eventId,status:"DELIVERED_TO_WORLD",information:event.data};
  }
  route(event,{destination=null}={}){
    if(!event?.eventId)throw new Error("WORLD_EVENT_REQUIRED");
    if(!this.router)return{status:"WAITING_ROUTER",eventId:event.eventId,destination};
    return this.router.route(event,{destination});
  }
  status(){return{id:this.id,status:"ACTIVE",boundary:this.boundary.status(),routerAttached:Boolean(this.router)};}
}
