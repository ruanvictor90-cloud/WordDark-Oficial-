/* WordDark — Receipt Contract
 * Registro de recebimento de uma mensagem pela unidade destino.
 * Recebimento não significa execução concluída.
 */
class WordDarkReceipt {
  constructor(source = {}) {
    this.receiptId = source.receiptId || null;
    this.messageId = source.messageId || null;
    this.requestId = source.requestId || null;
    this.operationId = source.operationId || null;
    this.receiverId = source.receiverId || null;
    this.senderId = source.senderId || null;
    this.routeId = source.routeId || null;
    this.status = source.status || "RECEIVED";
    this.receivedAt = source.receivedAt || new Date().toISOString();
    this.metadata = source.metadata || {};
  }
  validate(){
    const errors=[];
    if(!this.receiptId) errors.push("receiptId é obrigatório.");
    if(!this.messageId) errors.push("messageId é obrigatório.");
    if(!this.requestId) errors.push("requestId é obrigatório.");
    if(!this.operationId) errors.push("operationId é obrigatório.");
    if(!this.receiverId) errors.push("receiverId é obrigatório.");
    if(!this.senderId) errors.push("senderId é obrigatório.");
    if(!this.routeId) errors.push("routeId é obrigatório.");
    return {valid:errors.length===0, errors};
  }
  toJSON(){return {...this};}
}
if(typeof module!=="undefined") module.exports=WordDarkReceipt;
if(typeof window!=="undefined") window.WordDarkReceipt=WordDarkReceipt;
