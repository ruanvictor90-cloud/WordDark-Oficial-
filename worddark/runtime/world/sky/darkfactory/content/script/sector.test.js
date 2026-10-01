const assert=require("assert");
const Script=require("./sector");

const ok=Script.run({
  operationId:"OP-SCRIPT-001",
  intelligence:{
    summary:"Pacote sobre anime e cultura geek.",
    topics:["anime","games","cultura geek"]
  },
  brand:{name:"SucoGeek"},
  audience:"jovem adulto",
  format:"SHORT",
  toolPolicy:"HYBRID"
});

assert.strictEqual(ok.success,true);
assert.strictEqual(ok.status,"READY");
assert.strictEqual(ok.result.operationId,"OP-SCRIPT-001");
assert.strictEqual(ok.result.adapter,"script.base");
assert.strictEqual(ok.result.tool.mode,"SIMULATION");
assert.strictEqual(ok.result.structure[0],"HOOK");
assert.ok(ok.result.script.includes("anime"));

const fail=Script.run({operationId:"OP-SCRIPT-002"});
assert.strictEqual(fail.success,false);
assert.strictEqual(fail.reason,"INTELLIGENCE_OR_BRIEF_REQUIRED");

console.log("SCRIPT SECTOR TEST: PASS");
