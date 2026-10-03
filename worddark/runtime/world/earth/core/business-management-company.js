/* WordDark — Business Management Company
 * Empresa responsável por fazer o negócio operar.
 */
(function(global){
  "use strict";

  class BusinessManagementCompany{
    constructor({companyId="WD-COMP-BUSINESS-MGMT",displayName="Empresa de Gestão de Negócios",storage=null}={}){
      this.companyId=companyId;
      this.displayName=displayName;
      this.storage=storage||(typeof localStorage!=="undefined"?localStorage:null);
      this.state={businesses:[],needs:[],operations:[]};
      this._load();
    }

    _load(){
      if(!this.storage)return;
      try{const raw=this.storage.getItem("wd.business.management.company");if(raw)this.state={...this.state,...JSON.parse(raw)};}catch(_){}
    }

    _save(){
      if(!this.storage)return;
      try{this.storage.setItem("wd.business.management.company",JSON.stringify(this.state));}catch(_){}
    }

    registerBusiness(business={}){
      if(!business.id)return{success:false,status:"BUSINESS_ID_REQUIRED"};
      const item={id:String(business.id),name:business.name||business.id,model:business.model||null,products:Array.isArray(business.products)?business.products:[],status:business.status||"ACTIVE",createdAt:business.createdAt||new Date().toISOString()};
      const i=this.state.businesses.findIndex(x=>x.id===item.id);
      if(i>=0)this.state.businesses[i]={...this.state.businesses[i],...item};else this.state.businesses.push(item);
      this._save();
      return{success:true,status:"BUSINESS_REGISTERED",business:item};
    }

    createNeed({businessId,productId=null,need="Como fazemos este negócio operar?",intent="SELL_MORE",objective=null,context=null}={}){
      if(!businessId)return{success:false,status:"BUSINESS_ID_REQUIRED"};
      const item={id:"NEED-"+Date.now(),businessId:String(businessId),productId,intent,need,objective,context,status:"CREATED",createdAt:new Date().toISOString()};
      this.state.needs.push(item);this._save();
      return{success:true,status:"BUSINESS_NEED_CREATED",need:item};
    }

    requestMoreSales({businessId,productId,objective="Vender mais o produto",audience=null,context=null}={}){
      return this.createNeed({
        businessId,productId,intent:"SELL_MORE",
        need:"Temos este produto. Como fazemos para vender mais?",
        objective,context:{...context,audience}
      });
    }

    createOperation(operation={}){
      if(!operation.id)return{success:false,status:"OPERATION_ID_REQUIRED"};
      const item={...operation,id:String(operation.id),sourceCompanyId:this.companyId,status:operation.status||"REQUESTED",createdAt:operation.createdAt||new Date().toISOString()};
      this.state.operations.push(item);this._save();
      return{success:true,status:"BUSINESS_OPERATION_CREATED",operation:item};
    }

    list(){return{company:{id:this.companyId,name:this.displayName},businesses:[...this.state.businesses],needs:[...this.state.needs],operations:[...this.state.operations]};}
    getStatus(){return{status:"READY",companyId:this.companyId,businesses:this.state.businesses.length,needs:this.state.needs.length,operations:this.state.operations.length};}
  }

  if(typeof global!=="undefined")global.BusinessManagementCompany=BusinessManagementCompany;
  if(typeof module!=="undefined"&&module.exports)module.exports=BusinessManagementCompany;
})(typeof globalThis!=="undefined"?globalThis:window);
