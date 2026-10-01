export class PermissionManager {
  constructor(){ this.rules=[]; }
  grant({subjectId,capability,action="REQUEST",resourceId="*",environment="TEST"}={}){
    if(!subjectId||!capability) throw new Error("PERMISSION_FIELDS_REQUIRED");
    const rule={subjectId,capability,action,resourceId,environment,createdAt:new Date().toISOString()};
    this.rules.push(rule); return structuredClone(rule);
  }
  revoke({subjectId,capability,action="REQUEST",resourceId="*"}={}){
    const before=this.rules.length;
    this.rules=this.rules.filter(rule=>!(rule.subjectId===subjectId&&rule.capability===capability&&rule.action===action&&rule.resourceId===resourceId));
    return before!==this.rules.length;
  }
  can({subjectId,capability,action="REQUEST",resourceId="*",environment="TEST"}={}){
    return this.rules.some(rule=>rule.subjectId===subjectId&&rule.capability===capability&&rule.action===action
      &&(rule.resourceId==="*"||rule.resourceId===resourceId)&&(rule.environment===environment||rule.environment==="*"));
  }
  list(){ return this.rules.map(structuredClone); }
}
