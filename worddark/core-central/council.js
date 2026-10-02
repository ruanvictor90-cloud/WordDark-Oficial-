import { id } from "./id.js";

export const COUNCIL_SCOPE=Object.freeze({ WORLD:"WORLD", JUDICIARY:"JUDICIARY", STRUCTURE:"STRUCTURE", OPERATIONS:"OPERATIONS" });

export const COUNCIL_DECISIONS=Object.freeze({
  OBSERVE:"OBSERVE",
  RECLASSIFY:"RECLASSIFY",
  REQUEST_RESTRUCTURE:"REQUEST_RESTRUCTURE",
  REQUEST_REVIEW:"REQUEST_REVIEW",
  RETAIN:"RETAIN"
});

export class WorldCouncil {
  constructor({audit=null,sectorLibraries=null,centralLibrary=null}={}) {
    this.id="WORLD-COUNCIL";
    this.audit=audit;
    this.sectorLibraries=sectorLibraries;
    this.centralLibrary=centralLibrary;
    this.members=[];
    this.decisions=[];
    this.findings=[];
    this.laws=[];
    this.terms=[];
    this.contracts=[];
  }

  addMember({id:memberId,name,role="COUNCIL_MEMBER",scope="WORLD"}={}) {
    if(!memberId||!name) throw new Error("COUNCIL_MEMBER_INVALID");
    const member={id:memberId,name,role,scope,active:true};
    this.members.push(member);
    this.audit?.record?.("COUNCIL_MEMBER_ADDED",member);
    return structuredClone(member);
  }

  registerLaw(law={}) {
    if(!law.id||!law.name) throw new Error("COUNCIL_LAW_INVALID");
    const item={id:law.id,name:law.name,scope:law.scope||COUNCIL_SCOPE.WORLD,rules:structuredClone(law.rules||[]),version:law.version||"1.0.0",status:law.status||"ACTIVE"};
    this.laws.push(item);this.audit?.record?.("COUNCIL_LAW_REGISTERED",item);return structuredClone(item);
  }

  registerTerm(term={}) {
    if(!term.id||!term.name) throw new Error("COUNCIL_TERM_INVALID");
    const item={id:term.id,name:term.name,type:term.type||"TERM",text:term.text||"",version:term.version||"1.0.0",status:term.status||"ACTIVE"};
    this.terms.push(item);this.audit?.record?.("COUNCIL_TERM_REGISTERED",item);return structuredClone(item);
  }

  registerContract(contract={}) {
    if(!contract.id||!contract.parties) throw new Error("COUNCIL_CONTRACT_INVALID");
    const item={id:contract.id,name:contract.name||contract.id,parties:structuredClone(contract.parties),terms:structuredClone(contract.terms||[]),status:contract.status||"ACTIVE",version:contract.version||"1.0.0"};
    this.contracts.push(item);this.audit?.record?.("COUNCIL_CONTRACT_REGISTERED",item);return structuredClone(item);
  }

  judge({subjectId,lawIds=[],contractIds=[],facts={},requestedDecision=COUNCIL_DECISIONS.REQUEST_REVIEW}={}) {
    const applicableLaws=this.laws.filter(x=>lawIds.includes(x.id)||lawIds.length===0&&x.status==="ACTIVE");
    const applicableContracts=this.contracts.filter(x=>contractIds.includes(x.id)||contractIds.length===0&&x.status==="ACTIVE");
    const violations=[];
    for(const law of applicableLaws) for(const rule of law.rules) {
      if(facts.violations?.includes?.(rule)||facts.prohibited?.includes?.(rule)) violations.push({source:"LAW",id:law.id,rule});
    }
    for(const contract of applicableContracts) for(const term of contract.terms) {
      if(facts.violations?.includes?.(term)||facts.prohibited?.includes?.(term)) violations.push({source:"CONTRACT",id:contract.id,term});
    }
    const judgment={
      id:id("COUNCIL-JUDGMENT"),subjectId,scope:COUNCIL_SCOPE.JUDICIARY,requestedDecision,
      lawIds:applicableLaws.map(x=>x.id),contractIds:applicableContracts.map(x=>x.id),
      facts:structuredClone(facts),violations,status:violations.length?"NON_COMPLIANT":"REVIEWED",
      recommendation:violations.length?COUNCIL_DECISIONS.REQUEST_REVIEW:COUNCIL_DECISIONS.OBSERVE,
      at:new Date().toISOString()
    };
    this.decisions.push(judgment);this.audit?.record?.("COUNCIL_JUDGMENT",judgment);return structuredClone(judgment);
  }

  reviewWorld({recurringUsage=[],sectorAssignments=[],worldSignals=[]}={}) {
    const findings=[];
    for(const item of recurringUsage) {
      const usedSector=item.usedSector||item.sectorId;
      const expectedSector=item.expectedSector;
      if(expectedSector&&usedSector&&expectedSector!==usedSector) findings.push({
        id:id("COUNCIL-FINDING"),type:"RECURRING_USE_MISPLACED",
        itemId:item.itemId||item.id||null,currentSector:usedSector,suggestedSector:expectedSector,
        evidence:item.evidence||"RECURRING_USAGE"
      });
    }
    for(const signal of worldSignals) if(signal.requiresAttention) findings.push({
      id:id("COUNCIL-FINDING"),type:"WORLD_SIGNAL",
      subject:signal.subject||null,reason:signal.reason||"WORLD_SIGNAL_REVIEW"
    });
    this.findings.push(...findings);
    const result={id:id("COUNCIL-REVIEW"),status:"REVIEWED",findings,sectorAssignments:structuredClone(sectorAssignments),worldMemory:this.inspectWorldMemory()};
    this.decisions.push(result);
    this.audit?.record?.("COUNCIL_WORLD_REVIEWED",result);
    return structuredClone(result);
  }

  inspectWorldMemory({sectorId=null,knowledgeClass=null}={}) {
    if(sectorId&&this.sectorLibraries) {
      const records=this.sectorLibraries.list(sectorId);
      return {scope:"SECTOR",sectorId,records:records.filter(x=>!knowledgeClass||x.knowledgeClass===knowledgeClass),count:records.length};
    }
    const records=this.centralLibrary?.list?.()||[];
    return {scope:"WORLD_MEMORY",records:structuredClone(records),count:records.length};
  }

  inspectRecurringUsage(records=[]) {
    const bySector=new Map();
    for(const record of records) {
      const key=record.sectorId||record.usedSector||"UNASSIGNED";
      bySector.set(key,(bySector.get(key)||0)+1);
    }
    return [...bySector.entries()].map(([sectorId,count])=>({sectorId,count}));
  }

  decide(findingId,decision,{reason=null,targetSector=null,requesterId=null}={}) {
    if(!Object.values(COUNCIL_DECISIONS).includes(decision)) throw new Error("COUNCIL_DECISION_INVALID");
    const decisionEntry={id:id("COUNCIL-DECISION"),findingId,decision,reason,targetSector,requesterId,at:new Date().toISOString()};
    this.decisions.push(decisionEntry);
    this.audit?.record?.("COUNCIL_DECISION",decisionEntry);
    return structuredClone(decisionEntry);
  }

  status() {
    return {
      id:this.id,members:this.members.length,activeMembers:this.members.filter(x=>x.active).length,
      findings:this.findings.length,decisions:this.decisions.length,laws:this.laws.length,
      terms:this.terms.length,contracts:this.contracts.length,worldMemoryAccessible:Boolean(this.centralLibrary)
    };
  }
}
