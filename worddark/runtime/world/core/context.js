/* WordDark Core — Execution Context */
class WordDarkContext {
 constructor(source={}){this.clientId=source.clientId||null;this.projectId=source.projectId||null;this.resourceId=source.resourceId||null;this.originId=source.originId||null;this.destinationId=source.destinationId||null;this.serviceId=source.serviceId||null;this.environment=source.environment||"TEST";}
 validate(){const e=[];if(!this.clientId)e.push("clientId é obrigatório.");if(!this.resourceId)e.push("resourceId é obrigatório.");if(!this.originId)e.push("originId é obrigatório.");if(!this.destinationId)e.push("destinationId é obrigatório.");if(!this.serviceId)e.push("serviceId é obrigatório.");if(!["TEST","PROD"].includes(this.environment))e.push("environment deve ser TEST ou PROD.");return {valid:e.length===0,errors:e};}
 toJSON(){return {...this};}
}
if(typeof module!=="undefined")module.exports=WordDarkContext;
if(typeof window!=="undefined")window.WordDarkContext=WordDarkContext;
