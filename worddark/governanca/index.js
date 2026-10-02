import { WorldCouncil } from "../core-central/council.js";
import { ProductionRights } from "../direitos-producoes/index.js";

export const GOVERNANCE_DECISION_RULE = Object.freeze({
  UNANIMOUS: "UNANIMOUS",
  MAJORITY: "MAJORITY"
});

export class GovernanceSector {
  constructor({audit=null,sectorLibraries=null,centralLibrary=null}={}) {
    this.id="WORLD-GOVERNANCE";
    this.audit=audit;
    this.council=new WorldCouncil({audit,sectorLibraries,centralLibrary});
    this.judiciary=this.council;
    this.productionRights=new ProductionRights();
    this.decisionRule=GOVERNANCE_DECISION_RULE.UNANIMOUS;
    this.roleCatalog=[];
  }
  setDecisionRule(rule){
    if(!Object.values(GOVERNANCE_DECISION_RULE).includes(rule)) throw new Error("GOVERNANCE_DECISION_RULE_INVALID");
    this.decisionRule=rule;
    this.audit?.record?.("GOVERNANCE_DECISION_RULE_SET",{rule});
    return rule;
  }
  defineRole({id,name,importance=null,scope=[]}={}){
    if(!id||!name) throw new Error("GOVERNANCE_ROLE_INVALID");
    const role={id,name,importance,scope:[...scope],status:"DEFINED"};
    this.roleCatalog.push(role);
    this.audit?.record?.("GOVERNANCE_ROLE_DEFINED",role);
    return structuredClone(role);
  }
  status(){
    return {
      id:this.id,
      decisionRule:this.decisionRule,
      participants:this.council.members.length,
      rolesDefined:this.roleCatalog.length,
      council:this.council.status(),
      judiciary:"ACTIVE",
      productionRights:this.productionRights.list().length
    };
  }
}
