(function(root,factory){
  if(typeof module==="object"&&module.exports) module.exports=factory(require("./renderer"));
  else root.WordDarkContentAudio=factory(root.WordDarkAudioRenderer);
})(typeof self!=="undefined"?self:this,function(Renderer){
  async function run(input={}){
    if(!input.asset&&!input.script&&!input.topic)return{success:false,status:"FAILED",reason:"ASSET_OR_SCRIPT_REQUIRED",sector:"content.audio"};
    const result=await Renderer.render({duration:input.duration||5,frequency:input.frequency||440,volume:input.volume??0.12,sampleRate:input.sampleRate||44100});
    return {...result,sector:"content.audio",action:"CREATE_AUDIO"};
  }
  return {run};
});