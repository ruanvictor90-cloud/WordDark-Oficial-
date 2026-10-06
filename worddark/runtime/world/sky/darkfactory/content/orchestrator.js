(function(root,factory){if(typeof module==="object"&&module.exports){module.exports=factory(require("./intelligence/sector"),require("./script/sector"),require("./identity/sector"),require("./image/sector"),require("./video/sector"),require("./audio/sector"),require("./testing/sector"),require("./control/sector"),require("./learning/sector"));}else{root.WordDarkContentFactoryOrchestrator=factory(root.WordDarkContentIntelligence,root.WordDarkContentScript,root.WordDarkContentIdentity,root.WordDarkContentImage,root.WordDarkContentVideo,root.WordDarkContentAudio,root.WordDarkContentTesting,root.WordDarkContentControl,root.WordDarkContentLearning);}})(typeof self!=="undefined"?self:this,function(Intelligence,Script,Identity,Image,Video,Audio,Testing,Control,Learning){
const VERSION="0.4.0";
const STAGES=[["content.intelligence",Intelligence],["content.script",Script],["content.identity",Identity],["content.image",Image],["content.video",Video],["content.audio",Audio],["content.testing",Testing],["content.control",Control],["content.learning",Learning]];
const ALIASES={INTELLIGENCE:"content.intelligence",SCRIPT:"content.script",IDENTITY:"content.identity",IMAGE:"content.image",PHOTO:"content.image",VIDEO:"content.video",AUDIO:"content.audio",TESTING:"content.testing",CONTROL:"content.control",LEARNING:"content.learning"};
function id(input={}){return input.operationId||("OP-CONTENT-"+Date.now().toString(36).toUpperCase());}
function find(stage){return STAGES.find(x=>x[0]===stage);}
function normalizeStages(input={}){
  const requested=Array.isArray(input.sectors)?input.sectors:Array.isArray(input.modules)?input.modules:null;
  if(!requested||!requested.length)return STAGES.map(x=>x[0]);
  return requested.map(x=>ALIASES[String(x).toUpperCase()]||String(x).toLowerCase()).filter(x=>find(x));
}
function dependencies(stage,input,packages){
  if(stage==="content.script"&&packages.intelligence)return{intelligence:packages.intelligence};
  if(stage==="content.identity")return{brief:input.brief||packages.intelligence?.summary,content:packages.script||input.content};
  if(stage==="content.image")return{script:packages.script||input.script,identity:packages.identity||input.identity};
  return{asset:input.asset||packages.image||packages.video,script:packages.script||input.script,result:packages};
}
function runSector(stage,input,operationId,packages){
  const found=find(stage);if(!found)return{success:false,status:"SECTOR_NOT_FOUND",stage};
  return found[1].run({...input,...dependencies(stage,input,packages),operationId});
}
async function run(input={}){
  const operationId=id(input),history=[],packages={},pipeline=normalizeStages(input);
  for(const stage of pipeline){
    const r=await runSector(stage,input,operationId,packages);
    history.push({stage,status:r.status,result:r.result||r.record||r.variants||null,reason:r.reason||null});
    if(!r.success)return{success:false,status:"FAILED",operationId,stoppedAt:stage,history,pipeline,packages,reason:r.reason||null};
    packages[stage.split(".")[1]]=r.result||r.record||r.variants||r;
  }
  return{success:true,status:"READY",operationId,pipeline,history,packages,next:"external.connection"};
}
async function runOne(input={}){
  const stage=normalizeStages({...input,sectors:[input.sector||input.module]})[0];
  if(!stage)return{success:false,status:"SECTOR_REQUIRED"};
  return await run({...input,sectors:[stage]});
}
function listSectors(){return STAGES.map(x=>({id:x[0],alias:Object.keys(ALIASES).find(k=>ALIASES[k]===x[0])||x[0].split(".")[1],independent:true}));}
return{VERSION,run,runOne,listSectors,normalizeStages};
});