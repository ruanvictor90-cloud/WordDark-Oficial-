export const ACCOUNT_OPERATIONS=Object.freeze(["CHARGE","RECEIVE","REFUND","PAYOUT","RECONCILE"]);

export function createAccountOperation({id,orderId,type,amount,currency="BRL",metadata={}}){
  if(!id||!orderId||!ACCOUNT_OPERATIONS.includes(type)||amount==null||amount<0)throw new Error("INVALID_ACCOUNT_OPERATION");
  return{id,orderId,type,amount,currency,metadata,status:"PENDING",history:[{status:"PENDING",at:new Date().toISOString()}]};
}

export function transitionAccountOperation(account,nextStatus,note=null){
  const allowed={PENDING:["PROCESSING","CANCELLED"],PROCESSING:["SETTLED","FAILED"],FAILED:["PROCESSING","CANCELLED"],SETTLED:["REFUNDED"],REFUNDED:[]};
  if(!account||!allowed[account.status]?.includes(nextStatus))throw new Error("INVALID_ACCOUNT_TRANSITION");
  return{...account,status:nextStatus,history:[...account.history,{status:nextStatus,note,at:new Date().toISOString()}]};
}

export function settleAccountOperation(account){
  return transitionAccountOperation(transitionAccountOperation(account,"PROCESSING"),"SETTLED");
}