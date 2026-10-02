import { id } from "../../worddark/core-central/id.js";
import { SkyDomain } from "../core/sky-structure.js";

export const FACTORY_STAGE = Object.freeze({
  BRIEF:"BRIEF", SCRIPT:"SCRIPT", ASSETS:"ASSETS", EDIT:"EDIT",
  AUDIO:"AUDIO", ASSEMBLY:"ASSEMBLY", QUALITY:"QUALITY", EXPORT:"EXPORT"
});

export class LocalContentStudio {
  constructor({audit=null}={}) { this.id="FACTORY-CONTENT-STUDIO"; this.audit=audit; this.projects=new Map();this.learningSignals=[]; }
  createProject({projectId=id("CONTENT-PROJECT"),operationId,brief={},format="VIDEO"}={}) {
    const project={id:projectId,operationId,format,brief:structuredClone(brief),stage:FACTORY_STAGE.BRIEF,
      assets:[],timeline:[],audio:[],versions:[],quality:[],status:"EDITING",createdAt:new Date().toISOString()};
    this.projects.set(project.id,project); return structuredClone(project);
  }
  addAsset(projectId,asset){const p=this.projects.get(projectId);if(!p)throw new Error("FACTORY_PROJECT_NOT_FOUND");p.assets.push(structuredClone(asset));p.stage=FACTORY_STAGE.ASSETS;return structuredClone(p);}
  addTimelineItem(projectId,item){const p=this.projects.get(projectId);if(!p)throw new Error("FACTORY_PROJECT_NOT_FOUND");p.timeline.push(structuredClone(item));p.stage=FACTORY_STAGE.EDIT;return structuredClone(p);}
  addAudio(projectId,audio){const p=this.projects.get(projectId);if(!p)throw new Error("FACTORY_PROJECT_NOT_FOUND");p.audio.push(structuredClone(audio));p.stage=FACTORY_STAGE.AUDIO;return structuredClone(p);}
  addVersion(projectId,version){const p=this.projects.get(projectId);if(!p)throw new Error("FACTORY_PROJECT_NOT_FOUND");p.versions.push(structuredClone(version));return structuredClone(p);}
  evaluateQuality(projectId,{passed=true,checks=[],reason=null}={}){const p=this.projects.get(projectId);if(!p)throw new Error("FACTORY_PROJECT_NOT_FOUND");const q={passed,checks:structuredClone(checks),reason,at:new Date().toISOString()};p.quality.push(q);p.stage=passed?FACTORY_STAGE.EXPORT:FACTORY_STAGE.QUALITY;p.status=passed?"READY":"NEEDS_REVIEW";return structuredClone(q);}
  get(projectId){return structuredClone(this.projects.get(projectId)||null);}
  list(){return [...this.projects.values()].map(structuredClone);}
}

export class DarkFactory extends SkyDomain {
 constructor({audit=null}={}) {
  super({id:"DARK-FACTORY",name:"Dark Factory",owner:"WORDDARK"});
  this.layer="CEU"; this.executors=null; this.logs=[]; this.audit=audit;
  this.studio=new LocalContentStudio({audit}); this.buildStructure();
 }
 buildStructure(){
  this.regions.clear();
  this.production=this.createRegion({id:"DF-PRODUCTION",name:"Produção Audiovisual"});
  for(const [idValue,name] of [["DF-BRIEF","Briefing"],["DF-SCRIPT","Roteiro"],["DF-VISUAL","Visual"],["DF-EDITOR","Edição"],["DF-AUDIO","Áudio"],["DF-ASSEMBLY","Montagem"],["DF-QUALITY","Qualidade"]]) this.production.createNucleus({id:idValue,name});
  this.image=this.createRegion({id:"DF-IMAGE",name:"Imagem"});
  this.image.createNucleus({id:"DF-IMAGE-EDITOR",name:"Editor de Imagem"});
  this.image.createNucleus({id:"DF-VISUAL-KNOWLEDGE",name:"Conhecimento Visual"});
  this.knowledge=this.createRegion({id:"DF-KNOWLEDGE",name:"Conhecimento"});
  this.knowledge.createNucleus({id:"DF-SEARCH",name:"Busca"});
  this.knowledge.createNucleus({id:"DF-LEARNING",name:"Aprendizado"});
  this.knowledge.createNucleus({id:"DF-VALIDATION",name:"Validação"});
 }
 attachExecutors(executors){if(!executors||typeof executors.execute!=="function")throw new Error("EXECUTOR_REGISTRY_INVALID");this.executors=executors;return executors;}
 attachRuntime(runtime){if(!runtime||typeof runtime.pipeline?.run!=="function")throw new Error("RUNTIME_REQUIRED");this.runtime=runtime;return runtime;}
 handle(operation){
  const requestedTask=String(operation.payload?.taskType||operation.service||"").toUpperCase();
  if(requestedTask==="CONTENT.PRODUCE"||requestedTask==="CONTENT_PRODUCE"){
   if(!this.runtime)return {success:false,reason:"RUNTIME_NOT_ATTACHED"};
   const project=this.studio.createProject({operationId:operation.id,brief:operation.payload?.brief||{title:operation.payload?.content||""},format:operation.payload?.format||"VIDEO"});
   operation.context={...(operation.context||{}),factoryProjectId:project.id,factoryLocal:true};
   operation.pipeline={id:`CONTENT-PRODUCE-${operation.id}`,modules:["IDENTITY","SCRIPT","IMAGE","AUDIO","VIDEO"],currentIndex:0,failedModule:null,status:"PENDING"};
   const result=this.runtime.pipeline.run(operation);
   this.studio.addVersion(project.id,{operationId:operation.id,status:result.status,at:new Date().toISOString()});
   if(result.status==="COMPLETED") this.studio.evaluateQuality(project.id,{passed:true,checks:["PIPELINE_COMPLETED"]});
   this.logs.push({id:id("DFLOG"),operationId:operation.id,projectId:project.id,executor:"CONTENT.PRODUCE",result,at:new Date().toISOString()});
   return result?.status==="COMPLETED"?{success:true,result,projectId:project.id}:{success:false,reason:result?.reason||"PRODUCTION_FAILED",result,projectId:project.id};
  }
  const reviewMode={
    "CONTENT.EDIT":"EDIT",
    "CONTENT_EDIT":"EDIT",
    "CONTENT.RESTRUCTURE":"RESTRUCTURE",
    "CONTENT_RESTRUCTURE":"RESTRUCTURE",
    "CONTENT.REDO":"REDO",
    "CONTENT_REDO":"REDO"
  }[requestedTask];
  if(reviewMode){
    const result=this._runRevision(operation,reviewMode);
    this.logs.push({id:id("DFLOG"),operationId:operation.id,executor:"CONTENT."+reviewMode,result,at:new Date().toISOString()});
    return result;
  }
  const task=requestedTask==="REEL"?"VIDEO":requestedTask;
  if(!this.executors)return {success:false,reason:"EXECUTOR_REGISTRY_NOT_CONFIGURED"};
  const result=this.executors.execute(task,operation,{factory:this});
  this.logs.push({id:id("DFLOG"),operationId:operation.id,executor:task,result,at:new Date().toISOString()});
  return result?.success?result:{success:false,reason:result?.reason||"EXECUTOR_FAILED"};
 }
 status(){return {...super.status(),layer:this.layer,executors:this.executors?.list?.()||[],projects:this.studio.projects.size,learningSignals:this.studio.learningSignals.length,logs:this.logs.length};}
}
