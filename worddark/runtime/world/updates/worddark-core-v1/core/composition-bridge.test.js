const assert = require("assert");
const Bridge = require("./composition-bridge");
const Context = require("./context");
const OperationPackage = require("./operation-package");
const { WordDarkLabPermission, WordDarkLabPermissionSet } = require("./permissions");
const Gate = require("./gate");

function createLabOperation() {
  const context = new Context({
    clientId: "WD-CLI-0001",
    projectId: "WD-PRJ-0001",
    resourceId: "WD-CH-0001",
    originId: "world/earth/juice-country/sucocast",
    destinationId: "world/sky/darkfactory",
    serviceId: "content.produce",
    environment: "TEST"
  });

  return new OperationPackage({
    operationId: "WD-OP-LAB-0001",
    requesterId: "WD-USR-0001",
    context,
    permission: {
      capability: "content.produce",
      action: "request",
      scope: "world/sky/darkfactory"
    },
    request: { task: "Teste de composição" }
  });
}

const permissionSet = new WordDarkLabPermissionSet();
permissionSet.grant(new WordDarkLabPermission({
  profile: "CLIENT_OPERATOR",
  capability: "content.produce",
  action: "request",
  resourceId: "WD-CH-0001",
  clientId: "WD-CLI-0001",
  environment: "TEST"
}));

const gate = new Gate({
  gateId: "WD-GATE-DF-001",
  destinationId: "world/sky/darkfactory",
  allowedProfiles: ["CLIENT_OPERATOR"]
});

const fakeRuntime = {
  createOperation(source) {
    assert.strictEqual(source.operationType, "content.produce");
    assert.strictEqual(source.originId, "world/earth/juice-country/sucocast");
    assert.strictEqual(source.destinationId, "world/sky/darkfactory");
    assert.strictEqual(source.payload.labContext.clientId, "WD-CLI-0001");
    return { operationId: source.operationId, status: "CREATED", source };
  },
  runOperation(operation) {
    return { status: "COMPLETED", operationId: operation.operationId };
  }
};

const bridge = new Bridge({
  runtime: fakeRuntime,
  gate,
  permissionSet
});

const operation = createLabOperation();
const out = bridge.process(operation, { profile: "CLIENT_OPERATOR" });

assert.strictEqual(out.success, true);
assert.strictEqual(out.status, "DELEGATED");
assert.strictEqual(out.legacyOperation.status, "COMPLETED");

const denied = bridge.process(createLabOperation(), { profile: "VIEWER" });
assert.strictEqual(denied.success, false);
assert.strictEqual(denied.status, "REJECTED");
assert.strictEqual(denied.stage, "V1_ENTRY");

console.log("WordDark Core V1 composition bridge: OK");
