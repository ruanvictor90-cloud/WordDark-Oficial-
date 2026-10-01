import { id } from "./id.js";

export class EmergencyStop {
  constructor(){ this.stops=new Map(); this.audit=[]; }
  trigger({operationId,sectorId,requesterId,reason}={}){
    if(!operationId) return {success:false,reason:"OPERATION_ID_REQUIRED"};
    const current=this.stops.get(operationId);
    if(current?.status!=="RELEASED") return {success:true,status:"ALREADY_STOPPED",stop:structuredClone(current)};
    const stop={id:id("STOP"),operationId,sectorId:sectorId||null,requesterId:requesterId||null,
      reason:reason||"Parada de emergência solicitada.",status:"ACTIVE",createdAt:new Date().toISOString()};
    this.stops.set(operationId,stop); this.audit.push({event:"TRIGGERED",...structuredClone(stop)});
    return {success:true,status:"STOPPED",stop:structuredClone(stop)};
  }
  isStopped(operationId){ return this.stops.get(operationId)?.status==="ACTIVE"; }
  assertRunning(operationId){
    const stop=this.stops.get(operationId);
    return stop?.status==="ACTIVE"
      ? {allowed:false,reason:"EMERGENCY_STOP_ACTIVE",stopId:stop.id}
      : {allowed:true};
  }
  release(operationId,{requesterId,reason}={}){
    const stop=this.stops.get(operationId); if(!stop) return {success:false,reason:"STOP_NOT_FOUND"};
    stop.status="RELEASED"; stop.releasedAt=new Date().toISOString();
    this.audit.push({event:"RELEASED",operationId,requesterId:requesterId||null,reason:reason||null,stopId:stop.id});
    return {success:true,status:"RELEASED",stop:structuredClone(stop)};
  }
  getAudit(){ return structuredClone(this.audit); }
}
