const assert = require("assert");
const Context = require("./context");
const OperationPackage = require("./operation-package");
const Gate = require("./gate");

const context = new Context({
  clientId: "WD-CLI-0001",
  projectId: "WD-PRJ-0001",
  resourceId: "WD-CH-0001",
  originId: "world/earth/juice-country/sucocast",
  destinationId: "world/sky/darkfactory",
  serviceId: "content.produce",
  environment: "TEST"
});

assert.strictEqual(context.validate().valid, true);

const operation = new OperationPackage({
  operationId: "WD-OP-LAB-0001",
  requesterId: "WD-USR-0001",
  context,
  permission: {
    capability: "content.produce",
    action: "request",
    scope: "world/sky/darkfactory"
  },
  request: {
    task: "Produzir conteúdo de teste"
  }
});

assert.strictEqual(operation.validate().valid, true);

operation.addHistory("CREATED");
operation.addHistory("CONTEXT_VALIDATED");

const gate = new Gate({
  gateId: "WD-GATE-DF-001",
  type: "SERVICE",
  destinationId: "world/sky/darkfactory",
  allowedProfiles: ["CLIENT_OPERATOR"]
});

const accepted = gate.receive({
  profile: "CLIENT_OPERATOR",
  context: context.toJSON()
});

assert.strictEqual(accepted.success, true);

const denied = gate.receive({
  profile: "VIEWER",
  context: context.toJSON()
});

assert.strictEqual(denied.success, false);
assert.strictEqual(denied.reason, "PROFILE_NOT_ALLOWED");

console.log("WordDark Lab contracts: OK");
