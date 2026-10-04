/* WordDark — Production Engine
 * Produção coordena objetivos compostos; Operação executa funções únicas.
 */
(function(root,factory){
  if(typeof module==="object"&&module.exports){module.exports=factory(require("../contracts/production"));}
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
      production.transition("PLANNED");
      production.setOperationPlan(list);
      return production;
    }
    execute(production,operations=[]){
      const list=operations.length?operations:(production.operationPlan.length?production.operationPlan:production.operations);
      if(!list.length){production.transition("WAITING",{reason:"Nenhuma operação planejada."});return production;}
      production.transition("EXECUTING");const results=[];
      for(const source of list){
        const result=source?.operationId?source:this.operationCoordinator?.submit?.({...source,parentProductionId:production.productionId});
        if(!result){results.push({success:false,reason:"Operation Coordinator não configurado."});continue;}
        production.addOperation(result);results.push({operationId:result.operationId,status:result.status,success:result.status==="COMPLETED",result:result.result});
      }
      const failed=results.filter(x=>!x.success);
      production.transition(failed.length?(results.some(x=>x.success)?"PARTIAL":"FAILED"):"COMPLETED",{results});
      return production;
    }
  }
  return WordDarkProductionEngine;
});