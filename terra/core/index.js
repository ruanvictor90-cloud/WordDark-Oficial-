import { id } from "../../worddark/core-central/id.js";
import { REQUIREMENT_TYPES, PROFILE_STATUS } from "../../worddark/core-central/channel-contract.js";

export class Bairro {
  constructor({id: bairroId, name="Bairro", stateId, cityId, responsibility="NEEDS_MANAGEMENT"}={}) {
    this.id=bairroId||id("BAIRRO"); this.name=name; this.type="BAIRRO"; this.layer="TERRA";
    this.stateId=stateId||null; this.cityId=cityId||null; this.responsibility=responsibility;
    this.needs=[]; this.requests=[]; this.events=[];
  }
  addNeed(need={}) {
    if(!need.type) throw new Error("NEED_TYPE_REQUIRED");
    if(!need.requester?.id) throw new Error("NEED_REQUESTER_REQUIRED");
    if(need.requester.type!=="SOCIAL_CHANNEL") throw new Error("NEED_REQUESTER_TYPE_INVALID");
    if(!need.requester.network) throw new Error("NEED_NETWORK_REQUIRED");
    if(!REQUIREMENT_TYPES.includes(need.type)) throw new Error("NEED_CONTENT_TYPE_INVALID");
    if(!need.description) throw new Error("NEED_DESCRIPTION_REQUIRED");
    const entry={id:id("NEED"),type:need.type,status:"PENDING",createdAt:new Date().toISOString(),requester:structuredClone(need.requester),description:need.description,priority:need.priority||"NORMAL",data:structuredClone(need.data||{})};
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
    this.operations=new Map(); this.results=new Map(); this.managedProfiles=new Set(); this.events=[]; this.runtime=null;
  }
  attachRuntime(runtime){this.runtime=runtime;return this;}
  attachProfile(profileId){if(!profileId) throw new Error("PROFILE_ID_REQUIRED");this.managedProfiles.add(profileId);return profileId;}
  listManagedProfiles(){return [...this.managedProfiles];}
  receiveNeed(need){return this.bairro.addNeed(need);}
  createRequirement(requirement){return this.receiveNeed(requirement);}

  createOperationFromNeed(needId) {
    const need=this.bairro.needs.find(x=>x.id===needId);
    if(!need) throw new Error("NEED_NOT_FOUND");
    if(!["PENDING","OPEN"].includes(need.status)) throw new Error("NEED_NOT_AVAILABLE");
    const service=need.type==="IMAGE" ? "IMAGE" : "VIDEO";
    const request=this.requestService(service,{
      taskType:need.type,
      contentType:need.type,
      description:need.description,
      priority:need.priority,
      requester:structuredClone(need.requester),
      data:structuredClone(need.data||{})
    },{
      needId:need.id,
      requesterId:need.requester.id,
      requesterType:need.requester.type,
      network:need.requester.network,
      channelId:need.requester.channelId||need.requester.id
    });
    this.bairro.manageNeed(need.id,"IN_OPERATION",{operationId:request.id});
    return request;
  }

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
  status(){return {id:this.id,name:this.name,type:this.type,layer:this.layer,countryId:this.countryId,stateId:this.stateId,gateId:this.gateId,managedProfiles:this.managedProfiles.size,bairro:this.bairro.status(),operations:this.operations.size,results:this.results.size,events:this.events.length};}
}

export class Estado {
  constructor({id:stateId,name="Estado",countryId,city,identity,description="",status="ACTIVE"}={}) {
    this.id=stateId||id("ESTADO"); this.name=name; this.type="ESTADO"; this.layer="TERRA";
    this.countryId=countryId||null; this.identity=identity||this.id; this.description=description; this.stateStatus=status; this.contractType="CHANNEL";
    this.city=city||null; this.events=[];
  }
  registerCity(city){if(!city?.id) throw new Error("CITY_INVALID"); this.city=city; return city;}
  record(type,data={}){const event={id:id("STATE-EVT"),type,data:structuredClone(data),at:new Date().toISOString()};this.events.push(event);return event;}
  statusData(){return {id:this.id,name:this.name,type:this.type,countryId:this.countryId,identity:this.identity,description:this.description,contractType:this.contractType,city:this.city?.status?.()||null,status:this.stateStatus};}
  status(){return this.statusData();}
}

export class Pais {
  constructor({id:countryId,name="País",description=""}={}) {this.id=countryId||id("PAIS");this.name=name;this.type="PAIS";this.layer="TERRA";this.description=description;this.states=new Map();this.profiles=new Map();this.events=[];}
  registerState(state){if(!state?.id) throw new Error("STATE_INVALID");if(state.countryId!==this.id) state.countryId=this.id;this.states.set(state.id,state);return state;}
  getState(stateId){return this.states.get(stateId)||null;}
  registerProfile(profile={}) {
    if(!profile.id) throw new Error("PROFILE_ID_REQUIRED");
    if(!profile.network) throw new Error("PROFILE_NETWORK_REQUIRED");
    if(profile.countryId && profile.countryId!==this.id) throw new Error("PROFILE_COUNTRY_INVALID");
    const state=this.getState(profile.stateId);
    if(!state) throw new Error("PROFILE_STATE_NOT_FOUND");
    if(profile.managerCityId && profile.managerCityId!==state.city?.id) throw new Error("PROFILE_MANAGER_CITY_INVALID");
    const entry={
      id:profile.id,
      network:profile.network,
      handle:profile.handle||null,
      displayName:profile.displayName||profile.handle||profile.id,
      status:profile.status||"CONNECTED",
      countryId:this.id,
      stateId:state.id,
      managerCityId:profile.managerCityId||state.city?.id||null,
      config:structuredClone(profile.config||{})
    };
    this.profiles.set(entry.id,entry);
    state.city?.attachProfile?.(entry.id);
    this.record("PROFILE_CONNECTED",entry);
    return entry;
  }
  getProfile(profileId){return this.profiles.get(profileId)||null;}
  listProfiles(){return [...this.profiles.values()].map(structuredClone);}
  record(type,data={}){const event={id:id("COUNTRY-EVT"),type,data:structuredClone(data),at:new Date().toISOString()};this.events.push(event);return event;}
  status(){return {id:this.id,name:this.name,type:this.type,layer:this.layer,states:[...this.states.values()].map(x=>x.status()),profiles:this.profiles.size};}
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
