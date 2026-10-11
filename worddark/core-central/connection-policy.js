export const CONNECTION_ACCESS=Object.freeze({WORLD_READ_ONLY:"WORLD_READ_ONLY",WORLD_OPERATION:"WORLD_OPERATION",BOUNDARY_ONLY:"BOUNDARY_ONLY"});

export class ConnectionPolicy{
  constructor({permissionManager=null,audit=null}={}){this.permissionManager=permissionManager;this.audit=audit;this.rules=new Map();}
  set(providerId,{allowedCapabilities=[],worldAccess=CONNECTION_ACCESS.WORLD_READ_ONLY,requiresApproval=true}={}){
    const rule={providerId,allowedCapabilities:[...new Set(allowedCapabilities)],worldAccess,requiresApproval:Boolean(requiresApproval)};
    this.rules.set(providerId,rule);this.audit?.record?.("CONNECTION_POLICY_SET",rule);return structuredClone(rule);
  }
  authorize({providerId,capability,approved=false,subjectId=null,resourceId="*"}={}){
    const rule=this.rules.get(providerId);if(!rule)return{allowed:false,reason:"CONNECTION_POLICY_NOT_FOUND"};
    if(!rule.allowedCapabilities.includes(capability))return{allowed:false,reason:"CAPABILITY_NOT_ALLOWED"};
    if(rule.requiresApproval&&!approved)return{allowed:false,reason:"APPROVAL_REQUIRED"};
    if(this.permissionManager&&!this.permissionManager.can({subjectId,capability:providerId,action:capability,resourceId,environment:"PRODUCTION"}))return{allowed:false,reason:"PERMISSION_DENIED"};
    return{allowed:true,worldAccess:rule.worldAccess};
  }
  get(providerId){return structuredClone(this.rules.get(providerId)||null);}
  list(){return [...this.rules.values()].map(structuredClone);}
}
