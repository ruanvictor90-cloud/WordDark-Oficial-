const STATES=["OPEN","CONTAINED","INVESTIGATING","RECOVERING","RESOLVED","CLOSED"];
const SEVERITIES=["LOW","MEDIUM","HIGH","CRITICAL"];

class WordDarkIncidentResponse {
  constructor({idPrefix="INC",auditLedger=null,clock=()=>new Date().toISOString()}={}) {
    this.idPrefix=idPrefix; this.auditLedger=auditLedger; this.clock=clock; this.incidents=new Map();
  }

  create({severity="MEDIUM",title,description="",source="WORLD",evidence=[]}={}) {
    if(!title) throw new Error("title é obrigatório");
    if(!SEVERITIES.includes(severity)) throw new Error("severity inválida");
    const incident={
      incidentId:this.idPrefix+"-"+Date.now().toString(36).toUpperCase(),
      severity,title,description,source,state:"OPEN",frozen:false,
      evidence:[...evidence],createdAt:this.clock(),updatedAt:this.clock(),history:[]
    };
    this.incidents.set(incident.incidentId,incident);
    this.auditLedger?.append({actorId:"SECURITY",action:"INCIDENT_CREATED",resourceId:incident.incidentId,severity,data:{severity}});
    return {...incident,history:[...incident.history],evidence:[...incident.evidence]};
  }

  transition(incidentId,state,{actorId="SECURITY",reason="",evidence=[]}={}) {
    if(!STATES.includes(state)) throw new Error("estado de incidente inválido");
    const incident=this.incidents.get(incidentId);
    if(!incident) throw new Error("Incidente não encontrado");
    const allowed={
      OPEN:["CONTAINED","INVESTIGATING","CLOSED"],
      CONTAINED:["INVESTIGATING","RECOVERING","CLOSED"],
      INVESTIGATING:["CONTAINED","RECOVERING","RESOLVED"],
      RECOVERING:["RESOLVED","CONTAINED"],
      RESOLVED:["CLOSED","INVESTIGATING"],
      CLOSED:[]
    };
    if(state!==incident.state&&!allowed[incident.state].includes(state)) throw new Error("transição de incidente não permitida");
    incident.state=state; incident.updatedAt=this.clock();
    incident.history.push({state,actorId,reason,timestamp:incident.updatedAt});
    if(evidence.length) incident.evidence.push(...evidence);
    if(state==="CONTAINED"||state==="RECOVERING") incident.frozen=true;
    if(state==="RESOLVED"||state==="CLOSED") incident.frozen=false;
    this.auditLedger?.append({actorId,action:"INCIDENT_STATE_CHANGED",resourceId:incidentId,result:state,severity:incident.severity,metadata:{reason}});
    return {...incident,history:[...incident.history],evidence:[...incident.evidence]};
  }

  get(incidentId){const i=this.incidents.get(incidentId);return i?{...i,history:[...i.history],evidence:[...i.evidence]}:null;}
  list(){return [...this.incidents.values()].map(i=>({...i,history:[...i.history],evidence:[...i.evidence]}));}
  isFrozen(incidentId){return !!this.incidents.get(incidentId)?.frozen;}
}
if(typeof module!=="undefined") module.exports=WordDarkIncidentResponse;
if(typeof window!=="undefined") window.WordDarkIncidentResponse=WordDarkIncidentResponse;
