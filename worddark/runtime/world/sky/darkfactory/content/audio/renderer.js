(function(root,factory){
  if(typeof module==="object"&&module.exports) module.exports=factory();
  else root.WordDarkAudioRenderer=factory();
})(typeof self!=="undefined"?self:this,function(){
  function wavBlob(input={}){
    const duration=Math.max(1,Number(input.duration||5));
    const sampleRate=Number(input.sampleRate||44100);
    const frequency=Number(input.frequency||440);
    const volume=Math.max(0,Math.min(1,Number(input.volume??0.12)));
    const samples=Math.floor(duration*sampleRate);
    const buffer=new ArrayBuffer(44+samples*2);
    const view=new DataView(buffer);
    const write=(o,s)=>{for(let i=0;i<s.length;i++)view.setUint8(o+i,s.charCodeAt(i));};
    write(0,"RIFF"); view.setUint32(4,36+samples*2,true); write(8,"WAVE"); write(12,"fmt ");
    view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true); view.setUint32(24,sampleRate,true);
    view.setUint32(28,sampleRate*2,true); view.setUint16(32,2,true); view.setUint16(34,16,true); write(36,"data"); view.setUint32(40,samples*2,true);
    for(let i=0;i<samples;i++){ const t=i/sampleRate; const fade=Math.min(1,t*8,(duration-t)*8); const sample=Math.sin(2*Math.PI*frequency*t)*volume*Math.max(0,fade); view.setInt16(44+i*2,Math.max(-1,Math.min(1,sample))*32767,true); }
    if(typeof Blob!=="undefined") return new Blob([buffer],{type:"audio/wav"});
    return null;
  }
  function render(input={}){
    if(typeof Blob==="undefined") return Promise.resolve({success:true,status:"PLANNED",reason:"BROWSER_AUDIO_OUTPUT_REQUIRED",format:"wav"});
    const blob=wavBlob(input);
    return Promise.resolve({success:true,status:"GENERATED",format:"wav",mime:"audio/wav",duration:Math.max(1,Number(input.duration||5)),sampleRate:Number(input.sampleRate||44100),artifact:{type:"AUDIO_FILE",mime:"audio/wav",format:"wav",duration:Math.max(1,Number(input.duration||5)),sampleRate:Number(input.sampleRate||44100),blob}});
  }
  return {render,wavBlob};
});