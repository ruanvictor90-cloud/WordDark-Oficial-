(function(root,factory){
  if(typeof module==="object"&&module.exports){module.exports=factory();}
  else{root.WordDarkContentIntelligenceAdapter=factory();}
})(typeof self!=="undefined"?self:this,function(){
  const VERSION="0.1.0";
  function createRequest(input={}){
    return {
      sector:"content.intelligence",
      adapter:"intelligence.base",
      adapterVersion:VERSION,
      operationId:input.operationId||null,
      brief:String(input.brief||"").trim(),
      brand:input.brand||null,
      audience:input.audience||null,
      constraints:Array.isArray(input.constraints)?input.constraints:[],
      toolPolicy:input.toolPolicy||"HYBRID"
    };
  }
  function normalizeResearch(raw={}){
    return {
      status:"READY",
      sector:"content.intelligence",
      adapter:"intelligence.base",
      adapterVersion:VERSION,
      operationId:raw.operationId||null,
      summary:String(raw.summary||""),
      topics:Array.isArray(raw.topics)?raw.topics:[],
      insights:Array.isArray(raw.insights)?raw.insights:[],
      evidence:Array.isArray(raw.evidence)?raw.evidence:[],
      tool:{id:raw.toolId||"internal.demo",type:raw.toolType||"LOCAL",mode:raw.mode||"SIMULATION"},
      learning:{
        reusable:false,
        reason:"Sem execução externa nesta versão.",
        signals:Array.isArray(raw.learningSignals)?raw.learningSignals:[]
      }
    };
  }
  return {VERSION,createRequest,normalizeResearch};
});
