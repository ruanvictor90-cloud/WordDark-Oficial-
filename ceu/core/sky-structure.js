import { id } from "../../worddark/core-central/id.js";

export class SkyDistrict {
  constructor({id:districtId=id("DISTRICT"),name,type="DISTRITO",nucleusId}={}) {
    this.id=districtId;this.name=name;this.type=type;this.nucleusId=nucleusId;this.needs=[];this.requests=[];this.events=[];
  }
  addNeed(need){const entry={id:id("NEED"),...need,status:"PENDING",at:new Date().toISOString()};this.needs.push(entry);return entry;}
  request(service,payload={}){const request={id:id("REQ"),origin:this.id,service,payload,status:"REQUESTED",at:new Date().toISOString()};this.requests.push(request);return request;}
  record(type,data={}){const event={id:id("EVT"),type,data,at:new Date().toISOString()};this.events.push(event);return event;}
}

export class SkyNucleus {
  constructor({id:nucleusId=id("NUCLEUS"),name,regionId}={}) {
    this.id=nucleusId;this.name=name;this.type="NÚCLEO";this.regionId=regionId;this.districts=new Map();this.status="ACTIVE";
  }
  registerDistrict(district){this.districts.set(district.id,district);return district;}
  createDistrict(config){return this.registerDistrict(new SkyDistrict({...config,nucleusId:this.id}));}
  status(){return {id:this.id,name:this.name,type:this.type,regionId:this.regionId,districts:[...this.districts.values()].map(d=>({id:d.id,name:d.name}))};}
}

export class SkyRegion {
  constructor({id:regionId=id("REGION"),name,domainId}={}) {
    this.id=regionId;this.name=name;this.type="REGIÃO";this.domainId=domainId;this.nuclei=new Map();this.status="ACTIVE";
  }
  registerNucleus(nucleus){this.nuclei.set(nucleus.id,nucleus);return nucleus;}
  createNucleus(config){return this.registerNucleus(new SkyNucleus({...config,regionId:this.id}));}
  status(){return {id:this.id,name:this.name,type:this.type,domainId:this.domainId,nuclei:[...this.nuclei.values()].map(n=>n.status())};}
}

export class SkyDomain {
  constructor({id:domainId,name,owner=null}={}) {
    this.id=domainId;this.name=name;this.type="DOMÍNIO";this.owner=owner;this.regions=new Map();this.gateId=`${domainId}-GATE`;this.status="ACTIVE";
  }
  registerRegion(region){this.regions.set(region.id,region);return region;}
  createRegion(config){return this.registerRegion(new SkyRegion({...config,domainId:this.id}));}
  status(){return {id:this.id,name:this.name,type:this.type,regions:[...this.regions.values()].map(r=>r.status())};}
}
