/* WordDark Lab — Profile + Permission Context */
class WordDarkLabPermission {
  constructor(source={}){
    this.profile=source.profile||null; this.capability=source.capability||null;
    this.action=source.action||null; this.resourceId=source.resourceId||"*";
    this.clientId=source.clientId||"*"; this.environment=source.environment||"TEST";
  }
  validate(){
    const e=[];
    if(!this.profile)e.push("profile é obrigatório.");
    if(!this.capability)e.push("capability é obrigatória.");
    if(!this.action)e.push("action é obrigatória.");
    if(!["TEST","PROD"].includes(this.environment))e.push("environment inválido.");
    return {valid:e.length===0,errors:e};
  }
  matches(req={}){
    return this.profile===req.profile &&
      this.capability===req.capability &&
      this.action===req.action &&
      (this.resourceId==="*"||this.resourceId===req.resourceId) &&
      (this.clientId==="*"||this.clientId===req.clientId) &&
      this.environment===req.environment;
  }
}
class WordDarkLabPermissionSet {
  constructor(){this.rules=[];}
  grant(rule){const v=rule.validate();if(!v.valid)throw new Error(v.errors.join(" "));this.rules.push(rule);return rule;}
  authorize(req={}){return this.rules.some(r=>r.matches(req));}
}
if(typeof module!=="undefined") module.exports={WordDarkLabPermission,WordDarkLabPermissionSet};
if(typeof window!=="undefined"){window.WordDarkLabPermission=WordDarkLabPermission;window.WordDarkLabPermissionSet=WordDarkLabPermissionSet;}
