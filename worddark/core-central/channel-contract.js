export const CHANNEL_CONTRACT_VERSION="2.0.0";
export const CHANNEL_STRUCTURE=Object.freeze({account:"CONTA",country:"PAIS_OPTIONAL",state:"ESTADO_OPTIONAL",city:"CIDADE",requirement:"REQUERIMENTO",operation:"OPERACAO",gate:"PORTAO",road:"RODOVIA",world:"MUNDO"});
export const PROFILE_STATUS=Object.freeze(["SETUP","CONNECTED","ACTIVE","PAUSED","ARCHIVED"]);
export const REQUIREMENT_TYPES=Object.freeze(["IMAGE","REEL","VIDEO"]);
export const RESPONSIBILITIES=Object.freeze({CONTA:"ACCOUNT_OWNER",PAIS:"GROUP_HOME",ESTADO:"OPERATION",CIDADE:"ACCOUNT_OR_OPERATION_ENVIRONMENT",BAIRRO:"EXECUTION_SECTOR",REQUERIMENTO:"WORLD_OPERATION_REQUEST"});
export class ChannelOperationContract{
 constructor({id,name,accountId}={}){if(!id)throw new Error("CHANNEL_CONTRACT_ID_REQUIRED");this.id=id;this.name=name||id;this.accountId=accountId||null;this.version=CHANNEL_CONTRACT_VERSION;this.structure=structuredClone(CHANNEL_STRUCTURE);this.status="ACTIVE";}
 validateProfile(profile={}){const errors=[];if(!profile.id)errors.push("PROFILE_ID_REQUIRED");if(!profile.network)errors.push("PROFILE_NETWORK_REQUIRED");if(profile.status&&!PROFILE_STATUS.includes(profile.status))errors.push("PROFILE_STATUS_INVALID");return{valid:errors.length===0,errors};}
 validateRequirement(requirement={}){const errors=[];if(!requirement.type)errors.push("REQUIREMENT_TYPE_REQUIRED");if(requirement.type&&!REQUIREMENT_TYPES.includes(requirement.type))errors.push("REQUIREMENT_TYPE_INVALID");if(!requirement.requester?.id)errors.push("REQUIREMENT_REQUESTER_REQUIRED");if(requirement.requester?.type!=="SOCIAL_CHANNEL")errors.push("REQUIREMENT_REQUESTER_TYPE_INVALID");return{valid:errors.length===0,errors};}
 status(){return{id:this.id,name:this.name,accountId:this.accountId,version:this.version,structure:this.structure,status:this.status};}
}