const DefaultContentOperation = typeof module === "object" && module.exports ? require("./content-operation").ContentOperation : null;
/* Dark Factory content factory — modular execution with true reentry */
class ContentFactory{
 constructor(o={}){this.executor=o.executor||null;this.moduleRegistry=o.moduleRegistry||null;this.contentOperationClass=o.contentOperationClass||DefaultContentOperation||(typeof globalThis!=="undefined"?globalThis.ContentOperation:null);this.operations=new Map();this.status="ONLINE";}
 receive(r){
  const p=r?.payload||r||{};const ContentOperationClass=this.contentOperationClass;
  if(typeof ContentOperationClass!=="function")return{success:false,status:"FAILED",reason:"Content Operation contract not configured."};
  const op=new ContentOperationClass({
    operationId:r?.operationId||p.operationId||null,parentOperationId:r?.parentOperationId||p.parentOperationId||r?.operationId||p.operationId||null,
    requestId:r?.id||r?.requestId||p.requestId,action:r?.action||p.action||"CONTENT_CREATE",
    contentId:r?.contentId||p.contentId,contentType:r?.contentType||p.type||"MIXED",input:r?.input||p.input||null,
    requirements:r?.requirements||p.requirements||{},
    options:{...(r?.options||p.options||{}),title:r?.title||p.title||p.parameters?.title||null,
      destination:r?.destination||p.destination||p.parameters?.destination||null,clientId:r?.clientId||p.clientId||p.parameters?.clientId||null}
  });
  const v=op.validate();if(!v.valid)return{success:false,status:"REJECTED",errors:v.errors};
  this.operations.set(op.operationId,op);return this.plan(op);
 }
 plan(op){op.status="PLANNED";return{success:true,status:"PLANNED",operationId:op.operationId,contentId:op.contentId,action:op.action,contentType:op.contentType,modules:this.resolveModules(op),reentry:{enabled:true,failedModuleOnly:true}};}
 resolveModules(op){const m={CONTENT_CREATE:["SCRIPT","ASSET","EDIT","AUDIO","RENDER","VALIDATE"],CONTENT_EDIT:["INGEST","EDIT","AUDIO","RENDER","VALIDATE"],CONTENT_ASSEMBLE:["ASSET","TIMELINE","AUDIO","RENDER","VALIDATE"],CONTENT_RENDER:["RENDER","VALIDATE"],CONTENT_TRANSFORM:["INGEST","TRANSFORM","RENDER","VALIDATE"],CONTENT_VALIDATE:["VALIDATE"],ASSET_PREPARE:["INGEST","ASSET","VALIDATE"],CONTENT_PACKAGE:["VALIDATE","PACKAGE"]};return m[op.action]||["VALIDATE"];}
 execute(id,{startModule=null}={}){const op=this.operations.get(id);if(!op)return{success:false,status:"NOT_FOUND"};const modules=this.resolveModules(op);let start=Number.isInteger(op.reentryIndex)?op.reentryIndex:0;if(startModule){const requestedIndex=modules.indexOf(startModule);if(requestedIndex<0)return{success:false,status:"MODULE_NOT_FOUND",operationId:id,moduleId:startModule};start=requestedIndex;}if(start<0)start=0;op.status="EXECUTING";const results=Array.isArray(op.completedModules)?op.completedModules.map(x=>({...x,reused:true})):[];for(let i=start;i<modules.length;i++){const moduleId=modules[i];op.currentModuleId=moduleId;let result;if(this.moduleRegistry)result=this.moduleRegistry.execute(moduleId,{operation:op.toJSON(),previous:results});else if(this.executor?.executeModule)result=this.executor.executeModule(moduleId,op.toJSON(),results);else result={success:true,status:"MODULE_READY",module:moduleId};if(result?.success===false){op.status="FAILED";op.failedModule=moduleId;op.reentryIndex=i;op.completedModules=results;return{success:false,status:"FAILED",operationId:id,failedModule:moduleId,modules:results,reentry:{enabled:true,failedModuleOnly:true,moduleId}};}results.push({module:moduleId,...result});op.completedModules=results;}
  const final=this.executor?.execute?this.executor.execute({id:op.requestId,payload:{contentId:op.contentId,title:op.options?.title||op.contentId,type:op.contentType,requirements:op.requirements,destination:op.options?.destination||null,clientId:op.options?.clientId||null}}):{success:true,status:"PRODUCTION_COMPLETED"};
  op.status=final?.success===false?"FAILED":"COMPLETED";return{...final,operationId:id,status:op.status,modules:results,reentry:{enabled:true,failedModuleOnly:true}};
 }
 reenter(id,moduleId,patch={}){const op=this.operations.get(id);if(!op)return{success:false,status:"NOT_FOUND"};const modules=this.resolveModules(op);const index=modules.indexOf(moduleId);if(index<0)return{success:false,status:"MODULE_NOT_FOUND",moduleId};Object.assign(op,patch);op.reentryIndex=index;op.failedModule=moduleId;op.currentModuleId=moduleId;op.status="REENTRY";return{success:true,status:"REENTRY_READY",operationId:id,moduleId,reentryIndex:index,skippedModules:modules.slice(0,index)};}
 async executeFromModule(id,moduleId){return this.execute(id,{startModule:moduleId});}
 reenterFromModule(id,moduleId,patch={}){return this.reenter(id,moduleId,patch);}
 get(id){const op=this.operations.get(id);return op?op.toJSON():null;}list(){return[...this.operations.values()].map(op=>op.toJSON());}
}
if(typeof window!=="undefined")window.ContentFactory=ContentFactory;if(typeof module!=="undefined"&&module.exports)module.exports=ContentFactory;