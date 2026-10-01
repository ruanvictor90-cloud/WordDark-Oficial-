/* WordDark Core — Operation Result
 * Resultado formal do ciclo operacional. Não é considerado pronto sem validação.
 */
class WordDarkResult {
 constructor(s={}) {
  this.resultId=s.resultId||null; this.operationId=s.operationId||null;
  this.status=s.status||"CREATED"; this.files=Array.isArray(s.files)?[...s.files]:[];
  this.report=s.report||null; this.logs=Array.isArray(s.logs)?[...s.logs]:[];
  this.metadata=s.metadata||{}; this.createdAt=s.createdAt||new Date().toISOString();
  this.validatedAt=s.validatedAt||null;
 }
 static get STATUSES(){return ["CREATED","READY","PARTIAL","FAILED","CANCELLED"];}
 validate(){const e=[];if(!this.resultId)e.push("resultId é obrigatório.");if(!this.operationId)e.push("operationId é obrigatório.");if(!WordDarkResult.STATUSES.includes(this.status))e.push("status de resultado inválido.");if(this.status==="READY"&&!this.validatedAt)e.push("resultado READY precisa de validatedAt.");return {valid:e.length===0,errors:e};}
 markReady(report=null){this.report=report||this.report;this.status="READY";this.validatedAt=new Date().toISOString();return this;}
 toJSON(){return {...this,files:[...this.files],logs:[...this.logs],metadata:{...this.metadata}};}
}
if(typeof module!=="undefined")module.exports=WordDarkResult;
if(typeof window!=="undefined")window.WordDarkResult=WordDarkResult;
