/* WordDark Core — Gate. Receives, validates access/context, records, forwards. Never executes. */
class WordDarkGate {
 constructor(s={}){this.gateId=s.gateId||null;this.type=s.type||"SERVICE";this.destinationId=s.destinationId||null;this.allowedProfiles=Array.isArray(s.allowedProfiles)?[...s.allowedProfiles]:[];this.status=s.status||"ACTIVE";this.audit=[];}
 validate(){const e=[];if(!this.gateId)e.push("gateId é obrigatório.");if(!this.destinationId)e.push("destinationId é obrigatório.");if(!["ACTIVE","LOCKED"].includes(this.status))e.push("status de portão inválido.");return {valid:e.length===0,errors:e};}
 receive({profile=null,context=null}={}){if(this.status!=="ACTIVE")return this.reject("GATE_LOCKED",profile,context);if(this.allowedProfiles.length&&!this.allowedProfiles.includes(profile))return this.reject("PROFILE_NOT_ALLOWED",profile,context);const r={success:true,status:"ACCEPTED",gateId:this.gateId,destinationId:this.destinationId,profile,timestamp:new Date().toISOString()};this.audit.push(r);return r;}
 reject(reason,profile,context){const r={success:false,status:"REJECTED",reason,gateId:this.gateId,destinationId:this.destinationId,profile,context:context||null,timestamp:new Date().toISOString()};this.audit.push(r);return r;}
 getAudit(){return [...this.audit];}
}
if(typeof module!=="undefined")module.exports=WordDarkGate;
if(typeof window!=="undefined")window.WordDarkGate=WordDarkGate;
