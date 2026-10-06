/* WordDark — Content Decision Engine v0.1
 * Escolhe entre candidatos de conteúdo sem produzir o conteúdo.
 * WordDark coordena a decisão; Marketing pode fornecer sinais/oportunidades;
 * Gestão de Conteúdos e Canais pode consumir a escolha.
 */
(function(root,factory){
  if(typeof module==="object"&&module.exports)module.exports=factory();
  else{
    const r=root||(typeof window!=="undefined"?window:globalThis);
    r.WordDarkContentDecisionEngine=factory();
  }
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  const DEFAULT_WEIGHTS=Object.freeze({
    objective:25,
    audience:15,
    channel:10,
    trend:10,
    identity:10,
    result:15,
    feasibility:5,
    history:10
  });

  const MODES=Object.freeze({
    BEST_KNOWN:"BEST_KNOWN",
    BEST_OPPORTUNITY:"BEST_OPPORTUNITY",
    BEST_LEARNING:"BEST_LEARNING"
  });

  function number(value,fallback=0){
    const n=Number(value);
    return Number.isFinite(n)?Math.max(0,Math.min(100,n)):fallback;
  }

  function normalizeCandidate(candidate={},index=0){
    const scores=candidate.scores||candidate.score||{};
    return{
      id:String(candidate.id||candidate.contentId||("CONTENT-"+String(index+1).padStart(2,"0"))),
      title:candidate.title||candidate.name||("Candidato "+(index+1)),
      objective:number(scores.objective??candidate.objectiveScore),
      audience:number(scores.audience??candidate.audienceScore),
      channel:number(scores.channel??candidate.channelScore),
      trend:number(scores.trend??candidate.trendScore),
      identity:number(scores.identity??candidate.identityScore),
      result:number(scores.result??candidate.resultScore),
      feasibility:number(scores.feasibility??candidate.feasibilityScore),
      history:number(scores.history??candidate.historyScore),
      opportunity:number(scores.opportunity??candidate.opportunityScore),
      learning:number(scores.learning??candidate.learningScore),
      risk:number(candidate.riskScore,0),
      metadata:candidate.metadata||{}
    };
  }

  function score(candidate,weights=DEFAULT_WEIGHTS,mode=MODES.BEST_KNOWN){
    const c=normalizeCandidate(candidate);
    const totalWeight=Object.values(weights).reduce((a,b)=>a+Number(b||0),0)||100;
    const weighted=(
      c.objective*Number(weights.objective||0)+
      c.audience*Number(weights.audience||0)+
      c.channel*Number(weights.channel||0)+
      c.trend*Number(weights.trend||0)+
      c.identity*Number(weights.identity||0)+
      c.result*Number(weights.result||0)+
      c.feasibility*Number(weights.feasibility||0)+
      c.history*Number(weights.history||0)
    )/totalWeight;

    let final=weighted;
    if(mode===MODES.BEST_OPPORTUNITY)final=weighted*0.75+c.opportunity*0.25;
    if(mode===MODES.BEST_LEARNING)final=weighted*0.65+c.learning*0.35;

    return{
      ...c,
      baseScore:Number(weighted.toFixed(2)),
      score:Number(final.toFixed(2)),
      mode
    };
  }

  function eligible(candidate,constraints={}){
    const c=normalizeCandidate(candidate);
    if(constraints.minObjective!=null&&c.objective<number(constraints.minObjective))return false;
    if(constraints.minAudience!=null&&c.audience<number(constraints.minAudience))return false;
    if(constraints.minFeasibility!=null&&c.feasibility<number(constraints.minFeasibility))return false;
    if(constraints.minIdentity!=null&&c.identity<number(constraints.minIdentity))return false;
    if(constraints.maxRisk!=null&&c.risk>number(constraints.maxRisk,100))return false;
    return true;
  }

  function rank(candidates=[],options={}){
    const mode=options.mode||MODES.BEST_KNOWN;
    const weights={...DEFAULT_WEIGHTS,...(options.weights||{})};
    const source=Array.isArray(candidates)?candidates:[];
    const eligibleCandidates=source.filter(candidate=>eligible(candidate,options.constraints||{}));
    const ranked=eligibleCandidates
      .map((candidate,index)=>score(candidate,weights,mode))
      .sort((a,b)=>b.score-a.score);
    return ranked.map((item,index)=>({...item,rank:index+1}));
  }

  function choose(candidates=[],options={}){
    const source=Array.isArray(candidates)?candidates:[];
    const ranked=rank(source,options);
    if(!source.length)return{
      success:false,status:"NO_CANDIDATES",mode:options.mode||MODES.BEST_KNOWN,
      candidates:[],winner:null,reason:"Nenhum candidato de conteúdo foi fornecido."
    };
    if(!ranked.length)return{
      success:false,status:"NO_ELIGIBLE_CANDIDATES",mode:options.mode||MODES.BEST_KNOWN,
      candidates:[],winner:null,reason:"Nenhum candidato atende aos critérios mínimos da decisão.",constraints:options.constraints||{}
    };
    const winner=ranked[0];
    const runnerUp=ranked[1]||null;
    const confidence=runnerUp
      ? Number(Math.max(0,Math.min(100,(winner.score-runnerUp.score)*2)).toFixed(2))
      : 100;
    return{
      success:true,
      status:"SELECTED",
      mode:winner.mode,
      winner,
      runnerUp,
      candidates:ranked,
      decision:{
        selectedId:winner.id,
        score:winner.score,
        confidence,
        reason:reasonFor(winner),
        alternatives:ranked.slice(1,3).map(item=>({id:item.id,title:item.title,score:item.score}))
      }
    };
  }

  function reasonFor(candidate){
    if(candidate.mode===MODES.BEST_OPPORTUNITY)
      return "Maior combinação entre adequação geral e oportunidade atual.";
    if(candidate.mode===MODES.BEST_LEARNING)
      return "Maior combinação entre adequação geral e valor de aprendizado.";
    return "Maior adequação conhecida ao objetivo, público, canal, identidade, resultado, viabilidade e histórico.";
  }

  function evaluate(input={}){
    return choose(input.candidates||[],{
      mode:input.mode,
      weights:input.weights
    });
  }

  return{
    DEFAULT_WEIGHTS,
    MODES,
    normalizeCandidate,
    eligible,
    score,
    rank,
    choose,
    evaluate
  };
});
