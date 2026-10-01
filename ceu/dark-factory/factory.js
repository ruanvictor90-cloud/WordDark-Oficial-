import { id } from "../../worddark/core-central/id.js";
export class DarkFactory {
 constructor(){this.id="DARK-FACTORY";this.layer="CEU";this.executors=null;this.logs=[];}
 attachExecutors(executors){if(!executors||typeof executors.execute!=="function")throw new Error("EXECUTOR_REGISTRY_INVALID");this.executors=executors;return executors;}
 handle(operation){
  const task=operation.payload?.taskType||operation.service;
  if(!this.executors)return {success:false,reason:"EXECUTOR_REGISTRY_NOT_CONFIGURED"};
  const result=this.executors.execute(task,operation,{factory:this});
  this.logs.push({id:id("DFLOG"),operationId:operation.id,executor:task,result,at:new Date().toISOString()});
  return result?.success?result:{success:false,reason:result?.reason||"EXECUTOR_FAILED"};
 }
 status(){return {id:this.id,layer:this.layer,executors:this.executors?.list?.()||[],logs:this.logs.length};}
}