/* WordDark Lab — Traceable Operation */
class WordDarkLabOperation {
  constructor(source={}){
    this.operationId=source.operationId||null; this.requesterId=source.requesterId||null;
    this.clientId=source.clientId||null; this.projectId=source.projectId||null; this.resourceId=source.resourceId||null;
    this.origin=source.origin||null; this.destination=source.destination||null; this.serviceId=source.serviceId||null;
    this.environment=source.environment||"TEST"; this.request=source.request||{};
    this.status=source.status||"CREATED"; this.version=source.version||1;
    this.history=Array.isArray(source.history)?[...source.history]:[];
  }
  transition(status,data={}){
    const allowed={CREATED:["RECEIVED","CANCELLED"],RECEIVED:["VALIDATED","REJECTED","FAILED"],VALIDATED:["EXECUTING","CANCELLED"],EXECUTING:["COMPLETED","FAILED"],FAILED:["ANALYZING","CANCELLED","REQUEUED"],ANALYZING:["CORRECTING","CANCELLED"],CORRECTING:["RETESTING","FAILED"],RETESTING:["EXECUTING","FAILED"],REQUEUED:["VALIDATED","CANCELLED"],COMPLETED:[],REJECTED:[],CANCELLED:[]};
    if(!allowed[this.status]||!allowed[this.status].includes(status))throw new Error("Transição inválida: "+this.status+" -> "+status);
    this.status=status; this.addHistory("STATUS_CHANGED",{status,...data}); return this.status;
  }
  addHistory(event,data={}){const h={event,timestamp:new Date().toISOString(),data};this.history.push(h);return h;}
  validate(){const e=[];for(const [k,v] of Object.entries({operationId:this.operationId,requesterId:this.requesterId,clientId:this.clientId,resourceId:this.resourceId,origin:this.origin,destination:this.destination,serviceId:this.serviceId})){if(!v)e.push(k+" é obrigatório.");}if(!["TEST","PROD"].includes(this.environment))e.push("environment inválido.");return {valid:e.length===0,errors:e};}
  toJSON(){return {...this,history:[...this.history]};}
}
if(typeof module!=="undefined")module.exports=WordDarkLabOperation;
if(typeof window!=="undefined")window.WordDarkLabOperation=WordDarkLabOperation;
