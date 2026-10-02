import { id } from "./id.js";

export const KNOWLEDGE_SOURCE=Object.freeze({
  LOCAL_LIBRARY:"LOCAL_LIBRARY",
  WORLD_MEMORY:"WORLD_MEMORY",
  WORLD_EVENT:"WORLD_EVENT",
  EXTERNAL_SOURCE:"EXTERNAL_SOURCE"
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
    this.knowledgeIndex=[];this.metricSignals=[];this.learningRules=[];
  }

  registerExternalSource({id:sourceId,name,type="SEARCH",adapter=null,status="READY",providerId=null,capabilities=[]}={}) {
    if(!sourceId||!name) throw new Error("SCHOOL_SOURCE_INVALID");
    const source={id:sourceId,name,type,status,adapter,providerId,capabilities:[...capabilities]};
    this.externalSources.set(sourceId,source);
    this.audit?.record?.("SCHOOL_EXTERNAL_SOURCE_REGISTERED",{id:sourceId,name,type,status,providerId,capabilities});
    return structuredClone({...source,adapter:undefined});
  }

  registerLearningRule({id:ruleId,name,metric,source="INTERNAL",weight=1}={}) {
    if(!ruleId||!name||!metric) throw new Error("SCHOOL_LEARNING_RULE_INVALID");
    const rule={id:ruleId,name,metric,source,weight};this.learningRules.push(rule);
    this.audit?.record?.("SCHOOL_LEARNING_RULE_REGISTERED",rule);return structuredClone(rule);
  }
  ingestWorldMetrics({contentId,platform=null,metrics={},context={},source="WORLD_OPERATION"}={}) {
    const signal={id:id("SCHOOL-METRIC"),contentId,platform,metrics:structuredClone(metrics),context:structuredClone(context),source,at:new Date().toISOString()};
    this.metricSignals.push(signal);this.knowledgeIndex.push({id:signal.id,source:KNOWLEDGE_SOURCE.WORLD_EVENT,type:"METRIC_SIGNAL",data:signal,status:"LEARNING_QUEUE"});
    this.audit?.record?.("SCHOOL_WORLD_METRICS_INGESTED",signal);return structuredClone(signal);
  }
  compareContentPerformance(contentId,{metrics={},baseline={},platform=null}={}) {
    const deltas={};for(const key of new Set([...Object.keys(metrics),...Object.keys(baseline)])){const current=Number(metrics[key]??0),base=Number(baseline[key]??0);deltas[key]={current,baseline:base,delta:current-base};}
    const result={id:id("SCHOOL-COMPARISON"),contentId,platform,deltas,at:new Date().toISOString()};this.audit?.record?.("SCHOOL_CONTENT_PERFORMANCE_COMPARED",result);return structuredClone(result);
  }
  registerPlatformGuidelines({platform,rules=[],evaluationSignals=[],source="EXTERNAL"}={}) {
    if(!platform) throw new Error("SCHOOL_PLATFORM_REQUIRED");
    const item={platform,rules:structuredClone(rules),evaluationSignals:structuredClone(evaluationSignals),source,updatedAt:new Date().toISOString()};
    this.platformGuidelines.set(platform,item);
    this.audit?.record?.("SCHOOL_PLATFORM_GUIDELINES_UPDATED",item);
    return structuredClone(item);
  }

  searchExternal(sourceId,query,{context={}}={}) {
    const source=this.externalSources.get(sourceId);
    if(!source) throw new Error("SCHOOL_EXTERNAL_SOURCE_NOT_FOUND");
    if(typeof source.adapter!=="function") return {success:false,reason:"EXTERNAL_SOURCE_NOT_CONNECTED",sourceId,query};
    const result=source.adapter({query,context});
    this.audit?.record?.("SCHOOL_EXTERNAL_SEARCH",{sourceId,query,result});
    return structuredClone({success:true,sourceId,query,result});
  }

  ingestExternalKnowledge(sourceId,{records=[],topic=null}={}) {
    const source=this.externalSources.get(sourceId);
    if(!source) throw new Error("SCHOOL_EXTERNAL_SOURCE_NOT_FOUND");
    const ingested=records.map(record=>({
      id:record.id||id("SCHOOL-KNOWLEDGE"),
      source:KNOWLEDGE_SOURCE.EXTERNAL_SOURCE,
      sourceId,
      topic,
      data:structuredClone(record),
      status:"LEARNING_QUEUE",
      capturedAt:new Date().toISOString()
    }));
    this.knowledgeIndex.push(...ingested);
    this.audit?.record?.("SCHOOL_EXTERNAL_KNOWLEDGE_INGESTED",{sourceId,topic,count:ingested.length});
    return structuredClone(ingested);
  }

  search(query,{sectorId=null,includeLocal=true,includeCentral=true,includeExternal=true,limit=25}={}) {
    const terms=String(query||"").toLowerCase().split(/\s+/).filter(Boolean);
    const matches=[];
    const add=(record,source)=>{
      const text=JSON.stringify(record).toLowerCase();
      if(!terms.length||terms.every(term=>text.includes(term))) matches.push({source,...structuredClone(record)});
    };
    if(includeLocal&&this.sectorLibraries){
      const sectors=sectorId?[this.sectorLibraries.getSector(sectorId)].filter(Boolean):[...this.sectorLibraries.sectors.values()];
      for(const sector of sectors) for(const record of sector.records.values()) add(record,"LOCAL_LIBRARY");
    }
    if(includeCentral&&this.centralLibrary) for(const record of this.centralLibrary.list()) add(record,"WORLD_MEMORY");
    if(includeExternal) for(const record of this.knowledgeIndex) add(record,"EXTERNAL_SOURCE");
    return matches.slice(0,Math.max(1,limit));
  }

  research(query,{sources=null,sectorId=null,limit=25}={}){
    const selected=sources||[...this.externalSources.keys()];
    const external=selected.map(sourceId=>this.searchExternal(sourceId,query,{context:{sectorId,limit}}));
    const learning=this.learn({query,sectorId,includeLocal:true,includeCentral:true,includeExternal:true,limit});
    return {query,sectorId,external,learning};
  }

  captureTrend({topic,platform=null,signals=[],source="EXTERNAL"}={}){
    const trend={id:id("SCHOOL-TREND"),topic,platform,signals:structuredClone(signals),source,capturedAt:new Date().toISOString(),status:"REVIEW_REQUIRED"};
    this.signals.push(trend);this.knowledgeIndex.push({id:trend.id,source:KNOWLEDGE_SOURCE.EXTERNAL_SOURCE,type:"TREND",data:trend,status:trend.status});
    this.audit?.record?.("SCHOOL_TREND_CAPTURED",trend);return structuredClone(trend);
  }

  registerPolicyPack({platform,version,sourceUrl=null,rules=[],evaluationSignals=[],capturedAt=null}={}){
    if(!platform||!version) throw new Error("SCHOOL_POLICY_PACK_INVALID");
    return this.registerPlatformGuidelines({platform,rules,evaluationSignals,source:"EXTERNAL_POLICY_PACK",version,sourceUrl,capturedAt:capturedAt||new Date().toISOString()});
  }

  recommend({query="",sectorId=null,platform=null}={}){
    const snapshot=this.knowledgeSnapshot({query,sectorId});
    const recommendation={id:id("SCHOOL-RECOMMENDATION"),query,sectorId,platform,sources:{local:snapshot.local.length,central:snapshot.central.length,external:snapshot.external.length},guidelines:platform?snapshot.guidelines.filter(x=>x.platform===platform):snapshot.guidelines,confidence:"REVIEW_REQUIRED",createdAt:new Date().toISOString()};
    this.audit?.record?.("SCHOOL_RECOMMENDATION_CREATED",recommendation);return structuredClone(recommendation);
  }

  learn({query="",sectorId=null,includeLocal=true,includeCentral=true,includeExternal=true,limit=25}={}) {
    const results=this.search(query,{sectorId,includeLocal,includeCentral,includeExternal,limit});
    const learning={id:id("SCHOOL-LEARNING"),query,sectorId,sources:[...new Set(results.map(x=>x.source))],results,at:new Date().toISOString()};
    this.signals.push(learning);
    this.audit?.record?.("SCHOOL_LEARNING_CYCLE",learning);
    return structuredClone(learning);
  }

  observeWorld({event,source="WORLD_EVENT",requiresAttention=false,relevance="UNASSESSED"}={}) {
    return this.learnFromWorld({event,source,requiresAttention,relevance});
  }

  ingestPlatformGuideline(platform,data={}) {
    return this.registerPlatformGuidelines({
      platform,
      rules:data.rules||[],
      evaluationSignals:data.evaluationSignals||[],
      source:data.source||"EXTERNAL_PLATFORM"
    });
  }

  knowledgeSnapshot({query="",sectorId=null}={}) {
    const results=this.search(query,{sectorId});
    return {
      id:id("SCHOOL-SNAPSHOT"),
      query,
      sectorId,
      local:results.filter(x=>x.source==="LOCAL_LIBRARY"),
      central:results.filter(x=>x.source==="WORLD_MEMORY"),
      external:results.filter(x=>x.source==="EXTERNAL_SOURCE"),
      guidelines:this.getPlatformGuidelines(),
      at:new Date().toISOString()
    };
  }

  getPlatformGuidelines(platform=null) {
    return platform ? structuredClone(this.platformGuidelines.get(platform)||null) : [...this.platformGuidelines.values()].map(structuredClone);
  }

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
  status(){
    return {
      id:this.id,
      signals:this.signals.length,
      indexedKnowledge:this.knowledgeIndex.length,
      readyContent:this.readyContent.size,
      authorized:this.listReady().filter(x=>x.status==="AUTHORIZED_FOR_POSTING").length,
      externalSources:this.externalSources.size,
      platformGuidelines:this.platformGuidelines.size,metricSignals:this.metricSignals.length,learningRules:this.learningRules.length
    };
  }
}
