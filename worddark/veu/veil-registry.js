import {VeilContract} from "./veil-contract.js";

export class VeilRegistry{
  constructor({audit=null}={}){this.id="VEIL-REGISTRY";this.veil=new VeilContract();this.audit=audit;this.zones=new Map();}
  registerZone({id,name,responsibility,status="READY"}={}){
    if(!id||!name)throw new Error("VEIL_ZONE_REQUIRED");
    const zone={id,name,responsibility,status};
    this.zones.set(id,zone);this.audit?.record?.("VEIL_ZONE_REGISTERED",zone);return structuredClone(zone);
  }
  listZones(){return [...this.zones.values()].map(structuredClone);}
  sanitizeForWorld(data){return this.veil.sanitize(data);}
  assertWorldSafe(data){
    if(this.veil.containsForbiddenMaterial(data))throw new Error("VEIL_BOUNDARY_VIOLATION");
    return true;
  }
  status(){return{...this.veil.status(),zones:this.zones.size};}
}
