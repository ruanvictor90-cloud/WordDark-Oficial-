import { id } from "./id.js";

export class OperationPipeline {
  constructor(runtime){this.runtime=runtime;}
  run(operation,{fromIndex=0}={}){
    const modules=operation.pipeline?.modules||[];
    if(!modules.length){
      return this.runtime.request(operation);
    }
    for(let i=fromIndex;i<modules.length;i++){
      const moduleId=modules[i];
      const result=this.runtime.executeModule(operation,moduleId,{pipelineIndex:i});
      if(!result?.success){
        operation.pipeline.currentIndex=i;
        operation.pipeline.failedModule=moduleId;
        operation.pipeline.status="FAILED";
        return operation.transition("FAILED",{moduleId,index:i,result});
      }
      operation.checkpoint(moduleId,"PASSED",result);
      operation.pipeline.currentIndex=i+1;
    }
    operation.pipeline.failedModule=null;
    operation.pipeline.status="COMPLETED";
    return operation.transition("COMPLETED",{pipeline:"COMPLETED"});
  }
  reenter(operation,moduleId,reason="MODULE_REENTRY"){
    const modules=operation.pipeline?.modules||[];
    const index=modules.indexOf(moduleId);
    if(index<0) throw new Error("MODULE_NOT_IN_PIPELINE");
    operation.reenter(moduleId,reason);
    const result=this.runtime.executeModule(operation,moduleId,{reentry:true,pipelineIndex:index});
    if(!result?.success){
      operation.checkpoint(moduleId,"FAILED",result);
      operation.pipeline.failedModule=moduleId;
      operation.pipeline.status="FAILED";
      return operation.transition("FAILED",{moduleId,result,reentry:true});
    }
    operation.checkpoint(moduleId,"PASSED",result);
    operation.pipeline.failedModule=null;
    operation.pipeline.status="RUNNING";
    return this.run(operation,{fromIndex:index+1});
  }
}

export function createPipeline(modules=[]){
  return {id:id("PIPE"),modules:[...new Set(modules)],currentIndex:0,failedModule:null,status:"PENDING"};
}
