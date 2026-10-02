import { id } from "./id.js";

export const ACCOUNT_STRUCTURE_RULES=Object.freeze({
  SINGLE_ACCOUNT:"STRUCTURE_MINIMUM",
  MULTI_ACCOUNT:"COUNTRY_GROUP",
  OPERATION:"STATE_OPERATION",
  ENVIRONMENT:"CITY_ENVIRONMENT",
  SECTOR:"BAIRRO_SECTOR"
});

export class AccountWorldStructure {
  constructor({name="Conta",accountId=null}={}){this.id=id("ACCOUNT-WORLD");this.accountId=accountId;this.name=name;this.profiles=[];this.operations=[];}
  connectProfile(profile={}){
    if(!profile.id)throw new Error("PROFILE_ID_REQUIRED");
    if(!profile.network)throw new Error("PROFILE_NETWORK_REQUIRED");
    const existing=this.profiles.find(x=>x.id===profile.id); if(existing)return existing;
    const entry={id:profile.id,network:profile.network,displayName:profile.displayName||profile.handle||profile.id,status:profile.status||"CONNECTED",connectedAt:profile.connectedAt||new Date().toISOString()};
    this.profiles.push(entry); return entry;
  }
  addOperation(operation={}){
    if(!operation.id)throw new Error("OPERATION_ID_REQUIRED");
    if(!operation.name)throw new Error("OPERATION_NAME_REQUIRED");
    const entry={id:operation.id,name:operation.name,profileIds:[...(operation.profileIds||[])],status:operation.status||"ACTIVE"};
    this.operations.push(entry); return entry;
  }
  classify(){
    const n=this.profiles.length;
    if(n===0)return{level:"ACCOUNT",reason:"NO_CONNECTED_ACCOUNT",country:null,state:null,city:null,bairro:null};
    if(n===1&&this.operations.length===0){const p=this.profiles[0];return{level:"STATE",reason:"SINGLE_CONNECTED_ACCOUNT",country:null,state:{id:p.id,name:p.displayName,network:p.network},city:{id:p.id+"-CITY",name:p.network},bairro:null};}
    return{level:"COUNTRY",reason:n>1?"MULTIPLE_CONNECTED_ACCOUNTS":"EXPLICIT_GROUP_OPERATION",country:{id:this.accountId||id("COUNTRY"),name:this.name},state:{id:"ACCOUNT-MANAGEMENT",name:"Gestão das Contas"},city:{id:"OPERATIONS-MANAGEMENT",name:"Gestão das Operações"},bairro:this.operations.length?{id:"OPERATIONS",name:"Operações"}:null};
  }
  status(){return{id:this.id,accountId:this.accountId,name:this.name,profiles:this.profiles.length,operations:this.operations.length,structure:this.classify()};}
}