const assert=require("node:assert/strict");
const Engine=require("./content-decision-engine");

const candidates=[
  {
    id:"A",
    title:"Conteúdo histórico",
    scores:{objective:90,audience:90,channel:90,trend:30,identity:95,result:85,feasibility:95,history:90},
    opportunity:35,
    learning:70
  },
  {
    id:"B",
    title:"Tendência atual",
    scores:{objective:85,audience:80,channel:90,trend:98,identity:85,result:90,feasibility:80,history:45},
    opportunity:99,
    learning:85
  },
  {
    id:"C",
    title:"Experimento",
    scores:{objective:70,audience:65,channel:80,trend:40,identity:70,result:60,feasibility:75,history:20},
    opportunity:50,
    learning:100
  }
];

const known=Engine.choose(candidates);
assert.equal(known.success,true);
assert.equal(known.status,"SELECTED");
assert.equal(known.mode,Engine.MODES.BEST_KNOWN);
assert.equal(known.winner.rank,1);
assert.equal(known.candidates.length,3);
assert.equal(typeof known.decision.confidence,"number");
assert.equal(known.decision.alternatives.length,2);

const opportunity=Engine.choose(candidates,{mode:Engine.MODES.BEST_OPPORTUNITY});
assert.equal(opportunity.winner.id,"B");

const learning=Engine.choose(candidates,{mode:Engine.MODES.BEST_LEARNING});
assert.equal(learning.winner.id,"C");

const custom=Engine.evaluate({
  candidates,
  mode:Engine.MODES.BEST_KNOWN,
  weights:{objective:100,audience:0,channel:0,trend:0,identity:0,result:0,feasibility:0,history:0}
});
assert.equal(custom.winner.id,"A");

const empty=Engine.choose([]);
assert.equal(empty.success,false);
assert.equal(empty.status,"NO_CANDIDATES");

console.log("content-decision-engine.test: OK");


const constrained=Engine.choose(candidates,{constraints:{minFeasibility:90}});
assert.equal(constrained.winner.id,"A");

const blocked=Engine.choose(candidates,{constraints:{minFeasibility:99}});
assert.equal(blocked.success,false);
assert.equal(blocked.status,"NO_ELIGIBLE_CANDIDATES");

const risky=Engine.choose([
  {...candidates[0],id:"RISKY",riskScore:95},
  {...candidates[1],id:"SAFE",riskScore:10}
],{constraints:{maxRisk:50}});
assert.equal(risky.winner.id,"SAFE");

console.log("content-decision-engine.constraints.test: OK");
