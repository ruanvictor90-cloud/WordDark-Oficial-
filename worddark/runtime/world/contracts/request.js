/* WordDark — Request Contract
 * Pedido formal de serviço/operação entre unidades.
 * Não autoriza, transporta ou executa por conta própria.
 */
class WordDarkRequest {
  constructor(source = {}) {
    this.requestId = source.requestId || null;
    this.operationId = source.operationId || null;
    this.requesterId = source.requesterId || null;
    this.originId = source.originId || null;
    this.destinationId = source.destinationId || null;
    this.service = source.service || null;
    this.task = source.task || null;
    this.payload = source.payload || {};
    this.status = source.status || "CREATED";
    this.createdAt = source.createdAt || new Date().toISOString();
  }
  validate() {
    const errors=[];
    if(!this.requestId) errors.push("requestId é obrigatório.");
    if(!this.operationId) errors.push("operationId é obrigatório.");
    if(!this.requesterId) errors.push("requesterId é obrigatório.");
    if(!this.originId) errors.push("originId é obrigatório.");
    if(!this.destinationId) errors.push("destinationId é obrigatório.");
    if(!this.service) errors.push("service é obrigatório.");
    if(!this.task) errors.push("task é obrigatório.");
    return {valid:errors.length===0, errors};
  }
  toJSON(){return {...this};}
}
if(typeof module!=="undefined") module.exports=WordDarkRequest;
if(typeof window!=="undefined") window.WordDarkRequest=WordDarkRequest;
