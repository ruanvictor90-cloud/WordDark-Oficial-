const assert=require("node:assert/strict");
const ContentFactory=require("../../core/content-factory");
const ContentModuleRegistry=require("../../core/content-module-registry");
const Pipeline=require("./translation-pipeline");
(async()=>{
  const modules=new ContentModuleRegistry();
  ["INGEST","TRANSFORM","RENDER","VALIDATE"].forEach(module=>modules.register(module,()=>({success:true,status:"MODULE_COMPLETED",module})));
  ["TRANSCRIBE","TRANSLATE","SUBTITLE","DUBBING"].forEach(module=>modules.register(module,context=>Pipeline.execute(module,context,{
    translate:async({segments,targetLanguage})=>({success:true,provider:"test-translate",targetLanguage,segments:segments.map(s=>({...s,translatedText:"Hola mundo"}))}),
    dub:async({text,targetLanguage})=>({success:true,provider:"test-dub",artifact:{type:"AUDIO_FILE",mime:"audio/mpeg",targetLanguage,text,url:"test://dubbed-audio"}})
  })));
  const factory=new ContentFactory({moduleRegistry:modules,executor:{execute:request=>({success:true,status:"PRODUCTION_COMPLETED",result:{contentId:request.payload.contentId}})}});
  const request=factory.receive({id:"REQ-LANG-001",task:"Traduzir vídeo para espanhol com legendas e dublagem",contentId:"VIDEO-001",contentType:"VIDEO",input:{segments:[{start:0,end:1.5,text:"Hello world"}]}});
  assert.equal(request.success,true);
  assert.deepEqual(request.modules,["INGEST","TRANSLATE","SUBTITLE","DUBBING","TRANSFORM","RENDER","VALIDATE"]);
  const result=await factory.execute(request.operationId);
  assert.equal(result.success,true);
  assert.equal(result.status,"COMPLETED");
  assert.ok(result.modules.some(m=>m.module==="TRANSLATE"&&m.status==="TRANSLATED"));
  assert.ok(result.modules.some(m=>m.module==="SUBTITLE"&&m.status==="GENERATED"&&m.format==="srt"));
  assert.ok(result.modules.some(m=>m.module==="DUBBING"&&m.status==="DUBBED"));
  const inferred=factory.receive({id:"REQ-LANG-002",task:"Traduzir vídeo para inglês com legendas",contentId:"VIDEO-002",contentType:"VIDEO",input:{mediaUrl:"https://media.example/video.mp4"}});
  assert.deepEqual(inferred.modules,["INGEST","TRANSCRIBE","TRANSLATE","SUBTITLE","TRANSFORM","RENDER","VALIDATE"]);
  const failed=await factory.execute(inferred.operationId);
  assert.equal(failed.success,false);
  assert.equal(failed.failedModule,"TRANSCRIBE");
  assert.equal(failed.reason,"TRANSCRIPTION_PROVIDER_REQUIRED");
  console.log("content-factory-language: ok");
})().catch(error=>{console.error(error);process.exit(1);});
