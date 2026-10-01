export class OperationDiagnostics {
  constructor({registry=null}={}){ this.registry=registry; }
  diagnose(operation){
    if(!operation) throw new Error("OPERATION_REQUIRED");
    const events=this.registry?.eventsOf?.(operation.id)||[];
    const failed=["REJECTED","BLOCKED","FAILED","CANCELLED"].includes(operation.status);
    return {
      id:`DIAG-${operation.id}`, operationId:operation.id, status:failed?"FAILED":"OK",
      operationStatus:operation.status,
      stages:events.map(event=>({type:event.type,at:event.at,data:event.data})),
      checkedAt:new Date().toISOString()
    };
  }
}
