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
        channels:[],
        requests:[],
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

    onboardClient({clientId,name,countries=[]}={}){
      const result=this.registerClient({id:clientId,name,countries});
      if(!result.success)return result;
      return {success:true,status:"CLIENT_ONBOARDED",client:result.client};
    }

    updateAccount(accountId,patch={}){
      const index=this.state.accounts.findIndex(x=>x.id===String(accountId));
      if(index<0)return {success:false,status:"ACCOUNT_NOT_FOUND"};
      this.state.accounts[index]={...this.state.accounts[index],...patch,id:String(accountId)};
      this._save();
      return {success:true,status:"ACCOUNT_UPDATED",account:this.state.accounts[index]};
    }

    openAccount({clientId,accountId,providerId,displayName,handle="",capabilities=[]}={}){
      return this.registerAccount({
        id:accountId,
        clientId,
        providerId,
        displayName,
        handle,
        capabilities,
        state:ACCOUNT_STATES.PLANNED
      });
    }

    registerChannel(channel={}){
      if(!channel.id)return{success:false,status:"CHANNEL_ID_REQUIRED"};
      const item={
        id:String(channel.id),
        clientId:channel.clientId||null,
        accountId:channel.accountId||null,
        name:channel.name||channel.id,
        platform:channel.platform||null,
        mode:channel.mode||"MANAGED",
        autonomy:channel.autonomy||"ASSISTED",
        status:channel.status||"PLANNED",
        workflow:channel.workflow||"CONTENT_TO_PUBLICATION",
        createdAt:channel.createdAt||new Date().toISOString()
      };
      const index=this.state.channels.findIndex(x=>x.id===item.id);
      if(index>=0)this.state.channels[index]={...this.state.channels[index],...item};
      else this.state.channels.push(item);
      this._save();
      return{success:true,status:"CHANNEL_REGISTERED",channel:item};
    }

    receiveCompanyRequest({requestId,requesterCompanyId,clientId=null,accountId=null,channelId=null,requestType="CONTENT_REQUEST",brief="",audience=null,publication=null,priority="NORMAL",origin=null}={}){
      const id=String(requestId||("REQ-"+Date.now()));
      const request={
        id,
        requesterCompanyId:requesterCompanyId||null,
        clientId,
        accountId,
        channelId,
        requestType,
        brief,
        audience,
        publication:publication||null,
        priority,
        origin,
        status:"RECEIVED",
        createdAt:new Date().toISOString()
      };
      const index=this.state.requests.findIndex(x=>x.id===id);
      if(index>=0)this.state.requests[index]={...this.state.requests[index],...request};
      else this.state.requests.push(request);
      this._save();
      return{success:true,status:"COMPANY_REQUEST_RECEIVED",request};
    }

    requestContent({clientId,accountId,contentId,type="CONTENT_CREATE",origin=null,destination=null,requesterCompanyId=null,brief="",audience=null,publication=null}={}){
      const request=this.receiveCompanyRequest({
        requestId:"CONTENT-"+String(contentId||Date.now()),
        requesterCompanyId,
        clientId,
        accountId,
        requestType:type,
        brief,
        audience,
        publication,
        origin
      });
      if(!request.success)return request;
      return this.createOperation({
        id:request.request.id,
        clientId,
        accountId,
        channelId:null,
        type,
        status:"REQUESTED",
        origin,
        destination,
        contentId,
        requesterCompanyId,
        audience,
        publication,
        requestId:request.request.id
      });
    }

    requestContentIdea({requesterCompanyId,clientId,accountId,brief="",product=null,audience=null,origin=null}={}){
      return this.requestContent({
        requesterCompanyId,
        clientId,
        accountId,
        contentId:"IDEA-"+Date.now(),
        type:"CONTENT_IDEA",
        brief:product?brief+" | PRODUCT: "+product:brief,
        audience,
        origin
      });
    }

    requestPromotionContent({requesterCompanyId,clientId,accountId,brief="",product=null,audience=null,publication=null,origin=null}={}){
      return this.requestContent({
        requesterCompanyId,
        clientId,
        accountId,
        contentId:"PROMO-"+Date.now(),
        type:"PROMOTION_CONTENT",
        brief:product?brief+" | PRODUCT: "+product:brief,
        audience,
        publication,
        origin
      });
    }

    startAutonomousChannel({channelId,clientId,accountId,name,platform,autonomy="AUTONOMOUS"}={}){
      const result=this.registerChannel({
        id:channelId,
        clientId,
        accountId,
        name,
        platform,
        autonomy,
        mode:"AUTONOMOUS",
        status:"ACTIVE"
      });
      if(!result.success)return result;
      return this.createOperation({
        id:"CHANNEL-START-"+String(channelId),
        type:"AUTONOMOUS_CHANNEL_START",
        status:"REQUESTED",
        clientId,
        accountId,
        channelId,
        origin:"world/earth/digital-operations",
        destination:null
      });
    }

    requestPublication({clientId,accountId,contentId,providerId}={}){
      return this.createOperation({
        id:"PUBLISH-"+String(contentId||Date.now()),
        clientId,
        accountId,
        type:"CONTENT_PUBLISH",
        status:"REQUESTED",
        origin:"world/earth/digital-operations",
        destination:"world/sky/connections",
        contentId,
        providerId
      });
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
        requesterCompanyId:operation.requesterCompanyId||null,
        requestId:operation.requestId||null,
        channelId:operation.channelId||null,
        audience:operation.audience||null,
        publication:operation.publication||null,
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
        channels:[...this.state.channels],
        requests:[...this.state.requests],
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
        channels:this.state.channels.length,
        requests:this.state.requests.length,
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
