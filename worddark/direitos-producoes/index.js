import { id } from "../core-central/id.js";

export const RIGHTS_STATUS=Object.freeze({
  PENDING:"PENDING", CLEARED:"CLEARED", BLOCKED:"BLOCKED", EXPIRED:"EXPIRED", REVIEW:"REVIEW"
});

export class ProductionRights {
  constructor(){ this.records=new Map(); this.events=[]; }

  registerProduction({productionId,title,ownerId,createdBy=null}={}){
    if(!productionId||!ownerId) throw new Error("PRODUCTION_ID_AND_OWNER_REQUIRED");
    const record={
      id:id("RIGHTS"), productionId, title:title||productionId, ownerId,
      createdBy, status:RIGHTS_STATUS.PENDING, assets:[], licenses:[],
      credits:[], restrictions:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()
    };
    this.records.set(productionId,record); this.#event("PRODUCTION_REGISTERED",record);
    return structuredClone(record);
  }

  addAsset(productionId,{assetId,type,source="UNKNOWN",ownerId=null,rightsStatus=RIGHTS_STATUS.REVIEW,licenseId=null,restrictions=[]}={}){
    const record=this.#get(productionId);
    if(!assetId||!type) throw new Error("ASSET_ID_AND_TYPE_REQUIRED");
    const asset={assetId,type,source,ownerId,rightsStatus,licenseId,restrictions:[...restrictions],addedAt:new Date().toISOString()};
    record.assets.push(asset); this.#touch(record); this.#event("ASSET_REGISTERED",{productionId,asset});
    this.recalculate(productionId); return structuredClone(asset);
  }

  addLicense(productionId,{licenseId,assetId,grantedBy,scope=[],expiresAt=null,terms=null}={}){
    const record=this.#get(productionId);
    if(!licenseId||!assetId||!grantedBy) throw new Error("LICENSE_FIELDS_REQUIRED");
    const license={licenseId,assetId,grantedBy,scope:[...scope],expiresAt,terms,status:"ACTIVE",createdAt:new Date().toISOString()};
    record.licenses.push(license); this.#touch(record); this.#event("LICENSE_REGISTERED",{productionId,license});
    this.recalculate(productionId); return structuredClone(license);
  }

  addCredit(productionId,credit){
    const record=this.#get(productionId);
    if(!credit?.name) throw new Error("CREDIT_NAME_REQUIRED");
    record.credits.push({...structuredClone(credit),createdAt:new Date().toISOString()});
    this.#touch(record); this.#event("CREDIT_REGISTERED",{productionId,credit}); return structuredClone(record.credits.at(-1));
  }

  addRestriction(productionId,restriction){
    const record=this.#get(productionId);
    record.restrictions.push(structuredClone(restriction)); this.#touch(record);
    this.#event("RESTRICTION_REGISTERED",{productionId,restriction}); this.recalculate(productionId);
    return structuredClone(restriction);
  }

  recalculate(productionId){
    const record=this.#get(productionId);
    const blocked=record.assets.some(asset=>asset.rightsStatus===RIGHTS_STATUS.BLOCKED);
    const pending=record.assets.some(asset=>[RIGHTS_STATUS.PENDING,RIGHTS_STATUS.REVIEW].includes(asset.rightsStatus));
    const expired=record.licenses.some(license=>license.expiresAt&&new Date(license.expiresAt)<=new Date());
    record.status=blocked?"BLOCKED":expired?"EXPIRED":pending?"REVIEW":"CLEARED";
    this.#touch(record); this.#event("STATUS_RECALCULATED",{productionId,status:record.status});
    return record.status;
  }

  canPublish(productionId){
    const record=this.#get(productionId); this.recalculate(productionId);
    return {allowed:record.status===RIGHTS_STATUS.CLEARED, status:record.status, productionId};
  }

  get(productionId){ return structuredClone(this.#get(productionId)); }
  list(){ return [...this.records.values()].map(structuredClone); }
  history(productionId){ return this.events.filter(event=>event.productionId===productionId).map(structuredClone); }

  #get(idValue){ const record=this.records.get(idValue); if(!record) throw new Error("PRODUCTION_RIGHTS_NOT_FOUND"); return record; }
  #touch(record){ record.updatedAt=new Date().toISOString(); }
  #event(type,data){ this.events.push({id:this.events.length+1,type,productionId:data.productionId||data.id||null,data:structuredClone(data),at:new Date().toISOString()}); }
}
