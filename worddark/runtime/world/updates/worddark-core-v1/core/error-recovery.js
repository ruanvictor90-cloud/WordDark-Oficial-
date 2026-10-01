/* WordDark Lab — Error and recovery lifecycle */
class WordDarkLabErrorRecovery {
  constructor(){this.errors=[];}
  capture(operation,error,stage){const record={errorId:"WD-ERR-"+Date.now().toString(36).toUpperCase(),operationId:operation.operationId,stage,reason:error&&error.message||String(error),timestamp:new Date().toISOString(),status:"OPEN"};this.errors.push(record);operation.addHistory("ERROR_CAPTURED",record);return record;}
  analyze(record){record.status="ANALYZING";record.analyzedAt=new Date().toISOString();return record;}
  resolve(record,solution){record.status="RESOLVED";record.solution=solution;record.resolvedAt=new Date().toISOString();return record;}
  cancel(record,reason){record.status="CANCELLED";record.cancelReason=reason;return record;}
  requeue(operation,record){record.status="REQUEUED";operation.transition("REQUEUED",{errorId:record.errorId});return operation;}
  list(){return [...this.errors];}
}
if(typeof module!=="undefined")module.exports=WordDarkLabErrorRecovery;
if(typeof window!=="undefined")window.WordDarkLabErrorRecovery=WordDarkLabErrorRecovery;
