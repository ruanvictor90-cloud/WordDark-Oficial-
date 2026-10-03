(function(global){
  "use strict";

  const COMPANY_AREAS=Object.freeze({
    EARTH:"EARTH",
    SKY:"SKY"
  });

  const COMPANY_STATUS=Object.freeze({
    PROPOSED:"PROPOSED",
    ACTIVE:"ACTIVE",
    PAUSED:"PAUSED",
    RETIRED:"RETIRED"
  });

  class WordDarkCompanyRegistry{
    constructor({companies=[],storage=null}={}){
      this.storage=storage || (typeof localStorage!=="undefined" ? localStorage : null);
      this.companies=Array.isArray(companies)?companies:[];
      this._load();
    }

    _load(){
      if(!this.storage)return;
      try{
        const raw=this.storage.getItem("wd.company.registry");
        if(raw)this.companies=JSON.parse(raw);
      }catch(_){}
    }

    _save(){
      if(!this.storage)return;
      try{this.storage.setItem("wd.company.registry",JSON.stringify(this.companies));}catch(_){}
    }

    register(company={}){
      if(!company.id)return{success:false,status:"COMPANY_ID_REQUIRED"};
      if(!company.name)return{success:false,status:"COMPANY_NAME_REQUIRED"};
      if(!Object.values(COMPANY_AREAS).includes(company.area))return{success:false,status:"COMPANY_AREA_REQUIRED"};

      const item={
        id:String(company.id),
        name:String(company.name),
        area:company.area,
        type:company.type||"OPERATING_COMPANY",
        status:company.status||COMPANY_STATUS.ACTIVE,
        capabilities:Array.isArray(company.capabilities)?company.capabilities:[],
        inputs:Array.isArray(company.inputs)?company.inputs:[],
        outputs:Array.isArray(company.outputs)?company.outputs:[],
        dependencies:Array.isArray(company.dependencies)?company.dependencies:[],
        createdAt:company.createdAt||new Date().toISOString()
      };

      const index=this.companies.findIndex(x=>x.id===item.id);
      if(index>=0)this.companies[index]={...this.companies[index],...item};
      else this.companies.push(item);

      this._save();
      return{success:true,status:"COMPANY_REGISTERED",company:item};
    }

    get(id){
      return this.companies.find(x=>x.id===String(id))||null;
    }

    list({area=null,status=null}={}){
      return this.companies.filter(x=>
        (!area||x.area===area)&&(!status||x.status===status)
      );
    }

    findCapability(capability){
      return this.companies.filter(x=>
        x.status===COMPANY_STATUS.ACTIVE &&
        (x.capabilities||[]).includes(capability)
      );
    }

    connect(companyId,targetId){
      const company=this.get(companyId);
      const target=this.get(targetId);
      if(!company||!target)return{success:false,status:"COMPANY_NOT_FOUND"};
      if(!company.dependencies.includes(target.id)){
        company.dependencies.push(target.id);
        this._save();
      }
      return{success:true,status:"COMPANIES_CONNECTED",from:company.id,to:target.id};
    }

    getStatus(){
      return{
        status:"READY",
        total:this.companies.length,
        active:this.companies.filter(x=>x.status===COMPANY_STATUS.ACTIVE).length,
        earth:this.list({area:COMPANY_AREAS.EARTH}).length,
        sky:this.list({area:COMPANY_AREAS.SKY}).length
      };
    }
  }

  if(typeof global!=="undefined"){
    global.WORDDARK_COMPANY_AREAS=COMPANY_AREAS;
    global.WORDDARK_COMPANY_STATUS=COMPANY_STATUS;
    global.WordDarkCompanyRegistry=WordDarkCompanyRegistry;
  }

  if(typeof module!=="undefined"&&module.exports){
    module.exports={WordDarkCompanyRegistry,COMPANY_AREAS,COMPANY_STATUS};
  }
})(typeof globalThis!=="undefined"?globalThis:window);
