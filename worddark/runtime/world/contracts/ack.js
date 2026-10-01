/* WordDark — Acknowledgement Contract */
class WordDarkAck {
  constructor({ackId,messageId,requestId,operationId,receiverId,senderId,routeId,status="RECEIVED",metadata={}}={}) {
    this.ackId=ackId || null;
    this.messageId=messageId || null;
    this.requestId=requestId || null;
    this.operationId=operationId || null;
    this.receiverId=receiverId || null;
    this.senderId=senderId || null;
    this.routeId=routeId || null;
    this.status=status;
    this.metadata=metadata;
    this.createdAt=new Date().toISOString();
  }
  validate() {
    for (const [name,value] of Object.entries({
      ackId:this.ackId,messageId:this.messageId,requestId:this.requestId,
      operationId:this.operationId,receiverId:this.receiverId,senderId:this.senderId,
      routeId:this.routeId
    })) if (!value) throw new Error(`ACK inválido: ${name} é obrigatório.`);
    if (!["RECEIVED","REJECTED"].includes(this.status)) throw new Error("Status de ACK inválido.");
    return true;
  }
  toJSON(){return {...this};}
}
if(typeof window!=="undefined") window.WordDarkAck=WordDarkAck;
if(typeof module!=="undefined"&&module.exports) module.exports=WordDarkAck;
