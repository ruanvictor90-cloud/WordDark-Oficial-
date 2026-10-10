/* WordDark Dark Factory — translation, subtitles and dubbing pipeline.
 * Providers are injected. Never reports machine translation or speech synthesis as done when no provider exists.
 */
(function(root,factory){
  if(typeof module==="object"&&module.exports)module.exports=factory();
  else root.WordDarkTranslationPipeline=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  const str=v=>String(v??"").trim();
  const stamp=value=>{
    const n=Math.max(0,Math.round(Number(value)||0));
    const h=Math.floor(n/3600000),m=Math.floor(n%3600000/60000),s=Math.floor(n%60000/1000),ms=n%1000;
    return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")+","+String(ms).padStart(3,"0");
  };
  function normalizeSegments(input){
    const source=Array.isArray(input)?input:[];
    return source.map((item,index)=>({
      index:index+1,
      startMs:Number.isFinite(Number(item.startMs))?Number(item.startMs):Math.round(Number(item.start||0)*1000),
      endMs:Number.isFinite(Number(item.endMs))?Number(item.endMs):Math.round(Number(item.end||0)*1000),
      text:str(item.text||item.transcript||item.sourceText),
      translatedText:str(item.translatedText||item.translation)
    })).filter(item=>item.text||item.translatedText).map(item=>({...item,endMs:Math.max(item.startMs+1,item.endMs)}));
  }
  function renderSubtitles(segments,{format="srt",translated=false}={}){
    const normalized=normalizeSegments(segments);
    if(!normalized.length)return{success:false,status:"NEEDS_TRANSCRIPT",reason:"TRANSCRIPT_SEGMENTS_REQUIRED"};
    const vtt=String(format).toLowerCase()==="vtt";
    const body=normalized.map((s,i)=>{
      const text=translated?(s.translatedText||s.text):s.text;
      return String(i+1)+"\n"+stamp(s.startMs).replace(",",vtt?".":",")+" --> "+stamp(s.endMs).replace(",",vtt?".":",")+"\n"+text;
    }).join("\n\n");
    const content=vtt?"WEBVTT\n\n"+body:body;
    return{success:true,status:"GENERATED",format:vtt?"vtt":"srt",mime:vtt?"text/vtt":"application/x-subrip",content,segments:normalized.length};
  }
  async function execute(moduleId,context={},adapters={}){
    const operation=context.operation||{},requirements=operation.requirements||{},options=operation.options||{};
    const input=operation.input||requirements.input||{};
    const previous=Array.isArray(context.previous)?context.previous:[];
    const previousSegments=previous.flatMap(x=>x.segments||x.result?.segments||[]);\n    const transcript=previousSegments.length?previousSegments:(input.segments||input.transcriptSegments||requirements.segments||requirements.transcriptSegments||[]);
    const sourceText=str(input.text||input.transcript||requirements.text||requirements.transcript||transcript.map(x=>x.text).join(" "));
    const sourceLanguage=str(requirements.sourceLanguage||options.sourceLanguage||input.sourceLanguage);
    const targetLanguage=str(requirements.targetLanguage||options.targetLanguage||input.targetLanguage);
    const id=String(moduleId||"").toUpperCase();
    if(id==="TRANSCRIBE"){
      const media=input.media||input.asset||input.mediaUrl||input.url||requirements.media||requirements.asset||requirements.mediaUrl;
      if(!media)return{success:false,status:"NEEDS_MEDIA",module:id,reason:"SOURCE_MEDIA_REQUIRED"};
      if(typeof adapters.transcribe!=="function")return{success:false,status:"NEEDS_PROVIDER",module:id,reason:"TRANSCRIPTION_PROVIDER_REQUIRED"};
      const result=await adapters.transcribe({media,sourceLanguage:sourceLanguage||"auto",operationId:operation.operationId});
      if(!result||result.success===false||!Array.isArray(result.segments)||!result.segments.length)return{success:false,status:"FAILED",module:id,reason:result?.reason||"TRANSCRIPTION_SEGMENTS_REQUIRED"};
      return{success:true,status:"TRANSCRIBED",module:id,sourceLanguage:result.sourceLanguage||sourceLanguage||"auto",segments:normalizeSegments(result.segments),provider:result.provider||"injected"};
    }
    if(id==="TRANSLATE"){
      if(!targetLanguage)return{success:false,status:"NEEDS_CONFIGURATION",module:id,reason:"TARGET_LANGUAGE_REQUIRED"};
      if(!sourceText&&!transcript.length)return{success:false,status:"NEEDS_TRANSCRIPT",module:id,reason:"TRANSCRIPT_OR_TEXT_REQUIRED"};
      if(typeof adapters.translate!=="function")return{success:false,status:"NEEDS_PROVIDER",module:id,reason:"TRANSLATION_PROVIDER_REQUIRED",sourceLanguage:sourceLanguage||null,targetLanguage};
      const result=await adapters.translate({text:sourceText,segments:normalizeSegments(transcript),sourceLanguage:sourceLanguage||"auto",targetLanguage,operationId:operation.operationId});
      if(!result||result.success===false)return{success:false,status:"FAILED",module:id,reason:result?.reason||"TRANSLATION_FAILED"};
      const translatedSegments=normalizeSegments(result.segments||transcript).map((s,i)=>({...s,translatedText:str(s.translatedText||s.translation)||(Array.isArray(result.segments)?str(result.segments[i]?.text):"")}));
      return{success:true,status:"TRANSLATED",module:id,sourceLanguage:sourceLanguage||result.sourceLanguage||"auto",targetLanguage,text:str(result.text),segments:translatedSegments,provider:result.provider||"injected"};
    }
    if(id==="SUBTITLE"){
      const translated=Boolean(requirements.translated||options.translated||transcript.some(x=>x.translatedText||x.translation));
      const result=renderSubtitles(transcript,{format:requirements.subtitleFormat||options.subtitleFormat||"srt",translated});
      return{...result,module:id,targetLanguage:targetLanguage||null};
    }
    if(id==="DUBBING"){
      if(!targetLanguage)return{success:false,status:"NEEDS_CONFIGURATION",module:id,reason:"TARGET_LANGUAGE_REQUIRED"};
      const textForVoice=transcript.map(x=>str(x.translatedText||x.translation||x.text)).join(" ")||sourceText;
      if(!textForVoice)return{success:false,status:"NEEDS_TRANSCRIPT",module:id,reason:"TRANSCRIPT_OR_TEXT_REQUIRED"};
      if(typeof adapters.dub!=="function")return{success:false,status:"NEEDS_PROVIDER",module:id,reason:"DUBBING_PROVIDER_REQUIRED",targetLanguage};
      const result=await adapters.dub({text:textForVoice,segments:normalizeSegments(transcript),sourceLanguage,targetLanguage,voice:requirements.voice||options.voice||null,operationId:operation.operationId});
      if(!result||result.success===false||!result.artifact)return{success:false,status:"FAILED",module:id,reason:result?.reason||"DUBBING_ARTIFACT_REQUIRED"};
      return{success:true,status:"DUBBED",module:id,targetLanguage,artifact:result.artifact,duration:result.duration||null,provider:result.provider||"injected"};
    }
    return{success:false,status:"MODULE_UNSUPPORTED",module:id};
  }
  return{execute,normalizeSegments,renderSubtitles};
});
