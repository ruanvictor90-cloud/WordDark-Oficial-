import { id } from "./id.js";

export const CONTENT_OUTCOME=Object.freeze({
  COMPLETED:"COMPLETED",
  PARTIAL:"PARTIAL",
  NEEDS_EDIT:"NEEDS_EDIT",
  NEEDS_RESTRUCTURE:"NEEDS_RESTRUCTURE",
  FAILED:"FAILED",
  BLOCKED:"BLOCKED",
  WAITING_HUMAN:"WAITING_HUMAN",
  REDO:"REDO"
});

export const CONTENT_ROUTE=Object.freeze({
  RIGHTS_OR_SAFETY:"EDIT",
  MEDIOCRE_RESULT:"RESTRUCTURE",
  UNRESOLVED:"REDO",
  READY_FOR_WORLD:"WORLD_RELEASE_GATE",
  PARTIAL_EXECUTION:"PARTIAL"
});

export const CONTENT_OUTCOME_DEFINITION=Object.freeze({
  PARTIAL:"Parte da operação terminou e outra parte ainda está pendente/erro. NÃO significa conteúdo mediano.",
  NEEDS_RESTRUCTURE:"A operação terminou, mas o resultado ficou abaixo do objetivo e precisa de melhoria.",
  NEEDS_EDIT:"Há problema de direitos, segurança, conformidade ou edição que precisa ser corrigido.",
  REDO:"A solução não foi encontrada ou a estrutura precisa ser refeita de forma substancial."
});

export class ContentLifecycle {
  constructor({audit=null}={}) {this.audit=audit;this.items=new Map();}

  register(operationId,{contentId=null,metrics=null,rights=null,safety=null}={}) {
    const item={id:id("CONTENT-LIFECYCLE"),operationId,contentId,metrics:structuredClone(metrics||{}),rights:structuredClone(rights||{}),safety:structuredClone(safety||{}),outcome:"IN_PROGRESS",revision:0,history:[],createdAt:new Date().toISOString()};
    this.items.set(operationId,item);
    return structuredClone(item);
  }

  evaluate(operationId,{rightsOk=true,safetyOk=true,metricsOk=true,needsEdit=false,needsRestructure=false,unresolved=false,partial=false,reason=null}={}) {
    const item=this.items.get(operationId);
    if(!item) throw new Error("CONTENT_LIFECYCLE_NOT_FOUND");
    let outcome=CONTENT_OUTCOME.COMPLETED;
    if(unresolved) outcome=CONTENT_OUTCOME.REDO;
    else if(!rightsOk||!safetyOk||needsEdit) outcome=CONTENT_OUTCOME.NEEDS_EDIT;
    else if(partial) outcome=CONTENT_OUTCOME.PARTIAL;
    else if(needsRestructure||!metricsOk) outcome=CONTENT_OUTCOME.NEEDS_RESTRUCTURE;
    const entry={id:id("CONTENT-OUTCOME"),outcome,reason,at:new Date().toISOString()};
    item.outcome=outcome;item.history.push(entry);
    this.audit?.record?.("CONTENT_OUTCOME_EVALUATED",{operationId,...entry});
    return structuredClone(item);
  }

  restructure(operationId,{reason=null}={}) {
    const item=this.items.get(operationId);if(!item) throw new Error("CONTENT_LIFECYCLE_NOT_FOUND");
    item.revision+=1;item.outcome=CONTENT_OUTCOME.NEEDS_RESTRUCTURE;
    item.history.push({id:id("CONTENT-REVISION"),type:"RESTRUCTURE",revision:item.revision,reason,at:new Date().toISOString()});
    this.audit?.record?.("CONTENT_RESTRUCTURE_REQUESTED",{operationId,revision:item.revision,reason});
    return structuredClone(item);
  }

  edit(operationId,{reason=null}={}) {
    const item=this.items.get(operationId);if(!item) throw new Error("CONTENT_LIFECYCLE_NOT_FOUND");
    item.revision+=1;item.outcome=CONTENT_OUTCOME.NEEDS_EDIT;
    item.history.push({id:id("CONTENT-REVISION"),type:"EDIT",revision:item.revision,reason,at:new Date().toISOString()});
    this.audit?.record?.("CONTENT_EDIT_REQUESTED",{operationId,revision:item.revision,reason});
    return structuredClone(item);
  }

  routeToFactory(operationId,{reason=null,mode="EDIT"}={}) {
    const item=this.items.get(operationId);if(!item) throw new Error("CONTENT_LIFECYCLE_NOT_FOUND");
    const route=mode==="RESTRUCTURE"?"FACTORY_RESTRUCTURE":mode==="REDO"?"FACTORY_REDO":"FACTORY_EDIT";
    item.history.push({id:id("CONTENT-FACTORY-ROUTE"),type:route,reason,at:new Date().toISOString()});
    item.outcome=mode==="REDO"?CONTENT_OUTCOME.REDO:mode==="RESTRUCTURE"?CONTENT_OUTCOME.NEEDS_RESTRUCTURE:CONTENT_OUTCOME.NEEDS_EDIT;
    this.audit?.record?.("CONTENT_RETURNED_TO_FACTORY",{operationId,route,reason});return structuredClone(item);
  }

  redo(operationId,{reason=null}={}) {
    const item=this.items.get(operationId);if(!item) throw new Error("CONTENT_LIFECYCLE_NOT_FOUND");
    item.revision+=1;item.outcome=CONTENT_OUTCOME.REDO;
    item.history.push({id:id("CONTENT-REVISION"),type:"REDO",revision:item.revision,reason,at:new Date().toISOString()});
    this.audit?.record?.("CONTENT_REDO_REQUESTED",{operationId,revision:item.revision,reason});
    return structuredClone(item);
  }

  routeAfterEvaluation(operationId,{rightsOk=true,safetyOk=true,metricsOk=true,solvable=true,reason=null}={}) {
    const evaluated=this.evaluate(operationId,{rightsOk,safetyOk,metricsOk,reason});
    if(evaluated.outcome===CONTENT_OUTCOME.NEEDS_EDIT) return {route:CONTENT_ROUTE.RIGHTS_OR_SAFETY,item:evaluated};
    if(evaluated.outcome===CONTENT_OUTCOME.NEEDS_RESTRUCTURE) return {route:CONTENT_ROUTE.MEDIOCRE_RESULT,item:evaluated};
    if(evaluated.outcome===CONTENT_OUTCOME.COMPLETED) return {route:CONTENT_ROUTE.READY_FOR_WORLD,item:evaluated};
    if(!solvable||evaluated.outcome===CONTENT_OUTCOME.REDO) return {route:CONTENT_ROUTE.UNRESOLVED,item:evaluated};
    return {route:"REVIEW",item:evaluated};
  }

  markPartial(operationId,{completedTargets=[],pendingTargets=[],failedTargets=[],reason=null}={}) {
    const item=this.items.get(operationId);if(!item) throw new Error("CONTENT_LIFECYCLE_NOT_FOUND");
    item.outcome=CONTENT_OUTCOME.PARTIAL;
    item.history.push({id:id("CONTENT-PARTIAL"),type:"PARTIAL_EXECUTION",completedTargets:[...completedTargets],pendingTargets:[...pendingTargets],failedTargets:[...failedTargets],reason,at:new Date().toISOString()});
    this.audit?.record?.("CONTENT_PARTIAL_RESULT",{operationId,completedTargets,pendingTargets,failedTargets,reason});
    return structuredClone(item);
  }

  get(operationId){return structuredClone(this.items.get(operationId)||null);}
  list(){return [...this.items.values()].map(structuredClone);}
}
