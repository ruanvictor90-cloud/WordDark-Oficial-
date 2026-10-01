/* WordDark Core — Traceable Operation Package */
const WordDarkContextRef=typeof require==="function"?require("./context"):(typeof window!=="undefined"?window.WordDarkContext:null);
class WordDarkOperationPackage {
 constructor(s={}){this.operationId=s.operationId||null;this.requesterId=s.requesterId||null;this.context=s.context instanceof WordDarkContextRef?s.context:new WordDarkContextRef(s.context||{});this.permission=s.permission||null;this.request=s.request||{};this.resources=s.resources||[];this.history=Array.isArray(s.history)?[...s.history]:[];}
 validate(){const e=[];if(!this.operationId)e.push("operationId é obrigatório.");if(!this.requesterId)e.push("requesterId é obrigatório.");const c=this.context.validate();if(!c.valid)e.push(...c.errors);if(!this.permission)e.push("permission é obrigatório.");if(!this.request||typeof this.request!=="object")e.push("request inválido.");return {valid:e.length===0,errors:e};}
 addHistory(event,data={}){const h={event,timestamp:new Date().toISOString(),data};this.history.push(h);return h;}
 toJSON(){return {operationId:this.operationId,requesterId:this.requesterId,context:this.context.toJSON(),permission:this.permission,request:this.request,resources:[...this.resources],history:[...this.history]};}
}
if(typeof module!=="undefined")module.exports=WordDarkOperationPackage;
if(typeof window!=="undefined")window.WordDarkOperationPackage=WordDarkOperationPackage;
