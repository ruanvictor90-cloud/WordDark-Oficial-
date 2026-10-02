export class RollbackManager{
  constructor({audit=null}={}){this.snapshots=new Map();this.audit=audit;}
  capture({operationId,moduleId,state,undo=null}={}){
    if(!operationId||!moduleId)throw new Error("ROLLBACK_FIELDS_REQUIRED");
    const key=operationId+"::"+moduleId;
    const snapshot={operationId,moduleId,state:structuredClone(state),undoable:typeof undo==="function",createdAt:new Date().toISOString()};
    this.snapshots.set(key,{snapshot,undo});this.audit?.record?.("ROLLBACK_CAPTURED",snapshot);return structuredClone(snapshot);
  }
  rollback(operationId,moduleId){
    const item=this.snapshots.get(operationId+"::"+moduleId);if(!item)return{success:false,reason:"ROLLBACK_SNAPSHOT_NOT_FOUND"};
    if(typeof item.undo!=="function")return{success:false,reason:"ROLLBACK_NOT_AVAILABLE",snapshot:structuredClone(item.snapshot)};
    const result=item.undo(structuredClone(item.snapshot.state));
    this.audit?.record?.("ROLLBACK_EXECUTED",{operationId,moduleId,result});
    return{success:true,result};
  }
  available(operationId,moduleId){const item=this.snapshots.get(operationId+"::"+moduleId);return Boolean(item?.snapshot?.undoable);}
  list(){return [...this.snapshots.values()].map(x=>structuredClone(x.snapshot));}
}
