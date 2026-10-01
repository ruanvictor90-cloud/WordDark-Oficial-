/* WordDark Lab — Result contract */
class WordDarkLabResult {
  constructor(source={}){
    this.resultId=source.resultId||null;this.operationId=source.operationId||null;
    this.status=source.status||"CREATED";this.files=source.files||[];this.report=source.report||null;
    this.logs=source.logs||[];this.createdAt=source.createdAt||new Date().toISOString();
  }
  validate(){const e=[];if(!this.resultId)e.push("resultId é obrigatório.");if(!this.operationId)e.push("operationId é obrigatório.");if(!["CREATED","READY","PARTIAL","FAILED"].includes(this.status))e.push("status de resultado inválido.");return {valid:e.length===0,errors:e};}
  toJSON(){return {...this};}
}
if(typeof module!=="undefined")module.exports=WordDarkLabResult;
if(typeof window!=="undefined")window.WordDarkLabResult=WordDarkLabResult;
