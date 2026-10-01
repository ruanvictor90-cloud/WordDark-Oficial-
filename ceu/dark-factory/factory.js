import { id } from "../../worddark/core-central/id.js";
import { SkyDomain } from "../core/sky-structure.js";

export class DarkFactory extends SkyDomain {
 constructor(){
  super({id:"DARK-FACTORY",name:"Dark Factory",owner:"WORDDARK"});
  this.layer="CEU";this.executors=null;this.logs=[];
  this.buildStructure();
 }
 buildStructure(){
  this.regions.clear();
  this.production=this.createRegion({id:"DF-PRODUCTION",name:"Produção Audiovisual"});
  this.production.createNucleus({id:"DF-EDITOR",name:"Editor"});
  this.production.createNucleus({id:"DF-SCRIPT",name:"Roteiro"});
  this.production.createNucleus({id:"DF-MONTAGE",name:"Montagem"});
  this.image=this.createRegion({id:"DF-IMAGE",name:"Imagem"});
  this.image.createNucleus({id:"DF-IMAGE-EDITOR",name:"Editor de Imagem"});
  this.image.createNucleus({id:"DF-VISUAL-KNOWLEDGE",name:"Conhecimento Visual"});
  this.knowledge=this.createRegion({id:"DF-KNOWLEDGE",name:"Conhecimento"});
  this.knowledge.createNucleus({id:"DF-SEARCH",name:"Busca"});
  this.knowledge.createNucleus({id:"DF-LEARNING",name:"Aprendizado"});
  this.knowledge.createNucleus({id:"DF-VALIDATION",name:"Validação"});
 }
 attachExecutors(executors){if(!executors||typeof executors.execute!=="function")throw new Error("EXECUTOR_REGISTRY_INVALID");this.executors=executors;return executors;}
 handle(operation){
  const requestedTask=operation.payload?.taskType||operation.service;
  const task=requestedTask==="REEL" ? "VIDEO" : requestedTask;
  if(!this.executors)return {success:false,reason:"EXECUTOR_REGISTRY_NOT_CONFIGURED"};
  const result=this.executors.execute(task,operation,{factory:this});
  this.logs.push({id:id("DFLOG"),operationId:operation.id,executor:task,result,at:new Date().toISOString()});
  return result?.success?result:{success:false,reason:result?.reason||"EXECUTOR_FAILED"};
 }
 status(){return {...super.status(),layer:this.layer,executors:this.executors?.list?.()||[],logs:this.logs.length};}
}