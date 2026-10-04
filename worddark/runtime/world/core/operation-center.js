/* WordDark — Central de Operações v0.1
 * Único ponto público para transformar intenção em operação/produção.
 * Registries, planner, router e connectors permanecem internos.
 */
(function(root,factory){
  if(typeof module==="object"&&module.exports)module.exports=factory(require("./universal-language"),require("../contracts/operation"),require("../contracts/production"),require("../contracts/result"));
  else{const r=root||(typeof window!=="undefined"?window:globalThis);r.WordDarkOperationCenter=factory(r.WordDarkUniversalLanguage,r.WordDarkOperation,r.WordDarkProduction,r.WordDarkResult);}
})(typeof globalThis!=="undefined"?globalThis:window,function(Language,Operation,Production,Result){
  class WordDarkOperationCenter{
    constructor({operationCoordinator=null,productionEngine=null,planner=null,requesterId="WD-SYSTEM",defaultOrigin="world",defaultEnvironment="TEST"}={}){this.operationCoordinator=operationCoordinator;this.productionEngine=productionEngine;this.planner=planner;this.requesterId=requesterId;this.defaultOrigin=defaultOrigin;this.defaultEnvironment=defaultEnvironment;}
    normalize(input={}){return Language.parse(input);}
    submit(input={}){
      const parsed=this.normalize(input);const env=input.environment||parsed.options?.environment||this.defaultEnvironment;
      if(parsed.type==="OPERATION"){
        const operation=new Operation({operationId:input.operationId,requesterId:input.requesterId||this.requesterId,originId:input.originId||this.defaultOrigin,destinationId:parsed.destinationId,operationType:parsed.action,action:parsed.action,environment:env,resourceId:parsed.resourceId,clientId:parsed.clientId,context:parsed.context,payload:parsed.parameters||{},intent:input.intent,need:input.need});
        const result=this.operationCoordinator?.submit?.(operation);
        return this.toResult(result,{action:parsed.action,environment:env});
      }
      if(!this.productionEngine)return Result.failure({status:"FAILED",errors:["Production Engine não configurado."]});
      const production=this.productionEngine.create({productionId:input.productionId,requesterId:input.requesterId||this.requesterId,originId:input.originId||this.defaultOrigin,clientId:parsed.clientId,goal:parsed.goal,resourceId:parsed.resourceId,destinationId:parsed.destinationId,quantity:parsed.quantity||input.quantity||1,requirements:parsed.requirements,context:parsed.context,options:{...parsed.options,environment:env}});
      const planned=this.productionEngine.plan(production,input.operations||[]);
      const executed=this.productionEngine.execute(planned);
      return this.toResult(executed,{productionId:executed.productionId,environment:env});
    }
    reenter(operation,moduleId){if(!operation||!this.operationCoordinator?.engine?.reenter)return Result.failure({status:"FAILED",errors:["Reentrada indisponível."]});const result=this.operationCoordinator.engine.reenter(operation,moduleId);return this.toResult(result,{action:operation.action});}
    toResult(value,meta={}){
      if(!Result)return value;
      if(value?.operationId)return value.status==="COMPLETED"?Result.success({operationId:value.operationId,productionId:value.parentProductionId,moduleId:value.currentModuleId,action:value.action,output:value.result,meta}):Result.failure({status:value.status||"FAILED",operationId:value.operationId,productionId:value.parentProductionId,moduleId:value.failedModule,action:value.action,errors:[value.result?.reason||value.result?.stage||"Operação não concluída."],reentry:value.status==="FAILED"||value.status==="WAITING",meta});
      if(value?.productionId)return value.status==="COMPLETED"?Result.success({productionId:value.productionId,output:value.result,meta}):Result.failure({status:value.status||"FAILED",productionId:value.productionId,errors:[value.result?.reason||"Produção não concluída."],reentry:value.status==="PARTIAL"||value.status==="FAILED",meta});
      return value;
    }
    getStatus(){return{status:"READY",defaultEnvironment:this.defaultEnvironment,hasOperationCoordinator:!!this.operationCoordinator,hasProductionEngine:!!this.productionEngine};}
  }
  if(typeof root!=="undefined")root.WordDarkOperationCenter=WordDarkOperationCenter;
  return WordDarkOperationCenter;
});