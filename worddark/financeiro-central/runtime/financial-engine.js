/* WordDark — Central Financial Engine
 * Motor econômico compartilhado do mundo.
 * Registra recursos, movimentos, planos e estado financeiro sem depender de uma UI.
 */
(function(global){
  "use strict";

  class WordDarkFinancialEngine{
    constructor({storage=null,currency="BRL"}={}){
      this.storage=storage||((typeof localStorage!=="undefined")?localStorage:null);
      this.currency=currency;
      this.accounts=new Map();
      this.entries=[];
      this.plans=new Map();
      this._load();
    }
    _load(){
      if(!this.storage)return;
      try{
        const s=JSON.parse(this.storage.getItem("wd.financial.engine")||"{}");
        (s.accounts||[]).forEach(x=>this.accounts.set(x.id,x));
        this.entries=s.entries||[];
        (s.plans||[]).forEach(x=>this.plans.set(x.id,x));
      }catch(_){}
    }
    _save(){
      if(!this.storage)return;
      try{this.storage.setItem("wd.financial.engine",JSON.stringify({
        accounts:[...this.accounts.values()],entries:this.entries,plans:[...this.plans.values()]
      }));}catch(_){}
    }
    registerAccount({id,name,ownerId,type="OPERATIONAL",currency=this.currency}={}){
      if(!id||!name)return{success:false,status:"ACCOUNT_REQUIRED"};
      const account={id,name,ownerId:ownerId||null,type,currency,status:"ACTIVE",createdAt:new Date().toISOString()};
      this.accounts.set(id,account);this._save();return{success:true,status:"ACCOUNT_REGISTERED",account};
    }
    post({accountId,type,amount,description="",referenceId=null,metadata={}}={}){
      const account=this.accounts.get(accountId);
      const value=Number(amount);
      if(!account)return{success:false,status:"ACCOUNT_NOT_FOUND"};
      if(!Number.isFinite(value)||value===0)return{success:false,status:"AMOUNT_INVALID"};
      const entry={id:"FIN-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,7).toUpperCase(),accountId,type:String(type||"MOVEMENT").toUpperCase(),amount:value,description,referenceId,metadata,createdAt:new Date().toISOString()};
      this.entries.push(entry);this._save();return{success:true,status:"ENTRY_POSTED",entry};
    }
    balance(accountId){
      return this.entries.filter(e=>e.accountId===accountId).reduce((sum,e)=>sum+Number(e.amount||0),0);
    }
    createPlan({id,name,price,period="MONTHLY",features=[],status="ACTIVE"}={}){
      if(!id||!name)return{success:false,status:"PLAN_REQUIRED"};
      const plan={id,name,price:Number(price||0),currency:this.currency,period,features,status,createdAt:new Date().toISOString()};
      this.plans.set(id,plan);this._save();return{success:true,status:"PLAN_CREATED",plan};
    }
    listPlans(){return [...this.plans.values()];}
    subscribe({subscriptionId,ownerId,planId,status="ACTIVE"}={}){
      const plan=this.plans.get(planId);
      if(!plan)return{success:false,status:"PLAN_NOT_FOUND"};
      const subscription={subscriptionId,ownerId,planId,status,price:plan.price,currency:plan.currency,period:plan.period,startedAt:new Date().toISOString()};
      this.post({accountId:ownerId,type:"SUBSCRIPTION",amount:-plan.price,description:"Plano WordDark",referenceId:subscriptionId,metadata:{planId}});
      return{success:true,status:"SUBSCRIPTION_ACTIVE",subscription};
    }
    listEntries(accountId=null){return this.entries.filter(e=>!accountId||e.accountId===accountId);}
  }

  if(typeof global!=="undefined")global.WordDarkFinancialEngine=WordDarkFinancialEngine;
  if(typeof module!=="undefined"&&module.exports)module.exports=WordDarkFinancialEngine;
})(typeof globalThis!=="undefined"?globalThis:window);
