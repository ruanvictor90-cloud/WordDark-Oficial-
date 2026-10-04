const assert=require("assert");
const Planner=require("./production-planner");
const Production=require("../contracts/production");

const production=new Production({
  productionId:"TEST-PROD-001",
  requesterId:"TEST-USER",
  originId:"TEST-CENTRAL",
  goal:"editar essa foto",
  resourceId:"PHOTO-001",
  quantity:1,
  options:{environment:"TEST"}
});
const plan=Planner.plan(production);
assert.strictEqual(plan.success,true);
assert.strictEqual(plan.action,"EDIT_PHOTO");
assert.strictEqual(plan.operations.length,1);
assert.strictEqual(plan.operations[0].capability,"CONTENT_EDIT");
assert.strictEqual(plan.operations[0].parentProductionId,"TEST-PROD-001");

const video=new Production({
  productionId:"TEST-PROD-002",requesterId:"TEST-USER",originId:"TEST-CENTRAL",
  goal:"cortar esse vídeo",resourceId:"VIDEO-001",options:{environment:"TEST"}
});
const videoPlan=Planner.plan(video);
assert.strictEqual(videoPlan.action,"CUT_VIDEO");

console.log("production-planner: ok");
