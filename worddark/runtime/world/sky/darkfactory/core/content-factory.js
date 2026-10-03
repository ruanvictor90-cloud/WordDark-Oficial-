/* Dark Factory content factory · modular execution */
class ContentFactory{
  constructor(o={}){this.executor=o.executor||null;this.moduleRegistry=o.moduleRegistry||null;this.operations=new Map();this.status="ONLINE";}
  receive(r){const p=r?.payload||r||{};const op=new ContentOperation({requestId:r?.id||r?.requestId||p.requestId,action:r?.action||p.action||"CONTENT_CREATE",contentId:r?.contentId||p.contentId,contentType:r?.contentType||p.type||"MIXED",input:r?.input||p.input||null,requirements:r?.requirements||p.requirements||{},options:{...(r?.options||p.options||{}),destination:r?.destination||p.destination||p.payload?.destination||null}});const v=op.validate();if(!v.valid)return{success:false,status:"REJECTED",errors:v.errors};this.operations.set(op.operationId,op);return this.plan(op);}
  plan(op){op.status="PLANNED";return{success:true,status:"PLANNED",operationId:op.operationId,contentId:op.contentId,action:op.action,contentType:op.contentType,modules:this.resolveModules(op),reentry:{enabled:true,failedModuleOnly:true}};}
  resolveModules(op){const m={CONTENT_CREATE:["SCRIPT","ASSET","EDIT","AUDIO","RENDER","VALIDATE"],CONTENT_EDIT:["INGEST","EDIT","AUDIO","RENDER","VALIDATE"],CONTENT_ASSEMBLE:["ASSET","TIMELINE","AUDIO","RENDER","VALIDATE"],CONTENT_RENDER:["RENDER","VALIDATE"],CONTENT_TRANSFORM:["INGEST","TRANSFORM","RENDER","VALIDATE"],CONTENT_VALIDATE:["VALIDATE"],ASSET_PREPARE:["INGEST","ASSET","VALIDATE"],CONTENT_PACKAGE:["VALIDATE","PACKAGE"]};return m[op.action]||["VALIDATE"];}
  async execute(id){const op=this.operations.get(id);if(!op)return{success:false,status:"NOT_FOUND"};op.status="EXECUTING";
    const modules=this.resolveModules(op), results=[];let start=0;
    for(let i=0;i<modules.length;i++){const moduleId=modules[i];let result;
      if(this.moduleRegistry) result=await this.moduleRegistry.execute(moduleId,{operation:op.toJSON(),previous:results});
      else if(this.executor?.executeModule) result=await this.executor.executeModule(moduleId,op.toJSON(),results);
      else result={success:true,status:"MODULE_READY",module:moduleId};
      results.push({module:moduleId,...result});
      if(result?.success===false){op.status="FAILED";op.failedModule=moduleId;return{success:false,status:"FAILED",operationId:id,failedModule:moduleId,modules:results,reentry:{enabled:true,failedModuleOnly:true}};}
    }
    const final=this.executor?.execute?await this.executor.execute({id:op.requestId,payload:{contentId:op.contentId,title:op.options?.title||op.contentId,type:op.contentType,requirements:op.requirements,destination:op.options?.destination||null}}):{success:true,status:"PRODUCTION_COMPLETED"};
    op.status=final?.success===false?"FAILED":"COMPLETED";
    return{...final,operationId:id,status:op.status,modules:results,reentry:{enabled:true,failedModuleOnly:true}};
  }
  reenter(id,patch={}){const op=this.operations.get(id);if(!op)return{success:false,status:"NOT_FOUND"};Object.assign(op,patch);op.status="PENDING";delete op.failedModule;return this.plan(op);}
  get(id){const op=this.operations.get(id);return op?op.toJSON():null;}
  list(){return [...this.operations.values()].map(op=>op.toJSON());}
}
if(typeof window!=="undefined")window.ContentFactory=ContentFactory;if(typeof module!=="undefined"&&module.exports)module.exports=ContentFactory;