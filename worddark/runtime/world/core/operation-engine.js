/* WordDark Core — Unified Operation Engine */
(function(root,factory){if(typeof module==="object"&&module.exports){module.exports=factory(require("./operation"));return;}const r=root||(typeof window!=="undefined"?window:globalThis);r.WordDarkOperationEngine=factory(r.WordDarkOperation);})(typeof globalThis!=="undefined"?globalThis:window,function(WordDarkOperation){
 class WordDarkOperationEngine{
  constructor(o={}){this.security=o.security||null;this.authorize=o.authorize||null;this.route=o.route||(()=>({success:false,reason:"Roteamento não configurado."}));this.execute=o.execute||(()=>({success:false,reason:"Executor não configurado."}));this.registry=o.registry||null;this.environmentGuard=o.environmentGuard||null;this.record=o.record||(()=>{});this.idPrefix=o.idPrefix||"OP";this.completedOperations=new Set();this.emergencyStop=o.emergencyStop||null;this.gateRegistry=o.gateRegistry||new Map();this.permissionSet=o.permissionSet||null;this.operationalMemory=o.operationalMemory||null;}
  generateId(){return this.idPrefix+"-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,8).toUpperCase();}
  create(source={}){const op=new WordDarkOperation({...source,operationId:source.operationId||this.generateId()});const v=op.validate();if(!v.valid&&op.status==="CREATED")op.transition("REJECTED",{stage:"VALIDATION",errors:v.errors});this.emit(op,"OPERATION_CREATED");return op;}
  emit(op,event,data={}){this.record(op);this.registry?.recordEvent?.(op,event,data);}
  run(operation){if(!(operation instanceof WordDarkOperation))throw new Error("O engine exige uma operação do contrato central.");if(this.completedOperations.has(operation.operationId)){operation.replayBlocked=true;this.emit(operation,"OPERATION_RETURNED",{reason:"OPERATION_ALREADY_COMPLETED"});return operation;}
   const v=operation.validate();if(!v.valid){if(operation.status==="CREATED")operation.transition("REJECTED",{stage:"VALIDATION",errors:v.errors});this.emit(operation,"MODULE_FAILED",{stage:"VALIDATION",errors:v.errors});return operation;}
   const stop=()=>this.emergencyStop?.assertRunning?.(operation.operationId)||{allowed:true};if(!stop().allowed)return this.cancel(operation,"PRE_EXECUTION",stop());
   operation.transition("IDENTIFIED");this.emit(operation,"OPERATION_CREATED");
   if(this.environmentGuard){const e=this.environmentGuard.canRun(operation);if(!e?.allowed)return this.block(operation,"ENVIRONMENT",e.reason);}
   const gate=this.gateRegistry?.get(operation.destinationId)||this.gateRegistry?.get(operation.context?.destinationId);if(gate){const gr=gate.receive({profile:operation.context?.profile||operation.payload?.profile,context:operation.context});if(!gr.success)return this.reject(operation,"GATE",gr.reason);}
   if(this.permissionSet){const p=this.permissionSet.authorize({profile:operation.context?.profile||operation.payload?.profile,capability:operation.capability||operation.payload?.capability||operation.operationType,action:operation.payload?.action||"request",resourceId:operation.resourceId,clientId:operation.clientId,environment:operation.environment});if(!p)return this.reject(operation,"PERMISSION","ACCESS_DENIED");}
   const auth=this.authorize?this.authorize(operation):this.security?.authorize?.({identityId:operation.requesterId,operationId:operation.operationId,capability:operation.capability||operation.operationType,action:"request",environment:operation.environment,scope:operation.destinationId||"*"});if(!auth?.allowed)return this.reject(operation,"AUTHORIZATION",auth?.reason||"Operação não autorizada.");
   operation.transition("AUTHORIZED",{authorization:auth.reference||null});this.emit(operation,"OPERATION_AUTHORIZED",{reference:auth.reference||null});operation.transition("RECEIVED");this.emit(operation,"OPERATION_RECEIVED");
   const routing=this.route(operation);if(!routing?.success)return this.block(operation,"ROUTING",routing?.reason||"Rota indisponível.");operation.transition("ROUTED",{routeId:routing.routeId||null});this.emit(operation,"OPERATION_ROUTED",{routeId:routing.routeId||null});
   operation.transition("EXECUTING");this.emit(operation,"MODULE_STARTED",{moduleId:operation.currentModuleId||null});
   const execution=this.execute(operation,{emergencyStop:this.emergencyStop});
   const finalize=result=>{
    if(result?.status==="WAITING"){operation.transition("WAITING",result);this.emit(operation,"OPERATION_PAUSED",result);return operation;}
    if(!result?.success)return this.fail(operation,"MODULE_FAILED",result?.reason||"Execução falhou.",result?.failedModule);
    const postStop=stop();if(!postStop.allowed)return this.cancel(operation,"POST_EXECUTION",postStop);
    operation.transition("VALIDATING",{execution:result.result||result});this.emit(operation,"MODULE_COMPLETED",{moduleId:operation.currentModuleId||null});
    if(result.validated===false)return this.fail(operation,"MODULE_FAILED",result.validationReason||"Resultado não validado.",result.failedModule);
    operation.transition("COMPLETED",{operationId:operation.operationId,output:result.result||result,artifacts:result.artifacts||[],errors:result.errors||[],nextAction:result.nextAction||null});this.completedOperations.add(operation.operationId);this.operationalMemory?.rememberCompletion?.({operationId:operation.operationId,status:"COMPLETED",data:{destinationId:operation.destinationId}});this.emit(operation,"OPERATION_COMPLETED",{result:operation.result});return operation;
   };
   return execution&&typeof execution.then==="function"?execution.then(finalize).catch(error=>this.fail(operation,"MODULE_FAILED",error.message||"Execução assíncrona falhou.")):finalize(execution);
  }
  reject(o,s,r){o.transition("REJECTED",{stage:s,reason:r});this.emit(o,"MODULE_FAILED",{stage:s,reason:r});return o;}
  block(o,s,r){o.transition("BLOCKED",{stage:s,reason:r});this.emit(o,"MODULE_FAILED",{stage:s,reason:r});return o;}
  fail(o,s,r,moduleId=null){o.failedModule=moduleId||o.failedModule||null;o.currentModuleId=o.failedModule;o.transition("FAILED",{stage:s,reason:r,failedModule:o.failedModule});this.operationalMemory?.rememberFailure?.({operationId:o.operationId,moduleId:o.failedModule,reason:r,data:{stage:s}});this.emit(o,"MODULE_FAILED",{moduleId:o.failedModule,reason:r});return o;}
  cancel(o,s,d){o.transition("CANCELLED",{stage:s,...d});this.emit(o,"OPERATION_PAUSED",{stage:s,reason:"CANCELLED"});return o;}
  reenter(operation,moduleId,patch={}){if(!operation?.operationId||!moduleId)return{success:false,status:"REENTRY_INVALID"};if(operation.status!=="FAILED"&&operation.status!=="WAITING")return{success:false,status:"REENTRY_NOT_ALLOWED",currentStatus:operation.status};operation.currentModuleId=moduleId;operation.failedModule=moduleId;Object.assign(operation,patch);operation.transition("REENTRY",{moduleId});this.emit(operation,"OPERATION_RESUMED",{moduleId});return operation;}
 }
 return WordDarkOperationEngine;
});