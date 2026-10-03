(function(global){
  "use strict";

  const COMPANY_TYPES = Object.freeze({
    DIGITAL_OPERATIONS: "DIGITAL_OPERATIONS_COMPANY"
  });

  const ACCOUNT_STATES = Object.freeze({
    PLANNED: "PLANNED",
    READY: "READY",
    CONNECTED: "CONNECTED",
    PAUSED: "PAUSED",
    CLOSED: "CLOSED"
  });

  class DigitalOperationsCompany {
    constructor({
      companyId="WD-OPS-001",
      displayName="Empresa de Operação Digital",
      type=COMPANY_TYPES.DIGITAL_OPERATIONS,
      storage=null
    }={}){
      this.companyId=companyId;
      this.displayName=displayName;
      this.type=type;
      this.storage=storage || (typeof localStorage!=="undefined" ? localStorage : null);
      this.state={
        countries:[],
        clients:[],
        accounts:[],
        operations:[]
      };
      this._load();
    }

    _load(){
      if(!this.storage)return;
      try{
        const raw=this.storage.getItem("wd.digital.operations.company");
        if(raw)this.state={...this.state,...JSON.parse(raw)};
      }catch(_){}
    }

    _save(){
      if(!this.storage)return;
      try{
        this.storage.setItem("wd.digital.operations.company",JSON.stringify(this.state));
      }catch(_){}
    }

    registerCountry(country){
      if(!country || !country.id) return {success:false,status:"COUNTRY_ID_REQUIRED"};
      const item={
        id:String(country.id),
        name:country.name||country.id,
        status:country.status||"ACTIVE",
        states:Array.isArray(country.states)?country.states:[],
        companyId:this.companyId
      };
      const index=this.state.countries.findIndex(x=>x.id===item.id);
      if(index>=0)this.state.countries[index]={...this.state.countries[index],...item};
      else this.state.countries.push(item);
      this._save();
      return {success:true,status:"COUNTRY_REGISTERED",country:item};
    }

    registerClient(client){
      if(!client || !client.id)return {success:false,status:"CLIENT_ID_REQUIRED"};
      const item={
        id:String(client.id),
        name:client.name||client.id,
        status:client.status||"ACTIVE",
        countries:Array.isArray(client.countries)?client.countries:[],
        createdAt:client.createdAt||new Date().toISOString()
      };
      const index=this.state.clients.findIndex(x=>x.id===item.id);
      if(index>=0)this.state.clients[index]={...this.state.clients[index],...item};
      else this.state.clients.push(item);
      this._save();
      return {success:true,status:"CLIENT_REGISTERED",client:item};
    }

    registerAccount(account){
      if(!account || !account.id)return {success:false,status:"ACCOUNT_ID_REQUIRED"};
      if(!account.clientId)return {success:false,status:"CLIENT_ID_REQUIRED"};
      const item={
        id:String(account.id),
        clientId:String(account.clientId),
        providerId:account.providerId||null,
        displayName:account.displayName||account.id,
        handle:account.handle||"",
        state:account.state||ACCOUNT_STATES.PLANNED,
        capabilities:Array.isArray(account.capabilities)?account.capabilities:[],
        createdAt:account.createdAt||new Date().toISOString()
      };
      const index=this.state.accounts.findIndex(x=>x.id===item.id);
      if(index>=0)this.state.accounts[index]={...this.state.accounts[index],...item};
      else this.state.accounts.push(item);
      this._save();
      return {success:true,status:"ACCOUNT_REGISTERED",account:item};
    }

    createOperation(operation){
      if(!operation || !operation.id)return {success:false,status:"OPERATION_ID_REQUIRED"};
      const item={
        id:String(operation.id),
        clientId:operation.clientId||null,
        accountId:operation.accountId||null,
        type:operation.type||"CONTENT_OPERATION",
        status:operation.status||"REQUESTED",
        origin:operation.origin||null,
        destination:operation.destination||null,
        contentId:operation.contentId||null,
        createdAt:operation.createdAt||new Date().toISOString()
      };
      this.state.operations.push(item);
      this._save();
      return {success:true,status:"OPERATION_CREATED",operation:item};
    }

    list(){
      return {
        company:{id:this.companyId,name:this.displayName,type:this.type},
        countries:[...this.state.countries],
        clients:[...this.state.clients],
        accounts:[...this.state.accounts],
        operations:[...this.state.operations]
      };
    }

    getStatus(){
      return {
        status:"READY",
        companyId:this.companyId,
        type:this.type,
        countries:this.state.countries.length,
        clients:this.state.clients.length,
        accounts:this.state.accounts.length,
        operations:this.state.operations.length
      };
    }
  }

  if(typeof global!=="undefined"){
    global.DIGITAL_OPERATIONS_COMPANY_TYPES=COMPANY_TYPES;
    global.DIGITAL_ACCOUNT_STATES=ACCOUNT_STATES;
    global.DigitalOperationsCompany=DigitalOperationsCompany;
  }
  if(typeof module!=="undefined" && module.exports){
    module.exports={DigitalOperationsCompany,COMPANY_TYPES,ACCOUNT_STATES};
  }
})(typeof globalThis!=="undefined" ? globalThis : window);
