/* WordDark — Standard Error Contract */
class WordDarkError {
  constructor({errorId,operationId,requestId,stage,code,message,retryable=false,details={}}={}) {
    this.errorId=errorId || "ERR-"+Date.now().toString(36).toUpperCase();
    this.operationId=operationId || null;
    this.requestId=requestId || null;
    this.stage=stage || null;
    this.code=code || "UNKNOWN_ERROR";
    this.message=message || "Erro não especificado.";
    this.retryable=Boolean(retryable);
    this.details=details;
    this.createdAt=new Date().toISOString();
  }
  validate() {
    if(!this.errorId||!this.stage||!this.code||!this.message) throw new Error("Erro inválido: campos obrigatórios ausentes.");
    return true;
  }
  toJSON(){return {...this};}
}
if(typeof window!=="undefined") window.WordDarkError=WordDarkError;
if(typeof module!=="undefined"&&module.exports) module.exports=WordDarkError;
