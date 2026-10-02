import { id } from "./id.js";

export class EmergencyStop {
  constructor(){ this.stops=new Map(); this.audit=[]; this.globalStatus="RUNNING"; }

  trigger({operationId,sectorId,requesterId,reason}={}){
    if(!operationId) return this.triggerGlobal({sectorId,requesterId,reason});
    const current=this.stops.get(operationId);
    if(current?.status==="ACTIVE") return {success:true,status:"ALREADY_STOPPED",stop:structuredClone(current)};
    const stop={id:id("STOP"),operationId,sectorId:sectorId||null,requesterId:requesterId||null,
      reason:reason||"Parada de emergência solicitada.",status:"ACTIVE",createdAt:new Date().toISOString()};
    this.stops.set(operationId,stop); this.audit.push({event:"TRIGGERED",...structuredClone(stop)});
    return {success:true,status:"STOPPED",stop:structuredClone(stop)};
  }

  isStopped(operationId){ return this.globalStatus==="STOPPED"||this.stops.get(operationId)?.status==="ACTIVE"; }

  assertRunning(operationId){
    if(this.globalStatus==="STOPPED"){
      const globalStop=this.stops.get("GLOBAL");
      return {allowed:false,reason:"EMERGENCY_STOP_GLOBAL_ACTIVE",stopId:globalStop?.id||"GLOBAL"};
    }
    const stop=this.stops.get(operationId);
    return stop?.status==="ACTIVE"
      ? {allowed:false,reason:"EMERGENCY_STOP_ACTIVE",stopId:stop.id}
      : {allowed:true};
  }

  triggerGlobal({sectorId,requesterId,reason}={}){
    if(this.globalStatus==="STOPPED") return {success:true,status:"ALREADY_STOPPED",stop:structuredClone(this.stops.get("GLOBAL"))};
    const stop={id:id("STOP"),operationId:"GLOBAL",sectorId:sectorId||null,requesterId:requesterId||null,
      reason:reason||"Parada global de emergência solicitada.",status:"ACTIVE",createdAt:new Date().toISOString()};
    this.stops.set("GLOBAL",stop); this.globalStatus="STOPPED";
    this.audit.push({event:"GLOBAL_TRIGGERED",...structuredClone(stop)});
    return {success:true,status:"STOPPED",stop:structuredClone(stop)};
  }

  release(operationId="GLOBAL",{requesterId,reason}={}){
    if(operationId==="GLOBAL"){
      if(this.globalStatus!=="STOPPED") return {success:false,reason:"GLOBAL_STOP_NOT_FOUND"};
      const stop=this.stops.get("GLOBAL");
      stop.status="RELEASED";
      stop.releasedAt=new Date().toISOString();
      this.globalStatus="RUNNING";
      this.audit.push({event:"GLOBAL_RELEASED",operationId,requesterId:requesterId||null,reason:reason||null,stopId:stop.id});
      return {success:true,status:"RELEASED",stop:structuredClone(stop)};
    }
    const stop=this.stops.get(operationId);
    if(!stop) return {success:false,reason:"STOP_NOT_FOUND"};
    stop.status="RELEASED"; stop.releasedAt=new Date().toISOString();
    this.audit.push({event:"RELEASED",operationId,requesterId:requesterId||null,reason:reason||null,stopId:stop.id});
    return {success:true,status:"RELEASED",stop:structuredClone(stop)};
  }

  getAudit(){ return structuredClone(this.audit); }
}
