/* WordDark — Global Security Manager
 * Verifica identidade + acesso e registra a decisão. Não executa e não roteia.
 */
class WordDarkSecurityManager {
  constructor(){this.identities=new Map();this.rules=[];this.audit=[];}

  registerIdentity(identity){
    const v=identity.validate();
    if(!v.valid)throw new Error(v.errors.join(" "));
    if(this.identities.has(identity.identityId))throw new Error("Identidade já registrada: "+identity.identityId);
    this.identities.set(identity.identityId,identity);
    return identity;
  }

  grant(rule){
    const v=rule.validate();
    if(!v.valid)throw new Error(v.errors.join(" "));
    if(!this.identities.has(rule.identityId))throw new Error("Identidade não registrada: "+rule.identityId);
    this.rules.push(rule);
    return rule;
  }

  authorize(request={}){
    const identity=this.identities.get(request.identityId);
    if(!identity)return this._decision(false,"IDENTITY_NOT_FOUND",request);
    if(!identity.isActive())return this._decision(false,"IDENTITY_NOT_ACTIVE",request);
    if(!WordDarkSecurityManager.ENVIRONMENTS.includes(request.environment)) {
      return this._decision(false,"INVALID_ENVIRONMENT",request);
    }
    const allowed=this.rules.some(rule=>rule.matches(request));
    return this._decision(allowed,allowed?"AUTHORIZED":"ACCESS_DENIED",request);
  }

  _decision(allowed,reason,request){
    const decision={
      allowed,
      reason,
      reference:"AUTH-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).substring(2,6).toUpperCase()
    };
    this.audit.push({
      auditId:"AUD-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).substring(2,6).toUpperCase(),
      timestamp:new Date().toISOString(),
      identityId:request.identityId||null,
      operationId:request.operationId||null,
      capability:request.capability||null,
      action:request.action||null,
      environment:request.environment||null,
      scope:request.scope||null,
      ...decision
    });
    return decision;
  }

  getAudit(){return [...this.audit];}
}
WordDarkSecurityManager.ENVIRONMENTS=["TEST","PROD"];
if (typeof module !== "undefined") module.exports = WordDarkSecurityManager;
if (typeof window !== "undefined") window.WordDarkSecurityManager = WordDarkSecurityManager;
