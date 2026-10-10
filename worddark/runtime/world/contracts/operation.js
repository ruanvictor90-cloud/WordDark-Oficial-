/* WordDark — Global Operation Contract
 * OPERATION = uma única função executável.
 * service = nome universal de transporte/execução; operationType = ação funcional.
 */
class WordDarkOperation {
  constructor(source={}) {
    this.operationId=source.operationId||null;this.requesterId=source.requesterId||null;
    this.originId=source.originId||null;this.destinationId=source.destinationId||null;
    this.operationType=source.operationType||source.action||null;this.action=source.action||this.operationType||null;this.service=source.service||null;
    this.capability=source.capability||null;this.intent=source.intent||null;this.need=source.need||null;
    this.environment=source.environment||"TEST";this.status=source.status||"CREATED";
    this.parentOperationId=source.parentOperationId||null;this.parentProductionId=source.parentProductionId||null;
    this.context=source.context||{};this.originSectorId=source.originSectorId||source.originId||null;this.executionSectorId=source.executionSectorId||source.destinationId||null;this.detailLibraryId=source.detailLibraryId||null;this.resourceId=source.resourceId||null;this.clientId=source.clientId||null;
    this.currentModuleId=source.currentModuleId||null;this.failedModule=source.failedModule||null;
    this.payload=source.payload||{};this.result=source.result||null;
    this.createdAt=source.createdAt||new Date().toISOString();this.updatedAt=source.updatedAt||this.createdAt;
  }
  static get TYPE(){return"OPERATION";}
  static get STATUSES(){return["CREATED","IDENTIFIED","AUTHORIZED","RECEIVED","ROUTED","EXECUTING","WAITING","REENTRY","VALIDATING","COMPLETED","REJECTED","BLOCKED","FAILED","CANCELLED"];}
  static get ENVIRONMENTS(){return["TEST","PROD"];}
  static get TERMINAL_STATUSES(){return["COMPLETED","REJECTED","BLOCKED","CANCELLED"];}
  static get TRANSITIONS(){return{CREATED:["IDENTIFIED","REJECTED","BLOCKED","CANCELLED"],IDENTIFIED:["AUTHORIZED","REJECTED","BLOCKED","CANCELLED"],AUTHORIZED:["RECEIVED","REJECTED","BLOCKED","CANCELLED"],RECEIVED:["ROUTED","REJECTED","BLOCKED","CANCELLED"],ROUTED:["EXECUTING","REJECTED","BLOCKED","FAILED","CANCELLED"],EXECUTING:["WAITING","VALIDATING","FAILED","BLOCKED","CANCELLED"],WAITING:["REENTRY","CANCELLED"],REENTRY:["EXECUTING","WAITING","FAILED","CANCELLED"],VALIDATING:["COMPLETED","FAILED","BLOCKED","CANCELLED"],COMPLETED:[],REJECTED:[],BLOCKED:[],FAILED:["REENTRY","CANCELLED"],CANCELLED:[]};}
  validate(){const errors=[];if(!this.operationId)errors.push("operationId é obrigatório.");if(!this.requesterId)errors.push("requesterId é obrigatório.");if(!this.originId)errors.push("originId é obrigatório.");if(!this.operationType)errors.push("operationType é obrigatório.");if(!WordDarkOperation.ENVIRONMENTS.includes(this.environment))errors.push("environment deve ser TEST ou PROD.");if(!WordDarkOperation.STATUSES.includes(this.status))errors.push("status de operação inválido.");return{valid:errors.length===0,errors};}
  canTransitionTo(status){return WordDarkOperation.STATUSES.includes(status)&&WordDarkOperation.TRANSITIONS[this.status].includes(status);}
  transition(status,result=null){if(!this.canTransitionTo(status))throw new Error("Transição de operação não permitida: "+this.status+" -> "+status);this.status=status;this.result=result;this.updatedAt=new Date().toISOString();return this;}
  toJSON(){return{type:WordDarkOperation.TYPE,operationId:this.operationId,requesterId:this.requesterId,originId:this.originId,destinationId:this.destinationId,operationType:this.operationType,action:this.action,service:this.service,capability:this.capability,intent:this.intent,need:this.need,environment:this.environment,status:this.status,parentOperationId:this.parentOperationId,parentProductionId:this.parentProductionId,context:this.context,originSectorId:this.originSectorId,executionSectorId:this.executionSectorId,detailLibraryId:this.detailLibraryId,resourceId:this.resourceId,clientId:this.clientId,currentModuleId:this.currentModuleId,failedModule:this.failedModule,payload:this.payload,result:this.result,createdAt:this.createdAt,updatedAt:this.updatedAt};}
}
if(typeof module!=="undefined")module.exports=WordDarkOperation;
if(typeof window!=="undefined")window.WordDarkOperation=WordDarkOperation;