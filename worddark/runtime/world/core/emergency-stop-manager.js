const WordDarkEmergencyStop = typeof require === "function"
  ? require("../contracts/emergency-stop")
  : (typeof window !== "undefined" ? window.WordDarkEmergencyStop : null);

/* WordDark — Emergency Stop Manager
 * Mantém a parada de emergência fora do executor.
 * Um stop disparado por qualquer setor bloqueia a operação inteira.
 */
class WordDarkEmergencyStopManager {
  constructor(options={}) {
    this.stops=new Map();
    this.audit=[];
    this.idPrefix=options.idPrefix||"STOP";
  }

  generateId(){
    return this.idPrefix+"-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).substring(2,6).toUpperCase();
  }

  trigger({sectorId,operationId,requesterId,reason}={}) {
    const stop=new WordDarkEmergencyStop({
      stopId:this.generateId(),sectorId,operationId,requesterId,
      reason:reason||"Parada de emergência solicitada."
    });
    const validation=stop.validate();
    if(!validation.valid) return {success:false,status:"REJECTED",errors:validation.errors};

    const existing=this.stops.get(operationId);
    if(existing && existing.status!=="RELEASED"){
      this.audit.push({event:"EMERGENCY_STOP_DUPLICATE",timestamp:new Date().toISOString(),...stop.toJSON()});
      return {success:true,status:"ALREADY_STOPPED",stop:existing};
    }

    stop.status="ACKNOWLEDGED";
    this.stops.set(operationId,stop);
    this.audit.push({event:"EMERGENCY_STOP_TRIGGERED",timestamp:new Date().toISOString(),...stop.toJSON()});
    return {success:true,status:"STOPPED",stop};
  }

  isStopped(operationId){
    const stop=this.stops.get(operationId);
    return !!(stop && stop.status!=="RELEASED");
  }

  getStop(operationId){return this.stops.get(operationId)||null;}

  assertRunning(operationId){
    if(this.isStopped(operationId)){
      const stop=this.stops.get(operationId);
      return {allowed:false,reason:"EMERGENCY_STOP_ACTIVE",stopId:stop.stopId,sectorId:stop.sectorId};
    }
    return {allowed:true};
  }

  release(operationId,{requesterId,reason}={}) {
    const stop=this.stops.get(operationId);
    if(!stop) return {success:false,status:"NOT_FOUND"};
    stop.status="RELEASED";
    this.audit.push({
      event:"EMERGENCY_STOP_RELEASED",timestamp:new Date().toISOString(),
      operationId,requesterId:requesterId||null,reason:reason||null,stopId:stop.stopId
    });
    return {success:true,status:"RELEASED",stop};
  }

  getAudit(){return [...this.audit];}
}
if(typeof module!=="undefined") module.exports=WordDarkEmergencyStopManager;
if(typeof window!=="undefined") window.WordDarkEmergencyStopManager=WordDarkEmergencyStopManager;
