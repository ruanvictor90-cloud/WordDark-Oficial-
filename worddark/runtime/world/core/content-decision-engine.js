/* WordDark — Content Decision Engine v0.2
 * Escolhe conteúdo sem produzir.
 * WordDark coordena a decisão; Marketing fornece sinais;
 * Gestão de Conteúdos consome a escolha.
 */
(function(root,factory){
  if(typeof module==="object"&&module.exports)module.exports=factory();
  else{const r=root||(typeof window!=="undefined"?window:globalThis);r.WordDarkContentDecisionEngine=factory();}
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  const DEFAULT_WEIGHTS=Object.freeze({objective:25,audience:15,channel:10,trend:10,identity:10,result:15,feasibility:5,history:10});
  const MODES=Object.freeze({BEST_KNOWN:"BEST_KNOWN",BEST_OPPORTUNITY:"BEST_OPPORTUNITY",BEST_LEARNING:"BEST_LEARNING"});

  function number(value,fallback=0){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(100,n)):fallback;}
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
      opportunity:number(scores.opportunity??candidate.opportunity??candidate.opportunityScore),
      learning:number(scores.learning??candidate.learning??candidate.learningScore),
      risk:number(candidate.riskScore??scores.risk),
      available:candidate.available!==false,
      blocked:candidate.blocked===true,
      tags:Array.isArray(candidate.tags)?candidate.tags:[],
      metadata:candidate.metadata||{}
    };
  }
  function eligible(c,options={}){
    if(!c.available)return{ok:false,reason:"UNAVAILABLE"};
    if(c.blocked)return{ok:false,reason:"BLOCKED"};
    if(options.maxRisk!=null&&c.risk>number(options.maxRisk))return{ok:false,reason:"RISK_ABOVE_LIMIT"};
    if(options.minFeasibility!=null&&c.feasibility<number(options.minFeasibility))return{ok:false,reason:"FEASIBILITY_BELOW_LIMIT"};
    if(options.minScore!=null){
      const minimum=number(options.minScore);
      const raw=Math.round(((c.objective+c.audience+c.channel+c.identity+c.feasibility)/5)*100)/100;
      if(raw<minimum)return{ok:false,reason:"BELOW_MINIMUM_SCORE"};
    }
    if(Array.isArray(options.requiredTags)&&options.requiredTags.length&&!options.requiredTags.every(t=>c.tags.includes(t)))return{ok:false,reason:"REQUIRED_TAG_MISSING"};
    return{ok:true,reason:null};
  }
  function score(candidate,weights=DEFAULT_WEIGHTS,mode=MODES.BEST_KNOWN){
    const c=normalizeCandidate(candidate);
    const totalWeight=Object.values(weights).reduce((a,b)=>a+Number(b||0),0)||100;
    const weighted=(c.objective*Number(weights.objective||0)+c.audience*Number(weights.audience||0)+c.channel*Number(weights.channel||0)+c.trend*Number(weights.trend||0)+c.identity*Number(weights.identity||0)+c.result*Number(weights.result||0)+c.feasibility*Number(weights.feasibility||0)+c.history*Number(weights.history||0))/totalWeight;
    let final=weighted;
    if(mode===MODES.BEST_OPPORTUNITY)final=weighted*0.75+c.opportunity*0.25;
    if(mode===MODES.BEST_LEARNING)final=weighted*0.65+c.learning*0.35;
    return{...c,baseScore:Number(weighted.toFixed(2)),score:Number(final.toFixed(2)),mode};
  }
  function rank(candidates=[],options={}){
    const mode=options.mode||MODES.BEST_KNOWN,weights={...DEFAULT_WEIGHTS,...(options.weights||{})};
    const constraints={...options,...(options.constraints||{})};
    const eligibleCandidates=[],rejected=[];
    (Array.isArray(candidates)?candidates:[]).forEach((candidate,index)=>{
      const normalized=normalizeCandidate(candidate,index),check=eligible(normalized,constraints);
      if(!check.ok){rejected.push({...normalized,rejectionReason:check.reason});return;}
      eligibleCandidates.push(score(normalized,weights,mode));
    });
    const ranked=eligibleCandidates.sort((a,b)=>b.score-a.score||b.feasibility-a.feasibility||b.result-a.result||a.id.localeCompare(b.id));
    return{ranked:ranked.map((item,index)=>({...item,rank:index+1})),rejected};
  }
  function contributions(candidate,weights=DEFAULT_WEIGHTS){
    const c=normalizeCandidate(candidate),total=Object.values(weights).reduce((a,b)=>a+Number(b||0),0)||100;
    return Object.entries(weights).map(([criterion,weight])=>({criterion,weight:Number(weight||0),contribution:Number((c[criterion]*Number(weight||0)/total).toFixed(2))})).filter(x=>x.weight>0);
  }
  function choose(candidates=[],options={}){
    const mode=options.mode||MODES.BEST_KNOWN;
    const result=rank(candidates,{...options,mode});
    if(!result.ranked.length)return{success:false,status:"NO_ELIGIBLE_CANDIDATES",mode,candidates:[],rejected:result.rejected,winner:null,reason:result.rejected.length?"Todos os candidatos foram bloqueados pelos critérios de decisão.":"Nenhum candidato de conteúdo foi fornecido."};
    const winner=result.ranked[0],runnerUp=result.ranked[1]||null;
    const confidence=runnerUp?Number(Math.max(0,Math.min(100,(winner.score-runnerUp.score)*2)).toFixed(2)):100;
    return{success:true,status:"SELECTED",mode,winner,runnerUp,candidates:result.ranked,rejected:result.rejected,decision:{selectedId:winner.id,score:winner.score,confidence,margin:runnerUp?Number((winner.score-runnerUp.score).toFixed(2)):winner.score,reason:reasonFor(winner),trace:contributions(winner,options.weights?{...DEFAULT_WEIGHTS,...options.weights}:DEFAULT_WEIGHTS),alternatives:result.ranked.slice(1,3).map(item=>({id:item.id,title:item.title,score:item.score}))}};
  }
  function reasonFor(candidate){
    if(candidate.mode===MODES.BEST_OPPORTUNITY)return"Maior combinação entre adequação geral e oportunidade atual.";
    if(candidate.mode===MODES.BEST_LEARNING)return"Maior combinação entre adequação geral e valor de aprendizado.";
    return"Maior adequação conhecida ao objetivo, público, canal, identidade, resultado, viabilidade e histórico.";
  }
  function evaluate(input={}){return choose(input.candidates||[],{mode:input.mode,weights:input.weights,maxRisk:input.maxRisk,minScore:input.minScore,requiredTags:input.requiredTags});}
  return{DEFAULT_WEIGHTS,MODES,normalizeCandidate,eligible,score,rank,contributions,choose,evaluate};
});