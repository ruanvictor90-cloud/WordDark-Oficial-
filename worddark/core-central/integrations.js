export class IntegrationRegistry {
  constructor({audit=null}={}){this.adapters=new Map();this.audit=audit;}
  register(adapter){if(!adapter?.integrationId||typeof adapter.execute!=="function")throw new Error("INVALID_INTEGRATION_ADAPTER");this.adapters.set(adapter.integrationId,adapter);this.audit?.record?.("INTEGRATION_REGISTERED",{integrationId:adapter.integrationId,platform:adapter.platform||null});return adapter;}
  get(id){return this.adapters.get(id)||null;}
  list(){return [...this.adapters.values()].map(a=>({integrationId:a.integrationId,platform:a.platform||null,status:a.status||"READY"}));}
  execute(integrationId,operation,payload={}){const adapter=this.get(integrationId);if(!adapter)return{success:false,status:"NOT_FOUND",integrationId};try{const result=adapter.execute(operation,payload);this.audit?.record?.("INTEGRATION_EXECUTED",{integrationId,result});return result;}catch(error){this.audit?.record?.("INTEGRATION_FAILED",{integrationId,reason:error.message});return{success:false,status:"FAILED",integrationId,reason:error.message};}}
}