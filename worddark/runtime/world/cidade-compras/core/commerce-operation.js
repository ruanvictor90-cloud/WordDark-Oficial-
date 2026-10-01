export function createCommerceOperation({id,type,source,customerId=null,orderId=null,payload={}}){
  if(!id || !type || !source) throw new Error("INVALID_COMMERCE_OPERATION");
  return {id,type,source,customerId,orderId,payload,status:"RECEIVED",history:[]};
}

export function transitionOperation(operation,nextStatus,note=null){
  return {...operation,status:nextStatus,history:[...operation.history,{status:nextStatus,note,at:new Date().toISOString()}]};
}
