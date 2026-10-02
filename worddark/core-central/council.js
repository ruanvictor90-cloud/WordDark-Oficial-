import { id } from "./id.js";

export const COUNCIL_SCOPE=Object.freeze({ WORLD:"WORLD", JUDICIARY:"JUDICIARY", STRUCTURE:"STRUCTURE", OPERATIONS:"OPERATIONS" });

export const COUNCIL_CASE_STATUS=Object.freeze({
  OPEN:"OPEN",
  UNDER_REVIEW:"UNDER_REVIEW",
  AWAITING_DECISION:"AWAITING_DECISION",
  DECIDED:"DECIDED",
  REFERRED:"REFERRED",
  CLOSED:"CLOSED"
});

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
    this.contracts=[];this.externalRules=[];
    this.decisionRule="UNANIMOUS";
    this.votingHistory=[];
    this.cases=new Map();
    this.evidence=new Map();
    this.appeals=[];
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

  registerExternalRule(rule={}) {
    if(!rule.id||!rule.name) throw new Error("COUNCIL_EXTERNAL_RULE_INVALID");
    const item={id:rule.id,name:rule.name,source:rule.source||"EXTERNAL_PLATFORM",platform:rule.platform||null,type:rule.type||"GUIDELINE",rules:structuredClone(rule.rules||[]),version:rule.version||"1.0.0",status:rule.status||"ACTIVE"};
    this.externalRules.push(item);this.audit?.record?.("COUNCIL_EXTERNAL_RULE_REGISTERED",item);return structuredClone(item);
  }

  openCase({subjectId,type="WORLD_REVIEW",scope=COUNCIL_SCOPE.WORLD,requesterId=null,reason=null}={}) {
    if(!subjectId) throw new Error("COUNCIL_SUBJECT_REQUIRED");
    const item={id:id("COUNCIL-CASE"),subjectId,type,scope,requesterId,reason,status:COUNCIL_CASE_STATUS.OPEN,evidenceIds:[],judgmentId:null,decisionId:null,createdAt:new Date().toISOString()};
    this.cases.set(item.id,item);
    this.audit?.record?.("COUNCIL_CASE_OPENED",item);
    return structuredClone(item);
  }

  addEvidence(caseId,evidence={}) {
    const item=this.cases.get(caseId);
    if(!item) throw new Error("COUNCIL_CASE_NOT_FOUND");
    if(!evidence.id) evidence.id=id("COUNCIL-EVIDENCE");
    const entry={...structuredClone(evidence),caseId,capturedAt:new Date().toISOString()};
    this.evidence.set(entry.id,entry);
    item.evidenceIds.push(entry.id);
    item.status=COUNCIL_CASE_STATUS.UNDER_REVIEW;
    this.audit?.record?.("COUNCIL_EVIDENCE_ADDED",entry);
    return structuredClone(entry);
  }

  getCase(caseId) {
    return structuredClone(this.cases.get(caseId)||null);
  }

  listCases() {
    return [...this.cases.values()].map(structuredClone);
  }

  judge({subjectId,lawIds=[],contractIds=[],externalRuleIds=[],facts={},evidenceIds=[],requestedDecision=COUNCIL_DECISIONS.REQUEST_REVIEW}={}) {
    const applicableLaws=this.laws.filter(x=>lawIds.includes(x.id)||lawIds.length===0&&x.status==="ACTIVE");
    const applicableContracts=this.contracts.filter(x=>contractIds.includes(x.id)||contractIds.length===0&&x.status==="ACTIVE");
    const applicableExternalRules=this.externalRules.filter(x=>externalRuleIds.includes(x.id)||externalRuleIds.length===0&&x.status==="ACTIVE");
    const violations=[];
    for(const law of applicableLaws) for(const rule of law.rules) {
      if(facts.violations?.includes?.(rule)||facts.prohibited?.includes?.(rule)) violations.push({source:"LAW",id:law.id,rule});
    }
    for(const rule of applicableExternalRules) for(const item of rule.rules) { if(facts.violations?.includes?.(item)||facts.prohibited?.includes?.(item)) violations.push({source:"EXTERNAL_RULE",id:rule.id,rule:item}); }
    for(const contract of applicableContracts) for(const term of contract.terms) {
      if(facts.violations?.includes?.(term)||facts.prohibited?.includes?.(term)) violations.push({source:"CONTRACT",id:contract.id,term});
    }
    const judgment={
      id:id("COUNCIL-JUDGMENT"),subjectId,scope:COUNCIL_SCOPE.JUDICIARY,requestedDecision,
      lawIds:applicableLaws.map(x=>x.id),contractIds:applicableContracts.map(x=>x.id),externalRuleIds:applicableExternalRules.map(x=>x.id),
      facts:structuredClone(facts),evidenceIds:[...evidenceIds],violations,status:violations.length?"NON_COMPLIANT":"REVIEWED",
      recommendation:violations.length?COUNCIL_DECISIONS.REQUEST_REVIEW:COUNCIL_DECISIONS.OBSERVE,
      at:new Date().toISOString()
    };
    this.decisions.push(judgment);
    const openCase=[...this.cases.values()].find(x=>x.subjectId===subjectId&&x.status!==COUNCIL_CASE_STATUS.CLOSED);
    if(openCase){openCase.status=COUNCIL_CASE_STATUS.AWAITING_DECISION;openCase.judgmentId=judgment.id;}
    this.audit?.record?.("COUNCIL_JUDGMENT",judgment);
    return structuredClone(judgment);
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

  reviewSubject({subjectId,facts={},lawIds=[],contractIds=[],externalRuleIds=[],recurringUsage=[],sectorAssignments=[],worldSignals=[]}={}) {
    const judgment=this.judge({subjectId,lawIds,contractIds,externalRuleIds,facts});
    const worldReview=this.reviewWorld({recurringUsage,sectorAssignments,worldSignals});
    return {id:id("COUNCIL-CASE"),subjectId,jurisdiction:"WORLD",judgment,worldReview,at:new Date().toISOString()};
  }

  inspectWorld() {
    return {
      id:id("COUNCIL-WORLD-SNAPSHOT"),
      memory:this.inspectWorldMemory(),
      findings:structuredClone(this.findings),
      decisions:structuredClone(this.decisions),
      laws:structuredClone(this.laws),
      terms:structuredClone(this.terms),
      contracts:structuredClone(this.contracts),
      externalRules:structuredClone(this.externalRules),
      at:new Date().toISOString()
    };
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

  setDecisionRule(rule) {
    if(!["UNANIMOUS","MAJORITY"].includes(rule)) throw new Error("COUNCIL_DECISION_RULE_INVALID");
    this.decisionRule=rule;
    this.audit?.record?.("COUNCIL_DECISION_RULE_SET",{rule});
    return rule;
  }

  vote(findingId,decision,{votes=[]}={}) {
    if(!this.members.length) return {status:"WAITING_COUNCIL_MEMBERS",findingId,decision,rule:this.decisionRule};
    const active=this.members.filter(x=>x.active);
    const normalized=votes.filter(v=>active.some(m=>m.id===v.memberId));
    const approvals=normalized.filter(v=>v.approve===true).length;
    const required=this.decisionRule==="UNANIMOUS"?active.length:Math.floor(active.length/2)+1;
    const approved=approvals>=required && normalized.length>=required;
    const result={id:id("COUNCIL-VOTE"),findingId,decision,rule:this.decisionRule,activeMembers:active.length,
      votes:structuredClone(normalized),approvals,required,approved,status:approved?"APPROVED":"PENDING"};
    this.votingHistory.push(result);
    this.audit?.record?.("COUNCIL_VOTE",result);
    return structuredClone(result);
  }

  appeal(caseId,{requesterId,reason}={}) {
    const item=this.cases.get(caseId);
    if(!item) throw new Error("COUNCIL_CASE_NOT_FOUND");
    if(!reason) throw new Error("COUNCIL_APPEAL_REASON_REQUIRED");
    const appeal={id:id("COUNCIL-APPEAL"),caseId,requesterId:requesterId||null,reason,status:"OPEN",createdAt:new Date().toISOString()};
    this.appeals.push(appeal);
    item.status=COUNCIL_CASE_STATUS.REFERRED;
    this.audit?.record?.("COUNCIL_APPEAL_OPENED",appeal);
    return structuredClone(appeal);
  }

  closeCase(caseId,{reason=null,closedBy=null}={}) {
    const item=this.cases.get(caseId);
    if(!item) throw new Error("COUNCIL_CASE_NOT_FOUND");
    item.status=COUNCIL_CASE_STATUS.CLOSED;
    item.closedAt=new Date().toISOString();
    item.closedBy=closedBy||null;
    item.closeReason=reason||null;
    this.audit?.record?.("COUNCIL_CASE_CLOSED",item);
    return structuredClone(item);
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
      findings:this.findings.length,decisions:this.decisions.length,decisionRule:this.decisionRule,votes:this.votingHistory.length,laws:this.laws.length,
      terms:this.terms.length,contracts:this.contracts.length,externalRules:this.externalRules.length,openCases:this.listCases().filter(x=>x.status!==COUNCIL_CASE_STATUS.CLOSED).length,evidence:this.evidence.size,appeals:this.appeals.length,worldMemoryAccessible:Boolean(this.centralLibrary)
    };
  }
}
