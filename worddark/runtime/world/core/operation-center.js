/* WordDark — Central de Operações v0.1
 * Único ponto público para transformar intenção em operação/produção.
 * Registries, planner, router e connectors permanecem internos.
 */
(function(root,factory){
  if(typeof module==="object"&&module.exports)module.exports=factory(require("./universal-language"),require("../contracts/operation"),require("../contracts/production"),require("../contracts/result"),require("./content-decision-engine"));
  else{const r=root||(typeof window!=="undefined"?window:globalThis);r.WordDarkOperationCenter=factory(r.WordDarkUniversalLanguage,r.WordDarkOperation,r.WordDarkProduction,r.WordDarkResult,r.WordDarkContentDecisionEngine);}
})(typeof globalThis!=="undefined"?globalThis:window,function(Language,Operation,Production,Result,ContentDecisionEngine){
  class WordDarkOperationCenter{
    constructor({operationCoordinator=null,productionEngine=null,planner=null,contentDecisionEngine=ContentDecisionEngine,requesterId="WD-SYSTEM",defaultOrigin="world",defaultEnvironment="TEST"}={}){this.operationCoordinator=operationCoordinator;this.productionEngine=productionEngine;this.planner=planner;this.contentDecisionEngine=contentDecisionEngine;this.requesterId=requesterId;this.defaultOrigin=defaultOrigin;this.defaultEnvironment=defaultEnvironment;}
    normalize(input={}){return Language.parse(input);}
    chooseContent(input={}){if(!this.contentDecisionEngine?.choose)return{success:false,status:"DECISION_ENGINE_UNAVAILABLE"};return this.contentDecisionEngine.choose(input.candidates||[],{mode:input.mode||input.decisionMode,weights:input.weights});}
    submit(input={}){
      const parsed=this.normalize(input);const contentDecision=input.contentDecision||null;const decision=contentDecision?.enabled?this.chooseContent({candidates:input.candidates||contentDecision.candidates||[],mode:contentDecision.mode,weights:contentDecision.weights}):null;const env=input.environment||parsed.options?.environment||this.defaultEnvironment;
      if(parsed.type==="OPERATION"){
        const operation=new Operation({operationId:input.operationId||("OP-CENTER-"+Date.now().toString(36).toUpperCase()),requesterId:input.requesterId||this.requesterId,originId:input.originId||this.defaultOrigin,destinationId:parsed.destinationId,operationType:parsed.action,action:parsed.action,environment:env,resourceId:parsed.resourceId,clientId:parsed.clientId,context:parsed.context,payload:{...(parsed.parameters||{}),contentDecision:decision},intent:input.intent,need:input.need});
        const result=this.operationCoordinator?.submit?.(operation);
        return this.toResult(result,{action:parsed.action,environment:env});
      }
      if(!this.productionEngine)return Result.failure("Production Engine não configurado.");
      const production=this.productionEngine.create({productionId:input.productionId,requesterId:input.requesterId||this.requesterId,originId:input.originId||this.defaultOrigin,clientId:parsed.clientId,goal:parsed.goal,resourceId:parsed.resourceId,destinationId:parsed.destinationId,quantity:parsed.quantity||input.quantity||1,requirements:parsed.requirements,context:{...parsed.context,contentDecision:decision},options:{...parsed.options,environment:env,contentDecision:decision}});
      const planned=this.productionEngine.plan(production,input.operations||[]);
      const executed=this.productionEngine.execute(planned);
      return this.toResult(executed,{productionId:executed.productionId,environment:env});
    }
    reenter(operation,moduleId){if(!operation||!this.operationCoordinator?.engine?.reenter)return Result.failure({status:"FAILED",errors:["Reentrada indisponível."]});const result=this.operationCoordinator.engine.reenter(operation,moduleId);return this.toResult(result,{action:operation.action});}
    toResult(value,meta={}){
      if(!Result)return value;
      if(value?.operationId)return value.status==="COMPLETED"?Result.success(value.result,{operationId:value.operationId,productionId:value.parentProductionId,moduleId:value.currentModuleId,action:value.action,meta}):Result.failure(value.result?.reason||value.result?.stage||"Operação não concluída.",{status:value.status||"FAILED",operationId:value.operationId,productionId:value.parentProductionId,moduleId:value.failedModule,action:value.action,reentry:value.status==="FAILED"||value.status==="WAITING",meta});
      if(value?.productionId){const diagnostics={...meta,executionResults:value.result?.results||value.results||[],operationPlan:(value.operationPlan||[]).map(op=>({operationId:op.operationId,action:op.action,status:op.status,destinationId:op.destinationId,service:op.service}))};return value.status==="COMPLETED"?Result.success(value.result,{productionId:value.productionId,meta:diagnostics}):Result.failure(value.result?.reason||"Produção não concluída.",{status:value.status||"FAILED",productionId:value.productionId,reentry:value.status==="PARTIAL"||value.status==="FAILED",meta:diagnostics});}
      return value;
    }
    getStatus(){return{status:"READY",defaultEnvironment:this.defaultEnvironment,hasOperationCoordinator:!!this.operationCoordinator,hasProductionEngine:!!this.productionEngine,hasContentDecisionEngine:!!this.contentDecisionEngine};}
  }
  const target=(typeof globalThis!=="undefined"?globalThis:typeof window!=="undefined"?window:null);if(target)target.WordDarkOperationCenter=WordDarkOperationCenter;
  return WordDarkOperationCenter;
});