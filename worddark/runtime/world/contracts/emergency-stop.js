/* WordDark — Emergency Stop Contract
 * "Socorro Deus para tudo": parada de emergência transversal por setor.
 * Um setor pode solicitar a parada; a operação inteira passa a ser CANCELLED.
 */
class WordDarkEmergencyStop {
  constructor(source={}) {
    this.stopId=source.stopId||null;
    this.sectorId=source.sectorId||null;
    this.operationId=source.operationId||null;
    this.requesterId=source.requesterId||null;
    this.reason=source.reason||"Parada de emergência solicitada.";
    this.status=source.status||"TRIGGERED";
    this.createdAt=source.createdAt||new Date().toISOString();
  }

  static get STATUSES(){return ["TRIGGERED","ACKNOWLEDGED","RELEASED"]}

  validate(){
    const errors=[];
    if(!this.stopId) errors.push("stopId é obrigatório.");
    if(!this.sectorId) errors.push("sectorId é obrigatório.");
    if(!this.operationId) errors.push("operationId é obrigatório.");
    if(!this.requesterId) errors.push("requesterId é obrigatório.");
    if(!this.reason) errors.push("reason é obrigatório.");
    if(!WordDarkEmergencyStop.STATUSES.includes(this.status)) errors.push("status de parada inválido.");
    return {valid:errors.length===0,errors};
  }

  toJSON(){
    return {
      stopId:this.stopId,sectorId:this.sectorId,operationId:this.operationId,
      requesterId:this.requesterId,reason:this.reason,status:this.status,createdAt:this.createdAt
    };
  }
}
if(typeof module!=="undefined") module.exports=WordDarkEmergencyStop;
if(typeof window!=="undefined") window.WordDarkEmergencyStop=WordDarkEmergencyStop;
