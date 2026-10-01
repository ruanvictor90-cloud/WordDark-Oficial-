import { id } from "../../worddark/core-central/id.js";

export class Bairro {
  constructor({id: bairroId, name="Bairro", stateId, cityId, responsibility="NEEDS_MANAGEMENT"}={}) {
    this.id=bairroId||id("BAIRRO"); this.name=name; this.type="BAIRRO"; this.layer="TERRA";
    this.stateId=stateId||null; this.cityId=cityId||null; this.responsibility=responsibility;
    this.needs=[]; this.requests=[]; this.events=[];
  }
  addNeed(need={}) {
    if(!need.type) throw new Error("NEED_TYPE_REQUIRED");
    const entry={id:id("NEED"),...structuredClone(need),status:"PENDING",createdAt:new Date().toISOString()};
    this.needs.push(entry); this.record("NEED_CREATED",entry); return entry;
  }
  manageNeed(needId, status, data={}) {
    const need=this.needs.find(x=>x.id===needId); if(!need) return null;
    need.status=status; need.updatedAt=new Date().toISOString(); need.data={...(need.data||{}),...structuredClone(data)};
    this.record("NEED_UPDATED",need); return need;
  }
  registerRequest(request){this.requests.push(structuredClone(request));this.record("REQUEST_REGISTERED",request);return request;}
  record(type,data={}){const event={id:id("TERRA-EVT"),type,data:structuredClone(data),at:new Date().toISOString()};this.events.push(event);return event;}
  status(){return {id:this.id,name:this.name,type:this.type,stateId:this.stateId,cityId:this.cityId,responsibility:this.responsibility,needs:this.needs.length,requests:this.requests.length,events:this.events.length};}
}

export class Cidade {
  constructor({id:cityId,name="Cidade",countryId,stateId,bairro=null,gateId, responsibility="STATE_OPERATING_SYSTEM"}={}) {
    this.id=cityId||id("CIDADE"); this.name=name; this.type="CIDADE"; this.layer="TERRA";
    this.countryId=countryId||null; this.stateId=stateId||null; this.responsibility=responsibility;
    this.gateId=gateId||`${this.id}-GATE`; this.bairro=bairro||new Bairro({id:`${this.id}-BAIRRO`,name:"Bairro",stateId:this.stateId,cityId:this.id});
    this.operations=new Map(); this.results=new Map(); this.events=[]; this.runtime=null;
  }
  attachRuntime(runtime){this.runtime=runtime;return this;}
  receiveNeed(need){return this.bairro.addNeed(need);}
  requestService(service,payload={},context={}) {
    if(!service) throw new Error("SERVICE_REQUIRED");
    const request={id:id("REQ"),origin:this.id,destination:null,service,payload:structuredClone(payload),context:{...context,territory:{countryId:this.countryId,stateId:this.stateId,cityId:this.id}},gateId:this.gateId,status:"REQUESTED",createdAt:new Date().toISOString()};
    this.operations.set(request.id,request); this.bairro.registerRequest(request); this.record("SERVICE_REQUESTED",request);
    return request;
  }
  submit(request) {
    if(!this.runtime) throw new Error("RUNTIME_NOT_ATTACHED");
    const result=this.runtime.request(request); this.operations.set(request.id,result);
    this.record("REQUEST_SUBMITTED",{operationId:request.id,status:result.status});
    if(result.status==="COMPLETED") this.receiveResult(result);
    return result;
  }
  receiveResult(result) {
    const operationId=result?.id||result?.operationId; if(!operationId) throw new Error("RESULT_OPERATION_REQUIRED");
    this.results.set(operationId,structuredClone(result)); this.record("RESULT_RECEIVED",{operationId,result});
    return result;
  }
  record(type,data={}){const event={id:id("CITY-EVT"),type,data:structuredClone(data),at:new Date().toISOString()};this.events.push(event);return event;}
  status(){return {id:this.id,name:this.name,type:this.type,layer:this.layer,countryId:this.countryId,stateId:this.stateId,gateId:this.gateId,bairro:this.bairro.status(),operations:this.operations.size,results:this.results.size,events:this.events.length};}
}

export class Estado {
  constructor({id:stateId,name="Estado",countryId,city,identity,description="",status="ACTIVE"}={}) {
    this.id=stateId||id("ESTADO"); this.name=name; this.type="ESTADO"; this.layer="TERRA";
    this.countryId=countryId||null; this.identity=identity||this.id; this.description=description; this.status=status;
    this.city=city||null; this.events=[];
  }
  registerCity(city){if(!city?.id) throw new Error("CITY_INVALID"); this.city=city; return city;}
  record(type,data={}){const event={id:id("STATE-EVT"),type,data:structuredClone(data),at:new Date().toISOString()};this.events.push(event);return event;}
  statusData(){return {id:this.id,name:this.name,type:this.type,countryId:this.countryId,identity:this.identity,description:this.description,city:this.city?.status?.()||null,status:this.status};}
  status(){return this.statusData();}
}

export class Pais {
  constructor({id:countryId,name="País",description=""}={}) {this.id=countryId||id("PAIS");this.name=name;this.type="PAIS";this.layer="TERRA";this.description=description;this.states=new Map();this.events=[];}
  registerState(state){if(!state?.id) throw new Error("STATE_INVALID");if(state.countryId!==this.id) state.countryId=this.id;this.states.set(state.id,state);return state;}
  getState(stateId){return this.states.get(stateId)||null;}
  record(type,data={}){const event={id:id("COUNTRY-EVT"),type,data:structuredClone(data),at:new Date().toISOString()};this.events.push(event);return event;}
  status(){return {id:this.id,name:this.name,type:this.type,layer:this.layer,states:[...this.states.values()].map(x=>x.status())};}
}

export class Terra {
  constructor(){this.countries=new Map();this.events=[];this.runtime=null;}
  attachRuntime(runtime){this.runtime=runtime;for(const country of this.countries.values())this._attachCountry(country);return this;}
  registerCountry(country){if(!country?.id) throw new Error("COUNTRY_INVALID");this.countries.set(country.id,country);this._attachCountry(country);return country;}
  _attachCountry(country){
    for(const state of country.states.values()){
      state.city?.attachRuntime?.(this.runtime);
      if(this.runtime && state.city?.gateId && !this.runtime.gates.has(state.city.gateId)) this.runtime.registerGate({gateId:state.city.gateId,ownerId:state.city.id,layer:"TERRA"});
      this.runtime?.registry?.register?.({id:state.city.id,type:"CIDADE",layer:"TERRA",owner:state.id,countryId:country.id});
    }
  }
  record(type,data={}){const event={id:id("TERRA-EVT"),type,data:structuredClone(data),at:new Date().toISOString()};this.events.push(event);return event;}
  status(){return {name:"Terra",layer:"TERRA",countries:[...this.countries.values()].map(x=>x.status()),events:this.events.length};}
}
