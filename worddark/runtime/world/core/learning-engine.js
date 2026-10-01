/** WordDark Learning Engine
 * Falhas geram conhecimento CANDIDATO. Nada é promovido automaticamente.
 */
class WordDarkLearningEngine {
  fromDiagnostic(report,{sourceId="OPERATION_DIAGNOSTICS",sourceType="DIAGNOSTIC",title=null}={}) {
    if(!report||report.status!=="FAILED") return null;
    if(typeof WordDarkKnowledgeRecord==="undefined") throw new Error("WordDarkKnowledgeRecord is required.");
    const failure=report.failures[0]||{};
    const knowledge=new WordDarkKnowledgeRecord({
      knowledgeId:"WD-K-ERR-"+report.diagnosticId,
      type:WordDarkKnowledgeRecord.TYPES.ERROR_CORRECTION,
      title:title||"Correção derivada de falha operacional: "+(failure.code||"UNKNOWN_ERROR"),
      summary:"Falha detectada em "+(failure.component||"componente desconhecido")+". Registro candidato para investigação, correção e validação futura.",
      sourceId,sourceType,status:WordDarkKnowledgeRecord.STATUS.PROPOSED,
      tags:["operation","diagnostic","error","improvement"],
      evidence:[{diagnosticId:report.diagnosticId,operationId:report.operationId,failure}],
      metadata:{nextAction:"INVESTIGATE_AND_VALIDATE",component:failure.component||null,errorCode:failure.code||null}
    });
    knowledge.validate(); return knowledge;
  }
}
if(typeof module!=="undefined") module.exports={WordDarkLearningEngine:WordDarkLearningEngine};
if(typeof window!=="undefined") window.WordDarkLearningEngine=WordDarkLearningEngine;
