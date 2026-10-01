/* WordDark Core — Contextual Permission Rules */
class WordDarkPermission {
 constructor(s={}){this.profile=s.profile||null;this.capability=s.capability||null;this.action=s.action||null;this.resourceId=s.resourceId||"*";this.clientId=s.clientId||"*";this.environment=s.environment||"TEST";}
 validate(){const e=[];if(!this.profile)e.push("profile é obrigatório.");if(!this.capability)e.push("capability é obrigatória.");if(!this.action)e.push("action é obrigatória.");if(!["TEST","PROD"].includes(this.environment))e.push("environment inválido.");return {valid:e.length===0,errors:e};}
 matches(r={}){return this.profile===r.profile&&this.capability===r.capability&&this.action===r.action&&(this.resourceId==="*"||this.resourceId===r.resourceId)&&(this.clientId==="*"||this.clientId===r.clientId)&&this.environment===r.environment;}
}
class WordDarkPermissionSet {
 constructor(){this.rules=[];}
 grant(rule){const v=rule.validate();if(!v.valid)throw new Error(v.errors.join(" "));this.rules.push(rule);return rule;}
 authorize(req={}){return this.rules.some(r=>r.matches(req));}
}
if(typeof module!=="undefined")module.exports={WordDarkPermission,WordDarkPermissionSet};
if(typeof window!=="undefined")Object.assign(window,{WordDarkPermission,WordDarkPermissionSet});
