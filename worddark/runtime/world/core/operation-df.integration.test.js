const assert = require("assert");
const WordDarkOperation = require("../contracts/operation");
const WordDarkOperationEngine = require("./operation-engine");
const DarkFactoryOperationBridge = require("../sky/darkfactory/core/operation-bridge");

const calls = [];
const fakeRouter = {
  send(args) {
    calls.push({stage:"ROUTING", args});
    return {success:true, routeId:"ROUTE-DF-TEST"};
  }
};
const fakeFactory = {
  process(request) {
    calls.push({stage:"FACTORY", request});
    return {success:true, status:"PROCESSADO", message:"Serviço processado pela Dark Factory."};
  }
};

const bridge = new DarkFactoryOperationBridge({factory:fakeFactory, router:fakeRouter});
const engine = new WordDarkOperationEngine({
  authorize:()=>({allowed:true, reference:"AUTH-DF-TEST"}),
  route:operation=>bridge.route(operation),
  execute:operation=>bridge.execute(operation),
  record:operation=>calls.push({stage:"RECORD", status:operation.status})
});

const operation = engine.create({
  requesterId:"CITY-TEST",
  originId:"world/earth/test-city",
  destinationId:"world/sky/darkfactory",
  operationType:"content.produce",
  environment:"TEST",
  payload:{task:"Produzir material de teste", contentId:"CONTENT-TEST-001"}
});
const result = engine.run(operation);

assert.strictEqual(result.status,"COMPLETED");
assert.strictEqual(calls.filter(x=>x.stage==="ROUTING").length,1);
assert.strictEqual(calls.filter(x=>x.stage==="FACTORY").length,1);
assert.strictEqual(calls.find(x=>x.stage==="FACTORY").request.taskType,"content.produce");
console.log("WordDark Operation → Dark Factory integration test: OK");
