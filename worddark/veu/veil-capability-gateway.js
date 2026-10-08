export class VeilCapabilityGateway{
  constructor({registry,connectionSystem=null,audit=null}={}){if(!registry)throw new Error("VEIL_REGISTRY_REQUIRED");this.registry=registry;this.connectionSystem=connectionSystem;this.audit=audit;this.id="VEIL-CAPABILITY-GATEWAY";}
  request({provider,capability,accountId,resourceId="*",payload={},approved=false}={}){
    if(!provider||!capability)throw new Error("VEIL_CAPABILITY_REQUEST_INVALID");
    if(!this.connectionSystem)return{status:"WAITING_CONNECTION_SYSTEM"};
    const connections=this.connectionSystem.registry.list().filter(c=>c.provider===provider&&(!accountId||c.accountId===accountId));
    if(!connections.length)return{status:"CONNECTION_NOT_FOUND"};
    const connection=connections[0];
    const decision=this.connectionSystem.policy.authorize({providerId:provider,capability,approved,resourceId,subjectId:accountId});
    if(!decision.allowed){this.audit?.record?.("VEIL_CAPABILITY_BLOCKED",{provider,capability,reason:decision.reason});return{status:"BLOCKED",reason:decision.reason};}
    this.audit?.record?.("VEIL_CAPABILITY_GRANTED",{provider,capability,connectionId:connection.id});
    return{status:"AUTHORIZED",connectionId:connection.id,provider,capability,resourceId,payload};
  }
  status(){return{id:this.id,status:"ACTIVE",rawCredentialsReturned:false};}
}
