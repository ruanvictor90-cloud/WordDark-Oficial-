(function(root,factory){
  if(typeof module==="object"&&module.exports){module.exports=factory(require("./adapter"));}
  else{root.WordDarkContentScript=factory(root.WordDarkContentScriptAdapter);}
})(typeof self!=="undefined"?self:this,function(Adapter){
  function run(input={}){
    const request=Adapter.createRequest(input);
    if(!request.intelligence && !String(input.brief||"").trim())
      return {success:false,status:"FAILED",reason:"INTELLIGENCE_OR_BRIEF_REQUIRED",request};

    const source=request.intelligence||{summary:String(input.brief||"").trim()};
    const summary=String(source.summary||"").trim();
    const topic=(Array.isArray(source.topics)&&source.topics[0])||summary.split(/[,.;]/)[0]||"conteúdo";

    const result=Adapter.normalizeScript({
      operationId:request.operationId,
      hook:"Você conhece o ponto mais curioso sobre "+topic+"?",
      titleOptions:[
        "O que você precisa saber sobre "+topic,
        "3 pontos que mudam sua visão sobre "+topic,
        "A verdade por trás de "+topic
      ],
      structure:["HOOK","CONTEXTO","DESENVOLVIMENTO","FECHAMENTO","CTA"],
      script:[
        "HOOK: Você conhece o ponto mais curioso sobre "+topic+"?",
        "CONTEXTO: apresentar rapidamente o assunto.",
        "DESENVOLVIMENTO: organizar os principais pontos da inteligência recebida.",
        "FECHAMENTO: resumir a ideia central.",
        "CTA: convidar o público para continuar acompanhando."
      ].join("\n"),
      metadata:{format:request.format,audience:request.audience,brand:request.brand},
      toolId:"internal.demo",toolType:"LOCAL",mode:"SIMULATION",
      learningSignals:["intelligence_to_script"]
    });
    return {success:true,status:"READY",request,result};
  }
  return {run};
});
