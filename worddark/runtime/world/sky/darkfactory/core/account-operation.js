/* WordDark — Account Operation Binding · DF-0.10 */
class AccountOperationBinding{
  constructor(registry){this.registry=registry||null;}
  bind({network,accountId,action,contentId}={}){if(!network||!accountId)return{success:false,status:"ACCOUNT_REQUIRED"};if(!this.registry)return{success:false,status:"CONNECTION_REGISTRY_UNAVAILABLE"};const capability=action==="CONTENT_PUBLISH"?"CONTENT_ROUTE":"ACCOUNT_READ";const access=this.registry.authorizeContext(network,accountId,capability);if(!access.allowed)return{success:false,status:access.status,network,accountId};return{success:true,status:"ACCOUNT_BOUND",network:String(network).toUpperCase(),accountId,action,contentId,account:access.account};}
}
if(typeof window!=="undefined")window.AccountOperationBinding=AccountOperationBinding;
if(typeof module!=="undefined"&&module.exports)module.exports=AccountOperationBinding;
