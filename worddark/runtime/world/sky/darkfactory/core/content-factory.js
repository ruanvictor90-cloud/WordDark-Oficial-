const DefaultContentOperation = typeof module === "object" && module.exports ? require("./content-operation").ContentOperation : null;
/* Dark Factory content factory — modular execution with true reentry */
class ContentFactory{
 constructor(o={}){this.executor=o.executor||null;this.moduleRegistry=o.moduleRegistry||null;this.contentOperationClass=o.contentOperationClass||DefaultContentOperation||(typeof globalThis!=="undefined"?globalThis.ContentOperation:null);this.operations=new Map();this.status="ONLINE";}
 receive(r){
  const p=r?.payload||r||{};const params=p.parameters||r?.parameters||{};const ContentOperationClass=this.contentOperationClass;
  if(typeof ContentOperationClass!=="function")return{success:false,status:"FAILED",reason:"Content Operation contract not configured."};
  const taskText=String(r?.task||p.task||params.task||"");
  const explicitAction=String(r?.action||p.action||params.action||"").toUpperCase();
  let requestedAction=explicitAction||"CONTENT_CREATE";
  if((!explicitAction||requestedAction==="CONTENT_CREATE"||requestedAction==="CREATE_CONTENT")&&/traduz|translation|translate/i.test(taskText))requestedAction="TRANSLATE_CONTENT";
  else if((!explicitAction||requestedAction==="CONTENT_CREATE"||requestedAction==="CREATE_CONTENT")&&/dubl|doblag|voice.?over|narração|narracao/i.test(taskText))requestedAction="DUB_CONTENT";
  else if((!explicitAction||requestedAction==="CONTENT_CREATE"||requestedAction==="CREATE_CONTENT")&&/legenda|legendar|subtítulo|subtitulo|caption/i.test(taskText))requestedAction="ADD_SUBTITLE";
  const targetFromTask=taskText.match(/\b(?:para|em)\s+(ingl[eê]s|espanhol|portugu[eê]s|franc[eê]s|alem[aã]o|italiano|japon[eê]s)\b/i)?.[1]?.toLowerCase();
  const languageCodes={"inglês":"en","inglês":"en","inglés":"en","ingles":"en","espanhol":"es","português":"pt-BR","portugues":"pt-BR","francês":"fr","frances":"fr","alemão":"de","alemao":"de","italiano":"it","japonês":"ja","japones":"ja"};
  const inferredTarget=targetFromTask?languageCodes[targetFromTask]||null:null;
  const actionMap={CREATE_CONTENT:"CONTENT_CREATE",TRANSLATE_CONTENT:"CONTENT_TRANSFORM",DUB_CONTENT:"CONTENT_TRANSFORM",ADD_SUBTITLE:"CONTENT_TRANSFORM",EDIT_CONTENT:"CONTENT_EDIT",EDIT_PHOTO:"CONTENT_EDIT",CUT_VIDEO:"CONTENT_EDIT",REPLACE_AUDIO:"CONTENT_EDIT",RENDER_CONTENT:"CONTENT_RENDER",TRANSFORM_CONTENT:"CONTENT_TRANSFORM",VALIDATE_CONTENT:"CONTENT_VALIDATE",PACKAGE_CONTENT:"CONTENT_PACKAGE"};
  const op=new ContentOperationClass({
    operationId:r?.operationId||r?.id||p.operationId||p.requestId||null,parentOperationId:r?.parentOperationId||p.parentOperationId||r?.operationId||r?.id||p.operationId||p.requestId||null,
    requestId:r?.id||r?.requestId||p.requestId,action:actionMap[requestedAction]||requestedAction,
    contentId:r?.contentId||p.contentId||params.contentId,contentType:r?.contentType||p.type||params.type||"MIXED",
    input:r?.input||p.input||params.input||null,requirements:{...(r?.requirements||p.requirements||params.requirements||{}),requestedAction,sourceLanguage:r?.sourceLanguage||p.sourceLanguage||params.sourceLanguage||r?.options?.sourceLanguage||p.options?.sourceLanguage||null,targetLanguage:r?.targetLanguage||p.targetLanguage||params.targetLanguage||r?.options?.targetLanguage||p.options?.targetLanguage||inferredTarget||null,subtitleFormat:r?.subtitleFormat||p.subtitleFormat||params.subtitleFormat||"srt",translated:Boolean(r?.translated||p.translated||params.translated||/traduz/i.test(taskText)),segments:r?.segments||p.segments||params.segments||null,transcript:r?.transcript||p.transcript||params.transcript||null,text:r?.text||p.text||params.text||null,voice:r?.voice||p.voice||params.voice||null,dubbing:Boolean(requestedAction==="DUB_CONTENT"||r?.dubbing||p.dubbing||params.dubbing||/dubl|doblag|voice.?over/i.test(taskText)),subtitles:Boolean(requestedAction==="ADD_SUBTITLE"||r?.subtitles||p.subtitles||params.subtitles||/legenda|subtítulo|subtitulo|caption/i.test(taskText))},
    options:{...(r?.options||p.options||{}),title:r?.title||p.title||params.title||null,
      destination:r?.destination||p.destination||params.destination||null,clientId:r?.clientId||p.clientId||params.clientId||null,
      network:r?.network||p.network||params.network||null,accountId:r?.accountId||p.accountId||params.accountId||null}
  });
  const v=op.validate();if(!v.valid)return{success:false,status:"REJECTED",errors:v.errors};
  this.operations.set(op.operationId,op);return this.plan(op);
 }
 plan(op){op.status="PLANNED";return{success:true,status:"PLANNED",operationId:op.operationId,contentId:op.contentId,action:op.action,contentType:op.contentType,modules:this.resolveModules(op),reentry:{enabled:true,failedModuleOnly:true}};}
 resolveModules(op){const m={CONTENT_CREATE:["SCRIPT","ASSET","EDIT","AUDIO","RENDER","VALIDATE"],CONTENT_EDIT:["INGEST","EDIT","AUDIO","RENDER","VALIDATE"],CONTENT_ASSEMBLE:["ASSET","TIMELINE","AUDIO","RENDER","VALIDATE"],CONTENT_RENDER:["RENDER","VALIDATE"],CONTENT_TRANSFORM:["INGEST","TRANSFORM","RENDER","VALIDATE"],CONTENT_VALIDATE:["VALIDATE"],ASSET_PREPARE:["INGEST","ASSET","VALIDATE"],CONTENT_PACKAGE:["VALIDATE","PACKAGE"]};const base=[...(m[op.action]||["VALIDATE"])];const req=op.requirements||{};const requested=String(req.requestedAction||"").toUpperCase();const extras=[];if(requested==="TRANSLATE_CONTENT")extras.push("TRANSLATE");if(requested==="ADD_SUBTITLE"||req.subtitles)extras.push("SUBTITLE");if(requested==="DUB_CONTENT"||req.dubbing)extras.push("DUBBING");if(extras.length){const input=op.input||{};const hasTranscript=Boolean(req.text||req.transcript||req.segments||req.transcriptSegments||input.text||input.transcript||input.segments||input.transcriptSegments);const sequence=["INGEST"];if(!hasTranscript)sequence.push("TRANSCRIBE");if(extras.includes("TRANSLATE"))sequence.push("TRANSLATE");if(extras.includes("SUBTITLE"))sequence.push("SUBTITLE");if(extras.includes("DUBBING"))sequence.push("DUBBING");sequence.push("TRANSFORM","RENDER","VALIDATE");return [...new Set(sequence)];}return base;}
 execute(id,{startModule=null}={}){
  const op=this.operations.get(id);if(!op)return{success:false,status:"NOT_FOUND"};
  const modules=this.resolveModules(op);
  let start=Number.isInteger(op.reentryIndex)?op.reentryIndex:0;
  if(startModule){const requestedIndex=modules.indexOf(startModule);if(requestedIndex<0)return{success:false,status:"MODULE_NOT_FOUND",operationId:id,moduleId:startModule};start=requestedIndex;}
  if(start<0)start=0;
  op.status="EXECUTING";
  const results=Array.isArray(op.completedModules)?op.completedModules.map(x=>({...x,reused:true})):[];
  const fail=(moduleId,result)=>{op.status="FAILED";op.failedModule=moduleId;op.reentryIndex=modules.indexOf(moduleId);op.completedModules=results;return{success:false,status:"FAILED",operationId:id,failedModule:moduleId,reason:result?.reason||result?.message||result?.errors?.join?.("; ")||"Módulo de produção falhou.",modules:results,reentry:{enabled:true,failedModuleOnly:true,moduleId}};};
  const finish=final=>{
    op.status=final?.success===false?"FAILED":"COMPLETED";
    return{...final,operationId:id,status:op.status,modules:results,reentry:{enabled:true,failedModuleOnly:true}};
  };
  const finalizeResult=(result,moduleId,index)=>{
    if(result?.success===false)return fail(moduleId,result);
    results.push({module:moduleId,...(result&&typeof result==="object"?result:{result})});
    op.completedModules=results;
    return runModule(index+1);
  };
  const runModule=index=>{
    if(index>=modules.length){
      const request={id:op.requestId,payload:{contentId:op.contentId,title:op.options?.title||op.contentId,type:op.contentType,requirements:op.requirements,input:op.input,destination:op.options?.destination||null,clientId:op.options?.clientId||null,network:op.options?.network||null,accountId:op.options?.accountId||null}};
      let final;
      try{final=this.executor?.execute?this.executor.execute(request):{success:true,status:"PRODUCTION_COMPLETED"};}catch(error){return fail(op.currentModuleId||"EXECUTOR",{reason:error.message});}
      return final&&typeof final.then==="function"?final.then(finish).catch(error=>fail(op.currentModuleId||"EXECUTOR",{reason:error.message})):finish(final);
    }
    const moduleId=modules[index];op.currentModuleId=moduleId;
    let result;
    try{result=this.moduleRegistry?this.moduleRegistry.execute(moduleId,{operation:op.toJSON(),previous:results,reentry:start>0}):this.executor?.executeModule?this.executor.executeModule(moduleId,op.toJSON(),results):{success:true,status:"MODULE_READY",module:moduleId};}
    catch(error){return fail(moduleId,{reason:error.message});}
    return result&&typeof result.then==="function"?result.then(value=>finalizeResult(value,moduleId,index)).catch(error=>fail(moduleId,{reason:error.message})):finalizeResult(result,moduleId,index);
  };
  return runModule(start);
 }
 reenter(id,moduleId,patch={}){const op=this.operations.get(id);if(!op)return{success:false,status:"NOT_FOUND"};const modules=this.resolveModules(op);const index=modules.indexOf(moduleId);if(index<0)return{success:false,status:"MODULE_NOT_FOUND",moduleId};Object.assign(op,patch);op.reentryIndex=index;op.failedModule=moduleId;op.currentModuleId=moduleId;op.status="REENTRY";return{success:true,status:"REENTRY_READY",operationId:id,moduleId,reentryIndex:index,skippedModules:modules.slice(0,index)};}
 async executeFromModule(id,moduleId){return this.execute(id,{startModule:moduleId});}
 reenterFromModule(id,moduleId,patch={}){return this.reenter(id,moduleId,patch);}
 get(id){const op=this.operations.get(id);return op?op.toJSON():null;}list(){return[...this.operations.values()].map(op=>op.toJSON());}
}
if(typeof window!=="undefined")window.ContentFactory=ContentFactory;if(typeof module!=="undefined"&&module.exports)module.exports=ContentFactory;