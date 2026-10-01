/** WordDark Diagnostic Contract */
class WordDarkDiagnosticReport {
  constructor({diagnosticId,operationId=null,scope="OPERATION",status="UNKNOWN",startedAt=new Date().toISOString(),finishedAt=null,checks=[],failures=[],warnings=[],summary="",metadata={}}={}) {
    this.diagnosticId=diagnosticId||("DGN-"+Date.now().toString(36).toUpperCase());
    this.operationId=operationId; this.scope=scope; this.status=status; this.startedAt=startedAt; this.finishedAt=finishedAt;
    this.checks=Array.isArray(checks)?checks:[]; this.failures=Array.isArray(failures)?failures:[]; this.warnings=Array.isArray(warnings)?warnings:[]; this.summary=summary; this.metadata=metadata||{};
  }
  addCheck(check={}) { this.checks.push({component:check.component||"UNKNOWN",status:check.status||"UNKNOWN",code:check.code||null,message:check.message||"",stage:check.stage||null,details:check.details||{}}); return this; }
  addFailure(failure={}) { this.failures.push({component:failure.component||"UNKNOWN",code:failure.code||"UNKNOWN_ERROR",stage:failure.stage||null,message:failure.message||"",evidence:failure.evidence||{}}); return this; }
  addWarning(warning={}) { this.warnings.push(warning); return this; }
  finalize() { const failed=this.failures.length>0||this.checks.some(c=>c.status==="FAILED"); const unknown=this.checks.some(c=>c.status==="UNKNOWN"||c.status==="NOT_TESTED"); this.status=failed?"FAILED":(unknown?"PARTIAL":"PASSED"); this.finishedAt=new Date().toISOString(); this.summary=failed?"Falha detectada. O diagnóstico identifica os pontos afetados e gera aprendizado candidato.":unknown?"Diagnóstico parcial. Existem componentes ainda não testados.":"Todos os componentes testados responderam conforme esperado."; return this; }
  toJSON() { return {diagnosticId:this.diagnosticId,operationId:this.operationId,scope:this.scope,status:this.status,startedAt:this.startedAt,finishedAt:this.finishedAt,checks:[...this.checks],failures:[...this.failures],warnings:[...this.warnings],summary:this.summary,metadata:{...this.metadata}}; }
}
if(typeof module!=="undefined") module.exports={WordDarkDiagnosticReport};
if(typeof window!=="undefined") window.WordDarkDiagnosticReport=WordDarkDiagnosticReport;
