export class CentralFinance {
  constructor(){this.accounts=new Map();this.movements=[];this.pending=[];}
  registerAccount(account){
    if(!account?.id||!account.ownerId)throw new Error("ACCOUNT_INVALID");
    this.accounts.set(account.id,{...account});return this.accounts.get(account.id);
  }
  move(movement){
    if(!movement?.id||!movement.ownerId||movement.amount==null)throw new Error("MOVEMENT_INVALID");
    const entry={...movement,status:movement.status||"PENDING",at:new Date().toISOString()};
    this.movements.push(entry);
    if(entry.status==="PENDING")this.pending.push(entry.id);
    return entry;
  }
  setStatus(movementId,status){
    const movement=this.movements.find(x=>x.id===movementId);
    if(!movement)throw new Error("MOVEMENT_NOT_FOUND");
    movement.status=status;
    this.pending=this.pending.filter(x=>x!==movementId);
    return movement;
  }
  listByOwner(ownerId){return this.movements.filter(x=>x.ownerId===ownerId);}
  balance(ownerId){return this.listByOwner(ownerId).reduce((sum,m)=>sum+(m.status==="AVAILABLE"?Number(m.amount):0),0);}
}
