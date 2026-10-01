/* WordDark — Dark Factory Production Validator · DF-0.7 */
class DarkFactoryProductionValidator {
  validate(result,request){
    const errors=[];
    if(!result||result.success!==true) errors.push("Resultado inválido.");
    if(request&&request.payload&&request.payload.contentId&&result&&result.contentId!==request.payload.contentId) errors.push("contentId não corresponde.");
    if(!result||!result.productionId) errors.push("productionId ausente.");
    return {valid:errors.length===0,errors:errors};
  }
}
if(typeof module!=="undefined") module.exports=DarkFactoryProductionValidator;
if(typeof window!=="undefined") window.DarkFactoryProductionValidator=DarkFactoryProductionValidator;
