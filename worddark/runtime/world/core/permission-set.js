/* WordDark — Capability Permission Set
 * Capability resolves the destination; permission authorizes the action.
 */
class WordDarkPermissionSet{
 constructor({rules=[],defaultEffect="DENY"}={}){this.rules=Array.isArray(rules)?rules:[];this.defaultEffect=defaultEffect;}
 add(rule={}){if(!rule.capability)throw new Error("capability obrigatória.");this.rules.push({...rule,effect:rule.effect||"ALLOW"});return rule;}
 authorize({profile=null,capability=null,action="request",resourceId=null,clientId=null,environment="TEST"}={}){
   const match=this.rules.find(r=>
    r.capability===capability &&
    (!r.action||r.action===action) &&
    (!r.clientId||r.clientId===clientId) &&
    (!r.resourceId||r.resourceId===resourceId) &&
    (!r.environment||r.environment===environment) &&
    (!r.profile||r.profile===profile)
   );
   return match ? match.effect==="ALLOW" : this.defaultEffect==="ALLOW";
 }
}
if(typeof window!=="undefined")window.WordDarkPermissionSet=WordDarkPermissionSet;
if(typeof module!=="undefined"&&module.exports)module.exports=WordDarkPermissionSet;