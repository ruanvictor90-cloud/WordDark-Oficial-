const assert = require("assert");
const WordDarkOperation = require("./operation");
const WordDarkOperationEngine = require("./operation-engine");

function baseOperation(extra = {}) {
  return new WordDarkOperation({
    operationId:"OP-TEST-001",
    requesterId:"CITY-TEST",
    originId:"world/earth/test-city",
    destinationId:"world/sky/darkfactory",
    operationType:"test.circuit",
    environment:"TEST",
    clientId:"CLIENT-TEST",
    projectId:"PROJECT-TEST",
    resourceId:"RESOURCE-TEST",
    serviceId:"test.circuit",
    ...extra
  });
}

(function testValidLifecycle() {
  const events = [];
  const engine = new WordDarkOperationEngine({
    authorize: () => ({allowed:true,reference:"AUTH-TEST-001"}),
    route: () => ({success:true,routeId:"ROUTE-TEST"}),
    execute: () => ({success:true,result:{status:"PROCESSED"},validated:true}),
    record: op => events.push(op.status)
  });
  const result=engine.run(baseOperation());
  assert.strictEqual(result.status,"COMPLETED");
  assert.deepStrictEqual(events,["IDENTIFIED","AUTHORIZED","ROUTED","EXECUTING","VALIDATING","COMPLETED"]);
})();

(function testReplayProtection() {
  let executions=0;
  const engine=new WordDarkOperationEngine({
    authorize:()=>({allowed:true}),
    route:()=>({success:true,routeId:"ROUTE-TEST"}),
    execute:()=>{executions+=1;return {success:true,result:{status:"PROCESSED"},validated:true};}
  });
  const operation=baseOperation({operationId:"OP-REPLAY-001"});
  const first=engine.run(operation);
  const second=engine.run(operation);
  assert.strictEqual(first.status,"COMPLETED");
  assert.strictEqual(second.status,"COMPLETED");
  assert.strictEqual(executions,1);
  assert.strictEqual(second.replayBlocked,true);
})();

(function testUnauthorized() {
  const engine=new WordDarkOperationEngine({authorize:()=>({allowed:false,reason:"Sem permissão."})});
  const result=engine.run(baseOperation());
  assert.strictEqual(result.status,"REJECTED");
  assert.strictEqual(result.result.reason,"Sem permissão.");
})();

(function testMissingRoute() {
  const engine=new WordDarkOperationEngine({
    authorize:()=>({allowed:true}),
    route:()=>({success:false,reason:"Rota inexistente."})
  });
  const result=engine.run(baseOperation());
  assert.strictEqual(result.status,"BLOCKED");
})();

(function testExecutionFailure() {
  const engine=new WordDarkOperationEngine({
    authorize:()=>({allowed:true}),
    route:()=>({success:true,routeId:"ROUTE-TEST"}),
    execute:()=>({success:false,reason:"Executor indisponível."})
  });
  const result=engine.run(baseOperation());
  assert.strictEqual(result.status,"FAILED");
})();

(function testIllegalTransition() {
  const operation=baseOperation();
  assert.throws(()=>operation.transition("COMPLETED"),/Transição de operação não permitida/);
  operation.transition("IDENTIFIED");
  assert.throws(()=>operation.transition("EXECUTING"),/Transição de operação não permitida/);
})();

(function testTerminalState() {
  const operation=baseOperation();
  operation.transition("IDENTIFIED");
  operation.transition("REJECTED");
  assert.throws(()=>operation.transition("AUTHORIZED"),/Transição de operação não permitida/);
})();

console.log("WordDark Operation tests: OK");
