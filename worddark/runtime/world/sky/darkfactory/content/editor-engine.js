/* WordDark — Dark Factory Editor Engine · modular block execution */
(function(root,factory){
  if(typeof module==="object"&&module.exports) module.exports=factory(require("./editing-blocks"));
  else root.WordDarkEditorEngine=factory(root.WordDarkEditingBlocks);
})(typeof self!=="undefined"?self:this,function(Catalog){
  function EditorEngine(){this.history=[];}
  EditorEngine.prototype.apply=function(input={}){
    const block=Catalog.create(input.blockId,input.params||{});
    if(!block.success)return block;
    const operationId=input.operationId||("EDIT-"+Date.now().toString(36).toUpperCase());
    const result={success:true,status:"APPLIED",operationId,blockId:block.blockId,sector:block.sector,input:input.asset||input.content||null,params:block.params,artifact:{type:"EDIT_INSTRUCTION",block:block.blockId,operationId}};
    this.history.push(result); return result;
  };
  EditorEngine.prototype.applyMany=function(input={}){
    const blocks=Array.isArray(input.blocks)?input.blocks:[];
    const results=[]; for(const b of blocks){const r=this.apply({...input,...b});results.push(r);if(!r.success)return{success:false,status:"FAILED",operationId:r.operationId,results,failedBlock:r.blockId};}
    return{success:true,status:"APPLIED",operationId:input.operationId||null,results};
  };
  EditorEngine.prototype.reenter=function(operationId,blockId,params={}){
    return this.apply({operationId,blockId,params,asset:{reentry:true}});
  };
  EditorEngine.prototype.listHistory=function(){return this.history.slice();};
  return EditorEngine;
});