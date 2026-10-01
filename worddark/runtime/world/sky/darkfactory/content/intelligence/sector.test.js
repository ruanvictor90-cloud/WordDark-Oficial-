const assert=require("node:assert/strict");
const {run}=require("./sector");

const ok=run({
  operationId:"OP-INTEL-001",
  brief:"anime, games, cultura geek",
  brand:{name:"SucoGeek"},
  audience:"jovem adulto",
  toolPolicy:"HYBRID"
});
assert.equal(ok.success,true);
assert.equal(ok.result.status,"READY");
assert.equal(ok.result.operationId,"OP-INTEL-001");
assert.equal(ok.result.adapter,"intelligence.base");
assert.equal(ok.result.tool.mode,"SIMULATION");

const invalid=run({brief:""});
assert.equal(invalid.success,false);
assert.equal(invalid.reason,"BRIEF_REQUIRED");

console.log("INTELLIGENCE SECTOR TEST: PASS");
