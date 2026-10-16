/* WordDark — Emergency Stop Tests */
const assert=require("assert");
const WordDarkEmergencyStop=require("../contracts/emergency-stop");
const WordDarkEmergencyStopManager=require("./emergency-stop-manager");
const WordDarkOperation=require("../contracts/operation");

(function testStopContract(){
  const stop=new WordDarkEmergencyStop({stopId:"STOP-001",sectorId:"sector-content",operationId:"OP-001",requesterId:"SECTOR-001",reason:"Falha crítica."});
  assert.strictEqual(stop.validate().valid,true);
})();

(function testSectorStopsWholeOperation(){
  const manager=new WordDarkEmergencyStopManager({idPrefix:"TESTSTOP"});
  const triggered=manager.trigger({sectorId:"sector-production",operationId:"OP-002",requesterId:"SECTOR-PROD",reason:"Falha crítica no setor de produção."});
  assert.strictEqual(triggered.success,true);
  assert.strictEqual(manager.isStopped("OP-002"),true);
  assert.strictEqual(manager.assertRunning("OP-002").allowed,false);
})();

(function testOtherSectorCannotKeepOperationRunning(){
  const manager=new WordDarkEmergencyStopManager();
  manager.trigger({sectorId:"sector-security",operationId:"OP-003",requesterId:"SECTOR-SEC",reason:"Incidente de segurança."});
  const check=manager.assertRunning("OP-003");
  assert.strictEqual(check.allowed,false);
  assert.strictEqual(check.reason,"EMERGENCY_STOP_ACTIVE");
})();

(function testReleaseFailsClosedWithoutAuthorization(){
  const manager=new WordDarkEmergencyStopManager();
  manager.trigger({sectorId:"sector-content",operationId:"OP-004",requesterId:"SECTOR-CONTENT",reason:"Parada para inspeção."});
  const result=manager.release("OP-004",{requesterId:"ADMIN-001",reason:"Inspeção concluída."});
  assert.strictEqual(result.success,false);
  assert.strictEqual(result.status,"RELEASE_AUTHORIZATION_UNAVAILABLE");
  assert.strictEqual(manager.isStopped("OP-004"),true);
})();

(function testReleaseRequiresExplicitAuthorizationAndAuditReference(){
  const manager=new WordDarkEmergencyStopManager({
    authorizeRelease:({requesterId})=>requesterId==="SAFETY-ADMIN"
      ? {allowed:true,approvalReference:"APPROVAL-004"}
      : {allowed:false}
  });
  manager.trigger({sectorId:"sector-content",operationId:"OP-004B",requesterId:"SECTOR-CONTENT",reason:"Parada para inspeção."});
  const denied=manager.release("OP-004B",{requesterId:"UI-DF",reason:"Tentativa pela interface"});
  assert.strictEqual(denied.success,false);
  assert.strictEqual(manager.isStopped("OP-004B"),true);
  const released=manager.release("OP-004B",{requesterId:"SAFETY-ADMIN",reason:"Inspeção concluída."});
  assert.strictEqual(released.success,true);
  assert.strictEqual(released.approvalReference,"APPROVAL-004");
  assert.strictEqual(manager.isStopped("OP-004B"),false);
  assert.strictEqual(manager.getAudit().some(e=>e.event==="EMERGENCY_STOP_RELEASED"&&e.approvalReference==="APPROVAL-004"),true);
})();

(function testReleaseAuthorizationExceptionKeepsStopActive(){
  const manager=new WordDarkEmergencyStopManager({authorizeRelease:()=>{throw new Error("policy offline")}});
  manager.trigger({sectorId:"sector-content",operationId:"OP-004C",requesterId:"SECTOR-CONTENT",reason:"Parada para inspeção."});
  const result=manager.release("OP-004C",{requesterId:"ADMIN-001",reason:"Inspeção concluída."});
  assert.strictEqual(result.status,"RELEASE_AUTHORIZATION_FAILED");
  assert.strictEqual(manager.isStopped("OP-004C"),true);
})();

(function testOperationCanCancelDuringValidation(){
  const operation=new WordDarkOperation({operationId:"OP-005",requesterId:"CITY-001",originId:"city",destinationId:"darkfactory",operationType:"content.produce",environment:"TEST"});
  operation.transition("IDENTIFIED");
  operation.transition("AUTHORIZED");
  operation.transition("RECEIVED");
  operation.transition("ROUTED");
  operation.transition("EXECUTING");
  operation.transition("VALIDATING");
  assert.strictEqual(operation.canTransitionTo("CANCELLED"),true);
})();

console.log("Emergency stop tests: OK");