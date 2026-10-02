import { SOCIAL_NETWORKS } from "./social-networks.js";

export const EXTERNAL_CONNECTION_STATUS=Object.freeze({
  UNCONFIGURED:"UNCONFIGURED",
  READY:"READY",
  AUTHORIZATION_REQUIRED:"AUTHORIZATION_REQUIRED",
  CONNECTED:"CONNECTED",
  ERROR:"ERROR",
  PAUSED:"PAUSED"
});

export class ExternalConnectionHub{
  constructor({integrationRegistry=null,audit=null}={}){
    this.integrationRegistry=integrationRegistry;
    this.audit=audit;
    this.providers=new Map();
    this.routes=new Map();
  }

  registerProvider({id,name,type="NETWORK",status=EXTERNAL_CONNECTION_STATUS.UNCONFIGURED,connector=null,capabilities=[]}={}){
    if(!id)throw new Error("EXTERNAL_PROVIDER_ID_REQUIRED");
    const provider={id,name:name||id,type,status,connector,capabilities:[...capabilities]};
    this.providers.set(id,provider);
    this.routes.set(id,{providerId:id,status,connectorId:connector?.integrationId||null});
    this.audit?.record?.("EXTERNAL_PROVIDER_REGISTERED",{providerId:id,name:provider.name});
    return structuredClone(provider);
  }

  registerAdapter(adapter){
    if(!this.integrationRegistry)throw new Error("INTEGRATION_REGISTRY_REQUIRED");
    return this.integrationRegistry.register(adapter);
  }

  getProvider(id){
    const provider=this.providers.get(id);
    return provider?structuredClone(provider):null;
  }

  listProviders(){
    return [...this.providers.values()].map(provider=>({
      id:provider.id,name:provider.name,type:provider.type,status:provider.status,
      capabilities:[...provider.capabilities],connectorId:provider.connector?.integrationId||null
    }));
  }

  updateStatus(id,status,details={}){
    const provider=this.providers.get(id);
    if(!provider)throw new Error("EXTERNAL_PROVIDER_NOT_FOUND");
    provider.status=status;
    Object.assign(provider,details);
    this.audit?.record?.("EXTERNAL_PROVIDER_STATUS",{providerId:id,status,details});
    return structuredClone(provider);
  }

  prepareAuthorization(id,{accountId,redirectUri=null,state=null}={}){
    const provider=this.providers.get(id);
    if(!provider)throw new Error("EXTERNAL_PROVIDER_NOT_FOUND");
    if(!accountId)throw new Error("ACCOUNT_ID_REQUIRED");
    return {
      providerId:id,accountId,redirectUri,state,
      status:EXTERNAL_CONNECTION_STATUS.AUTHORIZATION_REQUIRED,
      connectorId:provider.connector?.integrationId||null
    };
  }

  health(){
    return this.listProviders().map(provider=>({
      providerId:provider.id,name:provider.name,status:provider.status,
      connectorAvailable:Boolean(provider.connector)
    }));
  }

  status(){
    const providers=this.listProviders();
    return {
      id:"EXTERNAL-CONNECTION-HUB",
      total:providers.length,
      ready:providers.filter(item=>item.status===EXTERNAL_CONNECTION_STATUS.READY||item.status===EXTERNAL_CONNECTION_STATUS.CONNECTED).length,
      authorizationRequired:providers.filter(item=>item.status===EXTERNAL_CONNECTION_STATUS.AUTHORIZATION_REQUIRED).length,
      errors:providers.filter(item=>item.status===EXTERNAL_CONNECTION_STATUS.ERROR).length,
      providers
    };
  }
}

export function createExternalConnectionHub({integrationRegistry,audit}={}){
  const hub=new ExternalConnectionHub({integrationRegistry,audit});
  for(const network of Object.values(SOCIAL_NETWORKS)){
    hub.registerProvider({
      id:network.id,
      name:network.name,
      type:"SOCIAL_NETWORK",
      status:network.connectorStatus||EXTERNAL_CONNECTION_STATUS.AUTHORIZATION_REQUIRED,
      capabilities:network.capabilities||[]
    });
  }
  return hub;
}
