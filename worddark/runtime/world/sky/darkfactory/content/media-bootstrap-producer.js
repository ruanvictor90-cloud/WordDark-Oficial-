/* WordDark — Media Bootstrap Producer v0.1
 * Gera uma mídia real de teste no navegador para permitir o primeiro circuito
 * enquanto a Dark Factory ainda não possui renderização pesada/FFmpeg.
 */
(function(global){
  async function produce({title="WordDark Pilot",subtitle="Teste operacional",duration=5,fps=30,width=720,height=1280}={}){
    if(typeof document==="undefined"||typeof MediaRecorder==="undefined")throw new Error("BROWSER_MEDIA_RECORDER_REQUIRED");
    const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext("2d");if(!ctx)throw new Error("CANVAS_UNAVAILABLE");
    const stream=canvas.captureStream(fps);
    const mime=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(x=>MediaRecorder.isTypeSupported(x));
    if(!mime)throw new Error("WEBM_MEDIA_NOT_SUPPORTED");
    const recorder=new MediaRecorder(stream,{mimeType:mime});
    const chunks=[];
    const started=performance.now();
    return await new Promise((resolve,reject)=>{
      recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};
      recorder.onerror=e=>reject(e.error||new Error("MEDIA_RECORDING_FAILED"));
      recorder.onstop=()=>{
        stream.getTracks().forEach(t=>t.stop());
        const blob=new Blob(chunks,{type:mime});
        resolve({success:true,status:"MEDIA_READY",blob,mimeType:mime,filename:"worddark-pilot-"+Date.now()+".webm",durationSeconds:duration,width,height});
      };
      recorder.start(250);
      const draw=now=>{
        const elapsed=(now-started)/1000;
        ctx.clearRect(0,0,width,height);
        ctx.fillStyle="#08080b";ctx.fillRect(0,0,width,height);
        ctx.fillStyle="#ffffff";ctx.textAlign="center";
        ctx.font="bold 54px sans-serif";ctx.fillText("WORDDARK",width/2,height*.40);
        ctx.font="bold 38px sans-serif";ctx.fillText(title.slice(0,32),width/2,height*.50);
        ctx.font="28px sans-serif";ctx.fillText(subtitle.slice(0,42),width/2,height*.56);
        ctx.font="22px sans-serif";ctx.fillText("PILOTO · "+elapsed.toFixed(1)+"s",width/2,height*.64);
        if(elapsed>=duration){recorder.stop();return;}
        requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
    });
  }
  global.WordDarkMediaBootstrapProducer={produce};
})(typeof globalThis!=="undefined"?globalThis:window);
