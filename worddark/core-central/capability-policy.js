export const AUTONOMY_LEVEL=Object.freeze({MANUAL:0,ASSISTED:1,CONTROLLED:2,AUTONOMOUS:3});

export class AutonomyPolicy{
  constructor({permissionManager=null,emergencyStop=null,audit=null}={}){this.permissionManager=permissionManager;this.emergencyStop=emergencyStop;this.audit=audit;this.policies=new Map();}
  set(moduleId,level=AUTONOMY_LEVEL.MANUAL,{allowedActions=[],requiresApproval=true}={}){
    if(!moduleId||!Number.isInteger(level)||level<0||level>3)throw new Error("AUTONOMY_POLICY_INVALID");
    const policy={moduleId,level,levelName:Object.entries(AUTONOMY_LEVEL).find(([,v])=>v===level)?.[0],allowedActions:[...allowedActions],requiresApproval:Boolean(requiresApproval)};
    this.policies.set(moduleId,policy);this.audit?.record?.("AUTONOMY_POLICY_SET",policy);return structuredClone(policy);
  }
  can(moduleId,action,{subjectId=null,resourceId="*",environment="TEST",approved=false}={}){
    const p=this.policies.get(moduleId);if(!p)return{allowed:false,reason:"AUTONOMY_POLICY_NOT_FOUND"};
    if(this.emergencyStop?.isStopped?.())return{allowed:false,reason:"EMERGENCY_STOP_ACTIVE"};
    if(!p.allowedActions.includes(action))return{allowed:false,reason:"ACTION_NOT_ALLOWED"};
    if(p.requiresApproval&&!approved)return{allowed:false,reason:"APPROVAL_REQUIRED"};
    if(this.permissionManager&&!this.permissionManager.can({subjectId,capability:moduleId,action,resourceId,environment}))return{allowed:false,reason:"PERMISSION_DENIED"};
    return{allowed:true,level:p.level,levelName:p.levelName};
  }
  get(moduleId){return structuredClone(this.policies.get(moduleId)||null);}
  list(){return [...this.policies.values()].map(structuredClone);}
}
