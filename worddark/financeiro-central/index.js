/* WordDark — Financial Compatibility Facade
 * Mantém a API histórica e aponta o mundo para o motor financeiro central.
 */
export { WordDarkFinancialEngine } from "./runtime/financial-engine.js";

export class CentralFinance {
  constructor(options={}){this.engine=options.engine||new WordDarkFinancialEngine(options);}
  registerAccount(account){return this.engine.registerAccount(account);}
  move(movement){
    return this.engine.post({
      accountId:movement.accountId||movement.ownerId,
      type:movement.type||"MOVEMENT",
      amount:movement.amount,
      description:movement.description||"",
      referenceId:movement.id||null,
      metadata:movement
    });
  }
  setStatus(movementId,status){
    const entry=this.engine.listEntries().find(x=>x.id===movementId||x.referenceId===movementId);
    if(!entry)return null;
    return {...entry,status};
  }
  listByOwner(ownerId){
    const accounts=[...this.engine.accounts.values()].filter(x=>x.ownerId===ownerId).map(x=>x.id);
    return this.engine.entries.filter(x=>accounts.includes(x.accountId));
  }
  balance(ownerId){
    return this.listByOwner(ownerId).reduce((sum,m)=>sum+Number(m.amount||0),0);
  }
}
