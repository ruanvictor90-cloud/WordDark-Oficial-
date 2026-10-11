/* WordDark — Production Engine v0.2
 * Produção coordena objetivos compostos; Operação executa funções únicas.
 */
(function(root,factory){
  if(typeof module==="object"&&module.exports)module.exports=factory(require("../contracts/production"));
  else{const r=root||(typeof window!=="undefined"?window:globalThis);r.WordDarkProductionEngine=factory(r.WordDarkProduction);}
})(typeof globalThis!=="undefined"?globalThis:window,function(WordDarkProduction){
  class WordDarkProductionEngine{
    constructor({operationCoordinator=null,planner=null,idPrefix="PROD"}={}){this.operationCoordinator=operationCoordinator;this.planner=planner||null;this.idPrefix=idPrefix;}
    generateId(){return this.idPrefix+"-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,7).toUpperCase();}
    create(source={}){const p=new WordDarkProduction({...source,productionId:source.productionId||this.generateId()});const v=p.validate();if(!v.valid)p.transition("FAILED",{errors:v.errors});return p;}
    plan(production,operations=[]){
      if(!(production instanceof WordDarkProduction))throw new Error("O Production Engine exige o contrato de produção.");
      let list=operations;
      if(!list.length&&this.planner?.plan)list=this.planner.plan(production).operations;
      production.transition("PLANNED");production.setOperationPlan(list);return production;
    }
    execute(production,operations=[]){
      const list=operations.length?operations:(production.operationPlan.length?production.operationPlan:production.operations);
      if(!list.length){production.transition("WAITING",{reason:"Nenhuma operação planejada."});return production;}
      if(!this.operationCoordinator?.submit){production.transition("FAILED",{reason:"Operation Coordinator não configurado."});return production;}
      production.transition("EXECUTING");
      const results=[];
      const accept=(result,source,index)=>{
        results.push({operationId:result?.operationId||source?.operationId||null,status:result?.status||"FAILED",success:result?.status==="COMPLETED",result:result?.result||result,operation:typeof result?.toJSON==="function"?result.toJSON():(result?.operation||null)});
        if(result?.status!=="COMPLETED"){production.transition(results.some(x=>x.success)?"PARTIAL":"FAILED",{results});return production;}
        return runAt(index+1);
      };
      const runAt=index=>{
        if(index>=list.length){production.transition("COMPLETED",{results});return production;}
        let result;
        try{result=this.operationCoordinator.submit({...((list[index]?.toJSON instanceof Function)?list[index].toJSON():list[index]),parentProductionId:production.productionId});}
        catch(error){production.transition(results.length?"PARTIAL":"FAILED",{results,reason:error.message});return production;}
        return result&&typeof result.then==="function"
          ?result.then(value=>accept(value,list[index],index)).catch(error=>{production.transition(results.length?"PARTIAL":"FAILED",{results,reason:error.message});return production;})
          :accept(result,list[index],index);
      };
      return runAt(0);
    }
  }
  return WordDarkProductionEngine;
});