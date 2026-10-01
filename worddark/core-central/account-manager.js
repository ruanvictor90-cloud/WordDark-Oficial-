import { id } from './id.js';
import { PROFILE_STATUS } from './channel-contract.js';
import { SOCIAL_NETWORKS, SocialNetworkConnector } from './social-networks.js';
export class AccountManager{
 constructor({accountId='ACCOUNT-LOCAL',accountName='Minha Conta'}={}){this.id=accountId;this.name=accountName;this.profiles=new Map();this.managers=new Map();this.operations=new Map();this.events=[];}
 rename(name){if(!name?.trim())throw new Error('ACCOUNT_NAME_REQUIRED');this.name=name.trim();this.record('ACCOUNT_RENAMED',{name:this.name});return this.name;}
 addManager(manager={}){if(!manager.id)manager.id=id('MANAGER');if(!manager.name)throw new Error('MANAGER_NAME_REQUIRED');const entry={id:manager.id,name:manager.name,role:manager.role||'ACCOUNT_MANAGER',status:'ACTIVE'};this.managers.set(entry.id,entry);this.record('MANAGER_CREATED',entry);return entry;}
 connectProfile(profile={}){if(!profile.network)throw new Error('PROFILE_NETWORK_REQUIRED');if(!SOCIAL_NETWORKS[profile.network])throw new Error('NETWORK_NOT_SUPPORTED');const entry={id:profile.id||id('PROFILE'),network:profile.network,networkName:SOCIAL_NETWORKS[profile.network].name,handle:profile.handle||'',displayName:profile.displayName||profile.handle||'Novo perfil',status:profile.status||'CONNECTED',accountId:this.id,managerId:profile.managerId||null,config:structuredClone(profile.config||{}),connectedAt:new Date().toISOString()};if(!PROFILE_STATUS.includes(entry.status))throw new Error('PROFILE_STATUS_INVALID');if(entry.managerId&&!this.managers.has(entry.managerId))throw new Error('MANAGER_NOT_FOUND');this.profiles.set(entry.id,entry);this.record('PROFILE_CONNECTED',entry);return structuredClone(entry);}
 assignManager(profileId,managerId){const p=this.profiles.get(profileId);if(!p)throw new Error('PROFILE_NOT_FOUND');if(!this.managers.has(managerId))throw new Error('MANAGER_NOT_FOUND');p.managerId=managerId;this.record('PROFILE_MANAGER_ASSIGNED',{profileId,managerId});return structuredClone(p);}
 createAuthorization(profileId,redirectUri){const p=this.profiles.get(profileId);if(!p)throw new Error('PROFILE_NOT_FOUND');return new SocialNetworkConnector({network:p.network}).authorizationRequest({accountId:this.id,redirectUri});}
 registerOperation(operation={}){if(!operation.profileId)throw new Error('OPERATION_PROFILE_REQUIRED');if(!this.profiles.has(operation.profileId))throw new Error('PROFILE_NOT_FOUND');const entry={id:operation.id||id('ACCOUNT-OP'),profileId:operation.profileId,type:operation.type||'CONTENT',status:operation.status||'REQUESTED',createdAt:new Date().toISOString()};this.operations.set(entry.id,entry);this.record('OPERATION_REGISTERED',entry);return entry;}
 listProfiles(){return [...this.profiles.values()].map(structuredClone);}
 listManagers(){return [...this.managers.values()].map(structuredClone);}
 listOperations(){return [...this.operations.values()].map(structuredClone);}
 record(type,data={}){this.events.push({id:id('ACCOUNT-EVT'),type,data:structuredClone(data),at:new Date().toISOString()});}
 status(){return {id:this.id,name:this.name,profiles:this.profiles.size,managers:this.managers.size,operations:this.operations.size,status:'ACTIVE'};}
}