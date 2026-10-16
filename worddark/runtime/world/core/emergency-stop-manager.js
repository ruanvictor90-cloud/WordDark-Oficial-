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
    // Fail-closed: sem política de autorização, uma parada nunca pode ser liberada.
    this.authorizeRelease=typeof options.authorizeRelease==="function"?options.authorizeRelease:null;
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

  release(operationId,{requesterId,reason,approvalContext}={}) {
    const stop=this.stops.get(operationId);
    if(!stop) return {success:false,status:"NOT_FOUND"};
    if(stop.status==="RELEASED") return {success:false,status:"NOT_ACTIVE",stopId:stop.stopId};

    const denied=(status)=>{
      this.audit.push({
        event:"EMERGENCY_STOP_RELEASE_DENIED",timestamp:new Date().toISOString(),
        operationId,requesterId:requesterId||null,reason:reason||null,
        stopId:stop.stopId,status
      });
      return {success:false,status,stopId:stop.stopId};
    };
    if(typeof requesterId!=="string"||!requesterId.trim()) return denied("REQUESTER_REQUIRED");
    if(!this.authorizeRelease) return denied("RELEASE_AUTHORIZATION_UNAVAILABLE");

    let authorization;
    try {
      authorization=this.authorizeRelease({operationId,stop:stop.toJSON(),requesterId,reason:reason||"",approvalContext});
    } catch (_) {
      return denied("RELEASE_AUTHORIZATION_FAILED");
    }
    if(!authorization||authorization.allowed!==true) return denied("RELEASE_NOT_AUTHORIZED");
    if(typeof authorization.approvalReference!=="string"||!authorization.approvalReference.trim()) {
      return denied("APPROVAL_REFERENCE_REQUIRED");
    }

    stop.status="RELEASED";
    this.audit.push({
      event:"EMERGENCY_STOP_RELEASED",timestamp:new Date().toISOString(),
      operationId,requesterId,reason:reason||null,stopId:stop.stopId,
      approvalReference:authorization.approvalReference
    });
    return {success:true,status:"RELEASED",stop,approvalReference:authorization.approvalReference};
  }

  getAudit(){return [...this.audit];}
}
if(typeof module!=="undefined") module.exports=WordDarkEmergencyStopManager;
if(typeof window!=="undefined") window.WordDarkEmergencyStopManager=WordDarkEmergencyStopManager;
