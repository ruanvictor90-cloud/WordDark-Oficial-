import { id } from "./id.js";

export const COUNCIL_DECISIONS=Object.freeze({
  OBSERVE:"OBSERVE",
  RECLASSIFY:"RECLASSIFY",
  REQUEST_RESTRUCTURE:"REQUEST_RESTRUCTURE",
  REQUEST_REVIEW:"REQUEST_REVIEW",
  RETAIN:"RETAIN"
});

export class WorldCouncil {
  constructor({audit=null,sectorLibraries=null}={}) {
    this.id="WORLD-COUNCIL";
    this.audit=audit;
    this.sectorLibraries=sectorLibraries;
    this.members=[];
    this.decisions=[];
  }
  addMember({id:memberId,name,role="COUNCIL_MEMBER",scope="WORLD"}={}) {
    if(!memberId||!name) throw new Error("COUNCIL_MEMBER_INVALID");
    const member={id:memberId,name,role,scope,active:true};
    this.members.push(member);
    this.audit?.record?.("COUNCIL_MEMBER_ADDED",member);
    return structuredClone(member);
  }
  reviewWorld({recurringUsage=[],sectorAssignments=[],worldSignals=[]}={}) {
    const findings=[];
    for(const item of recurringUsage) {
      const usedSector=item.usedSector||item.sectorId;
      const expectedSector=item.expectedSector;
      if(expectedSector&&usedSector&&expectedSector!==usedSector) {
        findings.push({
          id:id("COUNCIL-FINDING"),
          type:"RECURRING_USE_MISPLACED",
          itemId:item.itemId||item.id||null,
          currentSector:usedSector,
          suggestedSector:expectedSector,
          evidence:item.evidence||"RECURRING_USAGE"
        });
      }
    }
    for(const signal of worldSignals) {
      if(signal.requiresAttention) findings.push({
        id:id("COUNCIL-FINDING"),type:"WORLD_SIGNAL",
        subject:signal.subject||null,reason:signal.reason||"WORLD_SIGNAL_REVIEW"
      });
    }
    const result={id:id("COUNCIL-REVIEW"),status:"REVIEWED",findings,sectorAssignments:structuredClone(sectorAssignments)};
    this.decisions.push(result);
    this.audit?.record?.("COUNCIL_WORLD_REVIEWED",result);
    return structuredClone(result);
  }
  decide(findingId,decision,{reason=null,targetSector=null,requesterId=null}={}) {
    const decisionEntry={id:id("COUNCIL-DECISION"),findingId,decision,reason,targetSector,requesterId,at:new Date().toISOString()};
    this.decisions.push(decisionEntry);
    this.audit?.record?.("COUNCIL_DECISION",decisionEntry);
    return structuredClone(decisionEntry);
  }
  status() {
    return {id:this.id,members:this.members.length,activeMembers:this.members.filter(x=>x.active).length,decisions:this.decisions.length};
  }
}
