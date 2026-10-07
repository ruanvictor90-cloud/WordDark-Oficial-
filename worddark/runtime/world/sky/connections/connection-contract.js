/* WordDark — External Connection Handoff Contract
 * Única fronteira entre o mundo operacional e serviços externos.
 * Não contém OAuth/token/API de plataforma; isso pertence aos adapters desta central.
 */
class WordDarkExternalConnectionRequest {
  constructor(source={}) {
    this.requestId=source.requestId||null;
    this.operationId=source.operationId||null;
    this.providerId=String(source.providerId||"").toUpperCase()||null;
    this.accountId=source.accountId||null;
    this.capability=source.capability||null;
    this.action=source.action||null;
    this.payload=source.payload||{};
    this.createdAt=source.createdAt||new Date().toISOString();
  }
  validate(){
    const errors=[];
    if(!this.requestId)errors.push("requestId é obrigatório.");
    if(!this.operationId)errors.push("operationId é obrigatório.");
    if(!this.providerId)errors.push("providerId é obrigatório.");
    if(!this.accountId)errors.push("accountId é obrigatório.");
    if(!this.capability)errors.push("capability é obrigatória.");
    if(!this.action)errors.push("action é obrigatória.");
    return{valid:errors.length===0,errors};
  }
  toJSON(){return{...this};}
}
if(typeof window!=="undefined")window.WordDarkExternalConnectionRequest=WordDarkExternalConnectionRequest;
if(typeof module!=="undefined"&&module.exports)module.exports=WordDarkExternalConnectionRequest;
