import assert from "node:assert/strict";
import { createWordDarkWorld } from "../main.js";
import { AUTONOMY_LEVEL } from "./capability-policy.js";

const world = createWordDarkWorld();

// 1. Rodovia: encontra capacidade e devolve a entrega.
const routed = world.runtime.road.route({
  id: "BLOCK1-ROAD-001",
  origin: "TERRA-BLOCK1",
  service: "DARK-FACTORY",
  type: "REQUEST"
});
assert.equal(routed.success, true);
assert.equal(routed.delivery.status, "ROUTED");
assert.equal(routed.delivery.destination, "DARK-FACTORY");

// 2. Contrato: comunicação interna precisa de contrato válido.
const sent = world.communication.send({
  id: "BLOCK1-COMM-001",
  origin: "TERRA-BLOCK1",
  service: "DARK-FACTORY",
  type: "REQUEST",
  payload: { taskType: "TEST" },
  context: {}
});
assert.equal(sent.success, true);
assert.equal(sent.status, "DELIVERED");
assert.ok(sent.message.destination);
assert.ok(sent.receipt.id);

// 3. Autonomia: ação controlada exige aprovação.
const policy = world.autonomy.set("BLOCK1-MODULE", AUTONOMY_LEVEL.CONTROLLED, {
  allowedActions: ["EXECUTE"],
  requiresApproval: true
});
assert.equal(policy.level, AUTONOMY_LEVEL.CONTROLLED);
assert.equal(world.autonomy.can("BLOCK1-MODULE", "EXECUTE").allowed, false);
world.permissions.grant({subjectId:"BLOCK1-TEST",capability:"BLOCK1-MODULE",action:"EXECUTE"});
assert.equal(world.autonomy.can("BLOCK1-MODULE", "EXECUTE", { subjectId:"BLOCK1-TEST", approved: true }).allowed, true);

// 4. Rollback: registra estado e executa reversão quando há undo.
world.rollback.capture({
  operationId: "BLOCK1-ROLLBACK-001",
  moduleId: "MODULE-A",
  state: { value: 10 },
  undo: state => ({ restoredValue: state.value })
});
assert.equal(world.rollback.available("BLOCK1-ROLLBACK-001", "MODULE-A"), true);
assert.equal(
  world.rollback.rollback("BLOCK1-ROLLBACK-001", "MODULE-A").result.restoredValue,
  10
);

// 5. Ciclo de vida: estrutura temporária pode chegar a DELETED sem apagar o registro histórico.
const temp = world.lifecycle.create({
  id: "BLOCK1-TEMP-001",
  purpose: "Estrutura temporária de teste"
});
assert.equal(temp.status, "CREATED");
assert.equal(world.lifecycle.transition(temp.id, "READY").success, true);
assert.equal(world.lifecycle.transition(temp.id, "ACTIVE").success, true);
assert.equal(world.lifecycle.transition(temp.id, "USED").success, true);
assert.equal(world.lifecycle.evaluate(temp.id).success, true);
assert.equal(world.lifecycle.get(temp.id).status, "DELETED");

// 6. Socorro Deus: parada global bloqueia novas operações e pode ser liberada.
const stop = world.emergencyStop.triggerGlobal({
  requesterId: "BLOCK1-TEST",
  reason: "Teste controlado de emergência"
});
assert.equal(stop.status, "STOPPED");
assert.equal(world.emergencyStop.isStopped("ANY-OP"), true);
const blocked = world.runtime.request({
  id: "BLOCK1-STOPPED-001",
  type: "REQUEST",
  requesterId: "TERRA-BLOCK1",
  origin: "TERRA-BLOCK1",
  destination: "DARK-FACTORY",
  service: "DARK-FACTORY",
  gateId: "DARK-FACTORY-GATE",
  payload: { taskType: "CONTENT.PRODUCE" }
});
assert.equal(blocked.status, "BLOCKED");
assert.equal(world.emergencyStop.release("GLOBAL").status, "RELEASED");
assert.equal(world.emergencyStop.isStopped("ANY-OP"), false);

// 7. Dependência: módulo requerido bloqueia desativação do dependente.
assert.equal(
  world.dependencyMap.canDeactivate("CENTRAL-AUTOMATION-CONTROLLER").allowed,
  false
);

// 8. Auditoria: os mecanismos fechados deixam rastros.
const events = world.audit.list();
assert.ok(events.some(e => e.event === "CONTRACT_REGISTERED"));
assert.ok(events.some(e => e.event === "ROLLBACK_CAPTURED"));
assert.ok(events.some(e => e.event === "ROLLBACK_EXECUTED"));
assert.ok(events.some(e => e.event === "STRUCTURE_CREATED"));
assert.ok(events.some(e => e.event === "STRUCTURE_LIFECYCLE_CHANGED"));
assert.ok(events.some(e => e.event === "AUTONOMY_POLICY_SET"));
assert.ok(events.some(e => e.event === "DEPENDENCY_REGISTERED"));

console.log("WordDark Block 1 closure tests: OK");
