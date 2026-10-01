/* WordDark — Message Contract
 * Envelope de transporte de uma operação.
 * Não autoriza e não executa.
 */
class WordDarkMessage {
  constructor(source = {}) {
    this.messageId=source.messageId||null; this.requestId=source.requestId||null;
    this.type=source.type||"OPERATION_REQUEST"; this.origin=source.origin||null;
    this.destination=source.destination||null; this.service=source.service||null;
    this.routeId=source.routeId||null; this.responseTo=source.responseTo||null;
    this.status=source.status||null; this.payload=source.payload||{};
    this.createdAt=source.createdAt||new Date().toISOString();
  }
  validate(){const errors=[]; for(const [k,v] of Object.entries({messageId:this.messageId,requestId:this.requestId,type:this.type,origin:this.origin,destination:this.destination,service:this.service})){if(!v) errors.push(k+" é obrigatório.");} return {valid:errors.length===0,errors};}
  toJSON(){return {...this};}
}
if(typeof module!=="undefined") module.exports=WordDarkMessage;
if(typeof window!=="undefined") window.WordDarkMessage=WordDarkMessage;
