/* WordDark Core — Operation Engine
 * Motor único. Agora entende Gate + Context + Permission antes da autorização global.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports){module.exports=factory(require("./operation"));return;}
 const r=root||(typeof window!=="undefined"?window:globalThis);r.WordDarkOperationEngine=factory(r.WordDarkCoreOperation);
})(typeof globalThis!=="undefined"?globalThis:window,function(WordDarkOperation){
 class WordDarkOperationEngine{
  constructor(options={}){this.security=options.security||null;this.authorize=options.authorize||null;this.route=options.route||(()=>({success:false,reason:"Roteamento não configurado."}));this.execute=options.execute||(()=>({success:false,reason:"Executor não configurado."}));this.registry=options.registry||null;this.environmentGuard=options.environmentGuard||null;this.record=options.record||(()=>{});this.idPrefix=options.idPrefix||"OP";this.completedOperations=new Set();this.emergencyStop=options.emergencyStop||null;this.gateRegistry=options.gateRegistry||new Map();this.permissionSet=options.permissionSet||null;}
  generateId(){return this.idPrefix+"-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase();}
  create(source={}){const op=new WordDarkOperation({...source,operationId:source.operationId||this.generateId()});const v=op.validate();if(!v.valid&&op.status==="CREATED")op.transition("REJECTED",{stage:"VALIDATION",errors:v.errors});return op;}
  recordStage(op,data={}){this.record(op);this.registry?.recordEvent?.(op,op.status,data);}
  run(operation){
   if(!(operation instanceof WordDarkOperation))throw new Error("O engine exige uma operação do contrato central.");
   if(this.completedOperations.has(operation.operationId)){operation.replayBlocked=true;this.recordStage(operation,{stage:"SECURITY",reason:"OPERATION_ALREADY_COMPLETED"});return operation;}
   const v=operation.validate();if(!v.valid){if(operation.status==="CREATED")operation.transition("REJECTED",{stage:"VALIDATION",errors:v.errors});this.recordStage(operation);return operation;}
   const stop=()=>this.emergencyStop?.assertRunning?.(operation.operationId)||{allowed:true};if(!stop().allowed)return this.cancel(operation,"PRE_EXECUTION",stop());
   operation.transition("IDENTIFIED");this.recordStage(operation);
   if(operation.context?.environment&&operation.context.environment!==operation.environment)return this.fail(operation,"CONTEXT","CONTEXT_ENVIRONMENT_MISMATCH");
   if(this.environmentGuard){const e=this.environmentGuard.canRun(operation);if(!e?.allowed)return this.block(operation,"ENVIRONMENT",e.reason);}
   if(!stop().allowed)return this.cancel(operation,"ENVIRONMENT",stop());
   const gate=this.gateRegistry?.get(operation.destinationId)||this.gateRegistry?.get(operation.context?.destinationId);
   if(gate){const gr=gate.receive({profile:operation.context?.profile||operation.payload?.profile,context:operation.context});if(!gr.success)return this.reject(operation,"GATE",gr.reason);}
   if(this.permissionSet){const p=this.permissionSet.authorize({profile:operation.context?.profile||operation.payload?.profile,capability:operation.payload?.capability||operation.operationType,action:operation.payload?.action||"request",resourceId:operation.resourceId,clientId:operation.clientId,environment:operation.environment});if(!p)return this.reject(operation,"PERMISSION","ACCESS_DENIED");}
   const auth=this.authorize?this.authorize(operation):this.security?.authorize?.({identityId:operation.requesterId,operationId:operation.operationId,capability:operation.operationType,action:"request",environment:operation.environment,scope:operation.destinationId||"*"});if(!auth?.allowed)return this.reject(operation,"AUTHORIZATION",auth?.reason||"Operação não autorizada.");
   operation.transition("AUTHORIZED",{authorization:auth.reference||null});this.recordStage(operation);
   const routing=this.route(operation);if(!routing?.success)return this.block(operation,"ROUTING",routing?.reason||"Rota indisponível.");
   operation.transition("ROUTED",{routeId:routing.routeId||null});this.recordStage(operation);operation.transition("EXECUTING");this.recordStage(operation);
   const execution=this.execute(operation,{emergencyStop:this.emergencyStop});if(!execution?.success)return this.fail(operation,"EXECUTION",execution?.reason||"Execução falhou.");const postStop=stop();if(!postStop.allowed)return this.cancel(operation,"POST_EXECUTION",postStop);
   operation.transition("VALIDATING",{execution:execution.result||execution});this.recordStage(operation);
   if(execution.validated===false)return this.fail(operation,"VALIDATION",execution.validationReason||"Resultado não validado.");
   operation.transition("COMPLETED",{routeId:routing.routeId||null,execution:execution.result||execution});this.completedOperations.add(operation.operationId);this.recordStage(operation);return operation;
  }
  reject(o,s,r){o.transition("REJECTED",{stage:s,reason:r});this.recordStage(o);return o;}
  block(o,s,r){o.transition("BLOCKED",{stage:s,reason:r});this.recordStage(o);return o;}
  fail(o,s,r){o.transition("FAILED",{stage:s,reason:r});this.recordStage(o);return o;}
  cancel(o,s,d){o.transition("CANCELLED",{stage:s,...d});this.recordStage(o);return o;}
 }
 return WordDarkOperationEngine;
});