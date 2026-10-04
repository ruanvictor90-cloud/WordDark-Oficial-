/* WordDark — Universal Result Contract
 * Todo módulo/empresa devolve o mesmo formato.
 */
class WordDarkResult {
  constructor(source={}) {
    this.success=source.success!==false;
    this.status=source.status||"COMPLETED";
    this.operationId=source.operationId||null;
    this.productionId=source.productionId||null;
    this.moduleId=source.moduleId||null;
    this.companyId=source.companyId||null;
    this.action=source.action||null;
    this.output=source.output??source.result??null;
    this.artifacts=Array.isArray(source.artifacts)?source.artifacts:[];
    this.errors=Array.isArray(source.errors)?source.errors:[];
    this.nextAction=source.nextAction||null;
    this.reentry=source.reentry||null;
    this.meta=source.meta||{};
    this.createdAt=source.createdAt||new Date().toISOString();
  }
  static success(output=null,extra={}){return new WordDarkResult({success:true,status:"COMPLETED",output,...extra});}
  static failure(reason,extra={}){return new WordDarkResult({success:false,status:"FAILED",errors:[reason],...extra});}
  toJSON(){return {...this};}
}
if(typeof module!=="undefined")module.exports=WordDarkResult;
if(typeof window!=="undefined")window.WordDarkResult=WordDarkResult;
