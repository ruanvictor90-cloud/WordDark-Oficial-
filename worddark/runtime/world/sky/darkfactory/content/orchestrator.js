(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory(
      require("./intelligence/sector"),
      require("./script/sector"),
      require("./identity/sector"),
      require("./image/sector")
    );
  }else{
    root.WordDarkContentFactoryOrchestrator=factory(
      root.WordDarkContentIntelligence,
      root.WordDarkContentScript,
      root.WordDarkContentIdentity,
      root.WordDarkContentImage
    );
  }
})(typeof self!=="undefined"?self:this,function(Intelligence,Script,Identity,Image){

  const VERSION="0.2.0";
  const STAGES=[
    {id:"content.intelligence",name:"INTELLIGENCE"},
    {id:"content.script",name:"SCRIPT"},
    {id:"content.identity",name:"IDENTITY"},
    {id:"content.image",name:"IMAGE"}
  ];

  function createOperationId(input={}){return input.operationId||("OP-CONTENT-"+Date.now().toString(36).toUpperCase());}
  function push(history,stage,result){history.push({stage,status:result.status,result:result.result||null,reason:result.reason||null});}
  function failed(operationId,history,stage){return{success:false,status:"FAILED",operationId,stoppedAt:stage,history};}

  function run(input={}){
    const operationId=createOperationId(input),history=[];
    const intelligence=Intelligence.run({...input,operationId});
    push(history,"INTELLIGENCE",intelligence);
    if(!intelligence.success)return failed(operationId,history,"INTELLIGENCE");
    const script=Script.run({...input,operationId,intelligence:intelligence.result});
    push(history,"SCRIPT",script);
    if(!script.success)return failed(operationId,history,"SCRIPT");
    const identity=Identity.run({...input,operationId,brief:intelligence.result.summary,content:script.result});
    push(history,"IDENTITY",identity);
    if(!identity.success)return failed(operationId,history,"IDENTITY");
    const image=Image.run({...input,operationId,script:script.result,identity:identity.result});
    push(history,"IMAGE",image);
    if(!image.success)return failed(operationId,history,"IMAGE");
    return{success:true,status:"READY",operationId,pipeline:STAGES.map(s=>s.id),history,packages:{intelligence:intelligence.result,script:script.result,identity:identity.result,image:image.result},next:"content.video"};
  }

  function resume(input={}){
    const operationId=input.operationId;
    const packages=input.packages||{};
    const from=input.resumeFrom;
    if(!operationId)return{success:false,status:"FAILED",reason:"OPERATION_ID_REQUIRED"};
    if(!from)return{success:false,status:"FAILED",reason:"RESUME_FROM_REQUIRED",operationId};
    const start=STAGES.findIndex(s=>s.id===from);
    if(start<0)return{success:false,status:"FAILED",reason:"UNKNOWN_RESUME_MODULE",operationId,resumeFrom:from};
    const required={};
    if(start>0)required.intelligence=packages.intelligence;
    if(start>1)required.script=packages.script;
    if(start>2)required.identity=packages.identity;
    for(const key of Object.keys(required))if(!required[key])return{success:false,status:"FAILED",reason:"MISSING_PACKAGE:"+key.toUpperCase(),operationId,resumeFrom:from};
    const history=Array.isArray(input.history)?input.history.slice():[];
    let current=packages;
    if(from==="content.intelligence")return run(input);
    if(from==="content.script"){
      const r=Script.run({...input,operationId,intelligence:packages.intelligence}); push(history,"SCRIPT",r); if(!r.success)return failed(operationId,history,"SCRIPT"); current={...current,script:r.result};
    }
    if(from==="content.identity"){
      const r=Identity.run({...input,operationId,brief:packages.intelligence.summary,content:packages.script}); push(history,"IDENTITY",r); if(!r.success)return failed(operationId,history,"IDENTITY"); current={...current,identity:r.result};
    }
    if(from==="content.image"){
      const r=Image.run({...input,operationId,script:current.script,identity:current.identity}); push(history,"IMAGE",r); if(!r.success)return failed(operationId,history,"IMAGE"); current={...current,image:r.result};
    }
    const startIndex=STAGES.findIndex(s=>s.id===from);
    const pipeline=STAGES.slice(startIndex).map(s=>s.id);
    const next=STAGES[startIndex+1]?STAGES[startIndex+1].id:"content.video";
    return{success:true,status:"READY",operationId,resumedFrom:from,pipeline,history,packages:current,next};
  }

  return{VERSION,run,resume};
});
