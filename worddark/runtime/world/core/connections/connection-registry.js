/* WordDark — External Connection Registry */
const CONNECTION_STORAGE_KEY="wd.external.connections";
const RUNTIME_CREDENTIALS=new Map();

class ExternalConnectionRegistry{
  constructor(storage){this.storage=storage||globalThis.localStorage;}
  list(){try{return JSON.parse(this.storage.getItem(CONNECTION_STORAGE_KEY)||"[]");}catch{return[];}}
  get(providerId,accountId){return this.list().find(c=>c.providerId===String(providerId).toUpperCase()&&(!accountId||c.accountId===accountId))||null;}
  connected(providerId,accountId){const c=this.get(providerId,accountId);return !!c&&c.status==="CONNECTED";}
  authorizeContext(providerId,accountId,capability){
    const c=this.get(providerId,accountId);
    if(!c)return{allowed:false,status:"ACCOUNT_NOT_CONNECTED"};
    if(capability&&!(c.capabilities||[]).includes(capability))return{allowed:false,status:"CAPABILITY_NOT_GRANTED",account:c};
    if(!RUNTIME_CREDENTIALS.has(String(providerId).toUpperCase()+":"+accountId))return{allowed:false,status:"RUNTIME_CREDENTIAL_REQUIRED",account:c};
    return{allowed:true,status:"CONNECTED",account:c};
  }
  setRuntimeCredential(providerId,accountId,credential){
    if(!providerId||!accountId||!credential)return false;
    RUNTIME_CREDENTIALS.set(String(providerId).toUpperCase()+":"+accountId,credential);
    return true;
  }
  getRuntimeCredential(providerId,accountId){return RUNTIME_CREDENTIALS.get(String(providerId).toUpperCase()+":"+accountId)||null;}
  disconnect(providerId,accountId){
    const key=String(providerId).toUpperCase()+":"+accountId;
    RUNTIME_CREDENTIALS.delete(key);
    const next=this.list().filter(c=>!(c.providerId===String(providerId).toUpperCase()&&c.accountId===accountId));
    this.storage.setItem(CONNECTION_STORAGE_KEY,JSON.stringify(next));
    return{success:true,status:"DISCONNECTED"};
  }
}
if(typeof window!=="undefined"){window.CONNECTION_STORAGE_KEY=CONNECTION_STORAGE_KEY;window.ExternalConnectionRegistry=ExternalConnectionRegistry;}
if(typeof module!=="undefined"&&module.exports)module.exports=ExternalConnectionRegistry;
