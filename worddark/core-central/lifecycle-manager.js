import { id } from "./id.js";

export const LIFECYCLE_STATUS=Object.freeze(["DRAFT","CREATED","READY","ACTIVE","USED","EVALUATING","RETAINED","ARCHIVED","DELETED"]);

export class LifecycleManager{
  constructor({dependencyMap=null,audit=null}={}){this.dependencyMap=dependencyMap;this.audit=audit;this.structures=new Map();}
  create({id:structureId=null,type="TEMPORARY",owner="ORCHESTRATOR",purpose,contractIds=[],capabilityIds=[],ttl=null}={}){
    const item={id:structureId||id("TEMP"),type,owner,purpose:purpose||"Necessidade operacional",contractIds:[...contractIds],capabilityIds:[...capabilityIds],ttl,status:"CREATED",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    this.structures.set(item.id,item);this.audit?.record?.("STRUCTURE_CREATED",item);return structuredClone(item);
  }
  transition(structureId,status,reason=null){
    if(!LIFECYCLE_STATUS.includes(status))throw new Error("LIFECYCLE_STATUS_INVALID");
    const item=this.structures.get(structureId);if(!item)throw new Error("STRUCTURE_NOT_FOUND");
    if(status==="DELETED"&&this.dependencyMap){const check=this.dependencyMap.canDeactivate(structureId);if(!check.allowed)return{success:false,reason:"DEPENDENCY_BLOCK",blockers:check.blockers};}
    item.status=status;item.updatedAt=new Date().toISOString();item.lastReason=reason;
    this.audit?.record?.("STRUCTURE_LIFECYCLE_CHANGED",{id:structureId,status,reason});return{success:true,structure:structuredClone(item)};
  }
  evaluate(structureId,{retain=false,archive=false,reason="LIFECYCLE_EVALUATION"}={}){
    const item=this.structures.get(structureId);if(!item)throw new Error("STRUCTURE_NOT_FOUND");
    this.transition(structureId,"EVALUATING",reason);
    if(retain)return this.transition(structureId,"RETAINED",reason);
    if(archive)return this.transition(structureId,"ARCHIVED",reason);
    return this.transition(structureId,"DELETED",reason);
  }
  get(structureId){return structuredClone(this.structures.get(structureId)||null);}
  list(){return [...this.structures.values()].map(structuredClone);}
}
