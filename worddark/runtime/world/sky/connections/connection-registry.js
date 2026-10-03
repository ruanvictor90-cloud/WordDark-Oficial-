/* WordDark — External Connection Registry · DF-0.10 */
const CONNECTION_STORAGE_KEY="wd.external.connections";
class ExternalConnectionRegistry{
  constructor(storage){this.storage=storage||globalThis.localStorage;}
  list(){try{return JSON.parse(this.storage.getItem(CONNECTION_STORAGE_KEY)||"[]");}catch{return[];}}
  get(providerId,accountId){return this.list().find(c=>c.providerId===String(providerId).toUpperCase()&&(!accountId||c.accountId===accountId))||null;}
  connected(providerId,accountId){const c=this.get(providerId,accountId);return !!c&&c.status==="CONNECTED";}
  authorizeContext(providerId,accountId,capability){const c=this.get(providerId,accountId);if(!c)return{allowed:false,status:"ACCOUNT_NOT_CONNECTED"};if(capability&&!(c.capabilities||[]).includes(capability))return{allowed:false,status:"CAPABILITY_NOT_GRANTED",account:c};return{allowed:true,status:"CONNECTED",account:c};}
}
if(typeof window!=="undefined"){window.CONNECTION_STORAGE_KEY=CONNECTION_STORAGE_KEY;window.ExternalConnectionRegistry=ExternalConnectionRegistry;}
