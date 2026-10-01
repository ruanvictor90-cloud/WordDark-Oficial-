import { id } from "../../worddark/core-central/id.js";
export class DarkFactory {
  constructor(){this.id="DARK-FACTORY";this.layer="CEU";this.executors=new Map();this.logs=[];}
  registerExecutor({id:executorId,name,handler,metadata={}}){if(!executorId||typeof handler!=="function")throw new Error("INVALID_EXECUTOR");this.executors.set(executorId,{id:executorId,name:name||executorId,handler,metadata});return this.executors.get(executorId);}
  handle(operation){const task=operation.payload?.taskType||operation.service;const executor=[...this.executors.values()].find(x=>x.id===task||x.name===task);if(!executor)return {success:false,reason:"EXECUTOR_NOT_FOUND",task};const result=executor.handler(operation);this.logs.push({id:id("DFLOG"),operationId:operation.id,executor:executor.id,result,at:new Date().toISOString()});return result?.success?result:{success:false,reason:result?.reason||"EXECUTOR_FAILED"};}
  status(){return {id:this.id,layer:this.layer,executors:[...this.executors.keys()],logs:this.logs.length};}
}
