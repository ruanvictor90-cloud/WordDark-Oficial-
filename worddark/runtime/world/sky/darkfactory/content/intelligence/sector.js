(function(root,factory){
  if(typeof module==="object"&&module.exports){module.exports=factory(require("./adapter"));}
  else{root.WordDarkContentIntelligence=factory(root.WordDarkContentIntelligenceAdapter);}
})(typeof self!=="undefined"?self:this,function(Adapter){
  function run(input={}){
    const request=Adapter.createRequest(input);
    if(!request.brief) return {success:false,status:"FAILED",reason:"BRIEF_REQUIRED",request};
    const result=Adapter.normalizeResearch({
      operationId:request.operationId,
      summary:"Pacote inicial preparado para pesquisa.",
      topics:request.brief.split(/[,.;]/).map(x=>x.trim()).filter(Boolean).slice(0,10),
      insights:["Necessidade recebida e normalizada.","Setor pronto para receber uma fonte externa via adapter."],
      evidence:[],
      toolId:"internal.demo",
      toolType:"LOCAL",
      mode:"SIMULATION",
      learningSignals:["brief_normalization"]
    });
    return {success:true,status:"READY",request,result};
  }
  return {run};
});
