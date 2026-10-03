/* WordDark — Content Reentry Adapter
 * Extensão modular: não substitui a ContentFactory; adiciona retomada parcial.
 */
function installContentReentry(factory){
  if(!factory)return factory;
  factory.reenterFromModule=function(id,moduleId,patch={}){
    const op=this.operations.get(id);
    if(!op)return{success:false,status:"NOT_FOUND"};
    const modules=this.resolveModules(op);
    const key=String(moduleId||"").toUpperCase();
    const index=modules.indexOf(key);
    if(index<0)return{success:false,status:"MODULE_NOT_FOUND",operationId:id,module:key,available:modules};
    Object.assign(op,patch);
    op.status="PENDING";
    op.resumeFrom=key;
    op.resumeIndex=index;
    delete op.failedModule;
    return{success:true,status:"REENTRY_PLANNED",operationId:id,resumeFrom:key,resumeIndex:index,modules:modules.slice(index),reentry:{enabled:true,failedModuleOnly:true}};
  };
  factory.executeFromModule=async function(id,moduleId){
    const op=this.operations.get(id);
    if(!op)return{success:false,status:"NOT_FOUND"};
    const modules=this.resolveModules(op);
    const key=String(moduleId||op.resumeFrom||"").toUpperCase();
    const start=modules.indexOf(key);
    if(start<0)return{success:false,status:"MODULE_NOT_FOUND",operationId:id,module:key,available:modules};
    op.status="EXECUTING";
    const results=[];
    for(let i=start;i<modules.length;i++){
      const moduleId=modules[i];
      const result=this.moduleRegistry
        ? await this.moduleRegistry.execute(moduleId,{operation:op.toJSON(),previous:results,reentry:true})
        : {success:true,status:"MODULE_READY",module:moduleId};
      results.push({module:moduleId,...result});
      if(result?.success===false){
        op.status="FAILED";op.failedModule=moduleId;
        return{success:false,status:"FAILED",operationId:id,failedModule:moduleId,modules:results,reentry:{enabled:true,failedModuleOnly:true}};
      }
    }
    const final=this.executor?.execute
      ? await this.executor.execute({id:op.requestId,payload:{contentId:op.contentId,title:op.options?.title||op.contentId,type:op.contentType,requirements:op.requirements,destination:op.options?.destination||null}})
      : {success:true,status:"PRODUCTION_COMPLETED"};
    op.status=final?.success===false?"FAILED":"COMPLETED";
    delete op.resumeFrom; delete op.resumeIndex;
    return{...final,operationId:id,status:op.status,modules:results,reentry:{enabled:true,failedModuleOnly:true}};
  };
  return factory;
}
if(typeof module!=="undefined")module.exports=installContentReentry;
if(typeof window!=="undefined")window.installContentReentry=installContentReentry;
