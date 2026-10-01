/* WordDark Core — World Runtime
 * ÚNICO runtime central. A atualização V1 é incorporada diretamente neste runtime.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports){module.exports=factory(require("./operation"));return;}
 const r=root||(typeof window!=="undefined"?window:globalThis);r.WordDarkWorldRuntime=factory(r.WordDarkCoreOperation);
})(typeof globalThis!=="undefined"?globalThis:window,function(WordDarkOperation){
 class WordDarkWorldRuntime{
  constructor({accountManager=null,security=null,environmentGuard=null,road=null,registry=null,operationEngine=null,entityRegistry=null,permissionSet=null,gateRegistry=null,serviceRegistry=null,errorRecovery=null,inbox=null,versioning=null,emergencyStop=null}={}){
   this.accountManager=accountManager;this.security=security;this.environmentGuard=environmentGuard;this.road=road;this.registry=registry;this.operationEngine=operationEngine;
   this.entityRegistry=entityRegistry;this.permissionSet=permissionSet;this.gateRegistry=gateRegistry||new Map();this.serviceRegistry=serviceRegistry;
   this.errorRecovery=errorRecovery;this.inbox=inbox;this.versioning=versioning;this.emergencyStop=emergencyStop;this.name="WordDark Core";this.version="1.0-V1-INTEGRATED";this.status="ONLINE";
  }
  static compose(c={}){const r=new WordDarkWorldRuntime(c);r.assertReady();return r;}
  assertReady(){const h=this.getHealth();if(!h.ready)throw new Error("WordDark Core não está pronto: "+h.missing.join(", "));return true;}
  createOperation(source={}){if(!this.operationEngine)throw new Error("Operation Engine não configurado.");return this.operationEngine.create(source);}
  runOperation(source={}){const op=source instanceof WordDarkOperation?source:this.createOperation(source);return this.operationEngine.run(op);}
  registerEntity(entity){return this.entityRegistry.register(entity);}
  registerGate(gate){const v=gate.validate();if(!v.valid)throw new Error(v.errors.join(" "));this.gateRegistry.set(gate.gateId,gate);return gate;}
  grantPermission(rule){return this.permissionSet.grant(rule);}
  registerService(service){return this.serviceRegistry.register(service);}
  getStatus(){return {name:this.name,version:this.version,status:this.status,accounts:this.accountManager?.accounts?.size||0,identities:this.security?.identities?.size||0,entities:this.entityRegistry?.entities?.size||0,routes:this.road?.routes?.size||0,gates:this.gateRegistry?.size||0,services:this.serviceRegistry?.services?.size||0,operations:this.registry?.list?.().length||0,events:this.registry?.events?.length||0,pending:this.inbox?.getOpen?.().length||0};}
  getHealth(){
   const checks={accountManager:!!this.accountManager&&typeof this.accountManager.get==="function",security:!!this.security&&typeof this.security.registerIdentity==="function"&&typeof this.security.authorize==="function",environmentGuard:!!this.environmentGuard&&typeof this.environmentGuard.canRun==="function",road:!!this.road&&typeof this.road.registerRoute==="function"&&typeof this.road.findRoute==="function"&&typeof this.road.send==="function",registry:!!this.registry&&typeof this.registry.record==="function"&&typeof this.registry.recordEvent==="function",operationEngine:!!this.operationEngine&&typeof this.operationEngine.create==="function"&&typeof this.operationEngine.run==="function",entityRegistry:!!this.entityRegistry&&typeof this.entityRegistry.register==="function",permissionSet:!!this.permissionSet&&typeof this.permissionSet.authorize==="function",serviceRegistry:!!this.serviceRegistry&&typeof this.serviceRegistry.register==="function",emergencyStop:!!this.emergencyStop&&typeof this.emergencyStop.trigger==="function"&&typeof this.emergencyStop.assertRunning==="function"};
   const missing=Object.keys(checks).filter(k=>!checks[k]);return {status:missing.length?"DEGRADED":"HEALTHY",ready:!missing.length,checks,missing};
  }
  isReady(){return this.getHealth().ready;}
 }
 return WordDarkWorldRuntime;
});