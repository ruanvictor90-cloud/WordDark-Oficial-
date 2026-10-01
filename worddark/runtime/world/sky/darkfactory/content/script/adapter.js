(function(root,factory){
  if(typeof module==="object"&&module.exports){module.exports=factory();}
  else{root.WordDarkContentScriptAdapter=factory();}
})(typeof self!=="undefined"?self:this,function(){
  const VERSION="0.1.0";
  function createRequest(input={}){
    return {
      sector:"content.script",
      adapter:"script.base",
      adapterVersion:VERSION,
      operationId:input.operationId||null,
      intelligence:input.intelligence||null,
      brand:input.brand||null,
      audience:input.audience||null,
      format:input.format||"SHORT",
      constraints:Array.isArray(input.constraints)?input.constraints:[],
      toolPolicy:input.toolPolicy||"HYBRID"
    };
  }
  function normalizeScript(raw={}){
    return {
      status:"READY",
      sector:"content.script",
      adapter:"script.base",
      adapterVersion:VERSION,
      operationId:raw.operationId||null,
      hook:String(raw.hook||""),
      titleOptions:Array.isArray(raw.titleOptions)?raw.titleOptions:[],
      structure:Array.isArray(raw.structure)?raw.structure:[],
      script:String(raw.script||""),
      metadata:raw.metadata||{},
      tool:{id:raw.toolId||"internal.demo",type:raw.toolType||"LOCAL",mode:raw.mode||"SIMULATION"},
      learning:{
        reusable:false,
        reason:"Execução externa ainda não conectada.",
        signals:Array.isArray(raw.learningSignals)?raw.learningSignals:[]
      }
    };
  }
  return {VERSION,createRequest,normalizeScript};
});
