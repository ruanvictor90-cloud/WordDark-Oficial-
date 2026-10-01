/* WordDark Core — Unified Operation
 * O contrato operacional agora carrega as novas linhas do Core V1
 * sem criar um segundo contrato/runtime.
 */
const WordDarkOperation=require("../contracts/operation");
class WordDarkCoreOperation extends WordDarkOperation{
 constructor(source={}){
  super(source);
  this.clientId=source.clientId||null;this.projectId=source.projectId||null;this.resourceId=source.resourceId||null;
  this.serviceId=source.serviceId||source.operationType||null;this.context=source.context||null;
  this.request=source.request||{};this.resources=Array.isArray(source.resources)?[...source.resources]:[];
  this.history=Array.isArray(source.history)?[...source.history]:[];this.version=source.version||1;
 }
 addHistory(event,data={}){const item={event,timestamp:new Date().toISOString(),data};this.history.push(item);this.updatedAt=item.timestamp;return item;}
 validate(){const base=super.validate();const e=[...base.errors];if(!this.clientId)e.push("clientId é obrigatório.");if(!this.resourceId)e.push("resourceId é obrigatório.");if(!this.serviceId)e.push("serviceId é obrigatório.");return {valid:e.length===0,errors:e};}
 toJSON(){return {...super.toJSON(),clientId:this.clientId,projectId:this.projectId,resourceId:this.resourceId,serviceId:this.serviceId,context:this.context,request:this.request,resources:[...this.resources],history:[...this.history],version:this.version};}
}
if(typeof module!=="undefined")module.exports=WordDarkCoreOperation;
if(typeof window!=="undefined")window.WordDarkCoreOperation=WordDarkCoreOperation;