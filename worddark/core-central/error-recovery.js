import { id } from "./id.js";

export class ErrorRecovery {
  constructor(){ this.errors=new Map(); }
  capture({operationId,stage,error,metadata={}}={}){
    const record={
      id:id("ERR"), operationId:operationId||null, stage:stage||"UNKNOWN",
      reason:error?.message||String(error||"UNKNOWN_ERROR"),
      metadata, status:"OPEN", createdAt:new Date().toISOString()
    };
    this.errors.set(record.id,record); return structuredClone(record);
  }
  analyze(errorId,analysis={}){
    const record=this.errors.get(errorId); if(!record) return null;
    Object.assign(record,{status:"ANALYZING",analysis,analyzedAt:new Date().toISOString()});
    return structuredClone(record);
  }
  resolve(errorId,solution){
    const record=this.errors.get(errorId); if(!record) return null;
    Object.assign(record,{status:"RESOLVED",solution,resolvedAt:new Date().toISOString()});
    return structuredClone(record);
  }
  cancel(errorId,reason){
    const record=this.errors.get(errorId); if(!record) return null;
    Object.assign(record,{status:"CANCELLED",cancelReason:reason||null,cancelledAt:new Date().toISOString()});
    return structuredClone(record);
  }
  get(errorId){ const record=this.errors.get(errorId); return record?structuredClone(record):null; }
  list(){ return [...this.errors.values()].map(structuredClone); }
}
