import { id } from "./id.js";

export const KNOWLEDGE_SOURCE=Object.freeze({
  LOCAL_LIBRARY:"LOCAL_LIBRARY",
  WORLD_EVENT:"WORLD_EVENT"
});

export class WorldSchool {
  constructor({sectorLibraries=null,centralLibrary=null,audit=null}={}) {
    this.id="WORLD-SCHOOL";
    this.sectorLibraries=sectorLibraries;
    this.centralLibrary=centralLibrary;
    this.audit=audit;
    this.signals=[];
    this.readyContent=new Map();
    this.externalSources=new Map();
    this.platformGuidelines=new Map();
  }
  registerExternalSource({id:sourceId,name,type="SEARCH",adapter=null,status="READY"}={}) {
    if(!sourceId||!name) throw new Error("SCHOOL_SOURCE_INVALID");
    const source={id:sourceId,name,type,status,adapter};this.externalSources.set(sourceId,source);
    this.audit?.record?.("SCHOOL_EXTERNAL_SOURCE_REGISTERED",{id:sourceId,name,type,status});return structuredClone({...source,adapter:undefined});
  }
  registerPlatformGuidelines({platform,rules=[],evaluationSignals=[]}={}) {
    if(!platform) throw new Error("SCHOOL_PLATFORM_REQUIRED");
    const item={platform,rules:structuredClone(rules),evaluationSignals:structuredClone(evaluationSignals),updatedAt:new Date().toISOString()};
    this.platformGuidelines.set(platform,item);this.audit?.record?.("SCHOOL_PLATFORM_GUIDELINES_UPDATED",item);return structuredClone(item);
  }
  searchExternal(sourceId,query,{context={}}={}) {
    const source=this.externalSources.get(sourceId);if(!source) throw new Error("SCHOOL_EXTERNAL_SOURCE_NOT_FOUND");
    if(typeof source.adapter!=="function") return {success:false,reason:"EXTERNAL_SOURCE_NOT_CONNECTED",sourceId,query};
    const result=source.adapter({query,context});this.audit?.record?.("SCHOOL_EXTERNAL_SEARCH",{sourceId,query,result});return structuredClone({success:true,sourceId,query,result});
  }
  getPlatformGuidelines(platform=null) { return platform ? structuredClone(this.platformGuidelines.get(platform)||null) : [...this.platformGuidelines.values()].map(structuredClone); }
  analyzeLocalKnowledge(sectorId,{records=null,worldSignals=[]}={}) {
    const sourceRecords=records||this.sectorLibraries?.list?.(sectorId)||[];
    const analyzed=sourceRecords.map(record=>({
      recordId:record.id||null,
      sectorId,
      relevance:record.relevance||"UNASSESSED",
      reusable:Boolean(record.reusable),
      worldFit:record.worldFit||null,
      knowledgeClass:record.knowledgeClass||"LOCAL"
    }));
    const signals=worldSignals.filter(x=>x?.requiresAttention||x?.relevant);
    const result={id:id("SCHOOL-ANALYSIS"),sectorId,source:KNOWLEDGE_SOURCE.LOCAL_LIBRARY,analyzed,worldSignals:structuredClone(signals),at:new Date().toISOString()};
    this.signals.push(result);
    this.audit?.record?.("SCHOOL_LOCAL_KNOWLEDGE_ANALYZED",result);
    return structuredClone(result);
  }
  learnFromWorld(event) {
    const result={id:id("SCHOOL-WORLD-SIGNAL"),source:KNOWLEDGE_SOURCE.WORLD_EVENT,event:structuredClone(event),at:new Date().toISOString()};
    this.signals.push(result);
    this.audit?.record?.("SCHOOL_WORLD_EVENT_CAPTURED",result);
    return structuredClone(result);
  }
  evaluateWorldEvent(event,{promoteToMemory=false,reason="WORLD_EVENT_REVIEW"}={}) {
    const learned=this.learnFromWorld(event);
    if(promoteToMemory&&this.centralLibrary) {
      const memory=this.centralLibrary.append({id:id("SCHOOL-MEMORY"),type:"WORLD_MEMORY",source:"WORLD-SCHOOL",reason,data:learned});
      return {learned,memory:structuredClone(memory)};
    }
    return {learned,memory:null};
  }
  prepareContent(content,{source="LOCAL_LIBRARY",sectorId=null,reason="READY_FOR_HUMAN_REVIEW"}={}) {
    const item={id:id("CONTENT-READY"),content:structuredClone(content),source,sectorId,reason,status:"READY_FOR_HUMAN_AUTHORIZATION",createdAt:new Date().toISOString()};
    this.readyContent.set(item.id,item);
    this.audit?.record?.("SCHOOL_CONTENT_PREPARED",item);
    return structuredClone(item);
  }
  authorizeForPosting(contentId,{authorizedBy}={}) {
    const item=this.readyContent.get(contentId);
    if(!item) throw new Error("CONTENT_READY_NOT_FOUND");
    if(!authorizedBy) throw new Error("HUMAN_AUTHORIZATION_REQUIRED");
    item.status="AUTHORIZED_FOR_POSTING";
    item.authorizedBy=authorizedBy;
    item.authorizedAt=new Date().toISOString();
    this.audit?.record?.("CONTENT_HUMAN_AUTHORIZED",item);
    return structuredClone(item);
  }
  rejectForPosting(contentId,{reason,authorizedBy}={}) {
    const item=this.readyContent.get(contentId);
    if(!item) throw new Error("CONTENT_READY_NOT_FOUND");
    item.status="RETURNED_FOR_REVIEW";
    item.rejectionReason=reason||"REVIEW_REQUIRED";
    item.reviewedBy=authorizedBy||null;
    item.reviewedAt=new Date().toISOString();
    this.audit?.record?.("CONTENT_RETURNED_FOR_REVIEW",item);
    return structuredClone(item);
  }
  listReady(){return [...this.readyContent.values()].map(structuredClone);}
  status(){return {id:this.id,signals:this.signals.length,readyContent:this.readyContent.size,authorized:this.listReady().filter(x=>x.status==="AUTHORIZED_FOR_POSTING").length,externalSources:this.externalSources.size,platformGuidelines:this.platformGuidelines.size};}
}
