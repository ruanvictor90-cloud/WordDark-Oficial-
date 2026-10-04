const assert=require("assert");
const Center=require("./operation-center");
const Production=require("../contracts/production");
const Result=require("../contracts/result");
const Planner=require("./production-planner");
const Operation=require("../contracts/operation");
const language=require("./universal-language");
const calls=[];
const coordinator={submit:(op)=>{calls.push(op);op.status="COMPLETED";op.result={ok:true};return op;},engine:{reenter:(op,module)=>{op.currentModuleId=module;return op;}}};
const planner={plan:p=>Planner.plan(p)};
const productionEngine={
  create:s=>new Production({...s,productionId:s.productionId||"P-TEST"}),
  plan:(p)=>{p.transition("PLANNED");p.setOperationPlan(planner.plan(p).operations);return p;},
  execute:p=>{p.transition("EXECUTING");for(const op of p.operationPlan){const r=coordinator.submit(op);if(r.status!=="COMPLETED"){p.transition("FAILED");return p;}}p.transition("COMPLETED",{ok:true});return p;}
};
const center=new Center({operationCoordinator:coordinator,productionEngine,planner,requesterId:"TEST",defaultOrigin:"world/test"});
assert.strictEqual(language.parse("trocar o áudio").action,"REPLACE_AUDIO");
let result=center.submit({type:"OPERATION",action:"REPLACE_AUDIO",resourceId:"asset-1"});
assert.strictEqual(result.success,true);
assert.strictEqual(calls[0].action,"REPLACE_AUDIO");
result=center.submit({type:"PRODUCTION",goal:"criar um vídeo e publicar",quantity:1});
assert.strictEqual(result.success,true);
assert.strictEqual(calls.length,3);
assert.strictEqual(calls[1].action,"CREATE_CONTENT");
assert.strictEqual(calls[2].action,"PUBLISH_CONTENT");
assert.ok(calls[2].context.dependencies.length>0);
console.log("operation-center: ok");