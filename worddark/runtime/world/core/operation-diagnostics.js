/** WordDark Operation Diagnostics */
class WordDarkOperationDiagnostics {
  constructor({registry=null,record=null}={}) { this.registry=registry; this.record=record||(()=>{}); }
  diagnose(operation) {
    if(!operation) throw new Error("operation is required.");
    if(typeof WordDarkDiagnosticReport==="undefined") throw new Error("WordDarkDiagnosticReport is required.");
    const report=new WordDarkDiagnosticReport({operationId:operation.operationId,scope:"OPERATION"});
    const events=this.registry&&typeof this.registry.getEvents==="function"?this.registry.getEvents(operation.operationId):[];
    const expected=["IDENTIFIED","AUTHORIZED","ROUTED","EXECUTING","VALIDATING","COMPLETED"];
    expected.forEach(stage=>{const event=events.find(item=>item.stage===stage); report.addCheck({component:stage,status:event?"ONLINE":(["REJECTED","BLOCKED","FAILED","CANCELLED"].includes(operation.status)?"NOT_TESTED":"UNKNOWN"),stage,message:event?"Etapa registrada.":"Etapa não registrada.",details:event?event.data:{}});});
    if(["REJECTED","BLOCKED","FAILED","CANCELLED"].includes(operation.status)){const e=events.slice().reverse().find(item=>["REJECTED","BLOCKED","FAILED","CANCELLED"].includes(item.stage)); const data=e?e.data:{}; report.addFailure({component:e?e.stage:"OPERATION",code:data.reason||"OPERATION_FAILED",stage:e?e.stage:null,message:data.reason||"A operação terminou sem conclusão.",evidence:{operationStatus:operation.status,events}});}
    report.metadata.operationStatus=operation.status; report.metadata.testedStages=events.map(e=>e.stage); report.finalize(); this.record(report); return report;
  }
}
if(typeof module!=="undefined") module.exports={WordDarkOperationDiagnostics:WordDarkOperationDiagnostics};
if(typeof window!=="undefined") window.WordDarkOperationDiagnostics=WordDarkOperationDiagnostics;
