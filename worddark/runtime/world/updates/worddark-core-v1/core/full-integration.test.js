const assert = require("assert");

const Id = require("./id");
const { Client, Channel, Project, User, Service } = require("./entities");
const CoreConnector = require("../../../../world/core/connector");
const { WordDarkLabPermission, WordDarkLabPermissionSet } = require("./permissions");
const Context = require("./context");
const OperationPackage = require("./operation-package");
const Operation = require("./operation");
const Gate = require("./gate");
const { WordDarkLabRoute, WordDarkLabRouter } = require("./route");
const Runtime = require("./runtime");
const Result = require("./result");
const Recovery = require("./error-recovery");
const Inbox = require("./inbox");
const Versioning = require("./versioning");
const Bridge = require("./composition-bridge");

const GlobalOperation = require("../../../../world/contracts/operation");
const GlobalIdentity = require("../../../../world/contracts/identity");
const GlobalAccessRule = require("../../../../world/contracts/access");
const SecurityManager = require("../../../../world/security/security-manager");
const EnvironmentGuard = require("../../../../world/core/environment-guard");
const Road = require("../../../../world/core/road");
const GlobalRoute = require("../../../../world/contracts/route");
const { WordDarkOperationRegistry: Registry } = require("../../../../world/core/operation-registry");
const Engine = require("../../../../world/core/operation-engine");
const WorldRuntime = require("../../../../world/core/world-runtime");
const EmergencyStopManager = require("../../../../world/core/emergency-stop-manager");

function test(name, fn) {
  try {
    fn();
    console.log("PASS", name);
  } catch (error) {
    console.error("FAIL", name, error.stack || error.message);
    process.exitCode = 1;
  }
}

test("V1 identity, entities and IDs", () => {
  assert.strictEqual(Id.create("CLIENT", 1), "WD-CLI-0001");
  assert(Id.validate("WD-CON-0001"));
  const client = new Client({ id: "WD-CLI-0001", name: "País Suco" });
  const channel = new Channel({ id: "WD-CH-0001", name: "SucoGeek", clientId: client.id });
  const project = new Project({ id: "WD-PRJ-0001", name: "Projeto de teste", clientId: client.id, resourceId: channel.id });
  const user = new User({ id: "WD-USR-0001", name: "Operador", profile: "CLIENT_OPERATOR", clientId: client.id });
  const service = new Service({ id: "WD-SVC-0001", name: "Teste", executor: () => ({ success: true }) });
  [client, channel, project, user, service].forEach(entity => assert(entity.validate().valid));
});

test("V1 context, package and gate", () => {
  const context = new Context({
    clientId: "WD-CLI-0001",
    projectId: "WD-PRJ-0001",
    resourceId: "WD-CH-0001",
    originId: "world/earth/juice-country/sucocast",
    destinationId: "world/sky/darkfactory",
    serviceId: "content.produce",
    environment: "TEST"
  });
  assert(context.validate().valid);
  const pkg = new OperationPackage({
    operationId: "WD-OP-0001",
    requesterId: "WD-USR-0001",
    context,
    permission: { capability: "content.produce", action: "request", scope: context.destinationId },
    request: { task: "Teste V1" }
  });
  assert(pkg.validate().valid);
  const gate = new Gate({
    gateId: "WD-GATE-DF-001",
    destinationId: context.destinationId,
    allowedProfiles: ["CLIENT_OPERATOR"]
  });
  assert(gate.receive({ profile: "CLIENT_OPERATOR", context: context.toJSON() }).success);
  assert.strictEqual(gate.receive({ profile: "VIEWER", context: context.toJSON() }).reason, "PROFILE_NOT_ALLOWED");
});

test("V1 operational runtime", () => {
  const rt = new Runtime();
  const client = rt.register(new Client({ id: "WD-CLI-0001", name: "País Suco" }));
  const channel = rt.register(new Channel({ id: "WD-CH-0001", name: "SucoGeek", clientId: client.id }));
  const user = rt.register(new User({ id: "WD-USR-0001", name: "Operador", profile: "CLIENT_OPERATOR", clientId: client.id }));
  const service = rt.register(new Service({
    id: "WD-SVC-0001",
    name: "Teste V1",
    executor: operation => ({ success: true, status: "DONE", output: "V1_OK", operationId: operation.operationId })
  }));
  rt.permissions.grant(new WordDarkLabPermission({
    profile: user.profile,
    capability: "content.produce",
    action: "request",
    resourceId: channel.id,
    clientId: client.id,
    environment: "TEST"
  }));
  rt.router.add(new WordDarkLabRoute({
    routeId: "WD-ROUTE-0001",
    origin: "sucogeek",
    destination: "darkfactory",
    serviceId: service.id
  }));
  rt.addGate(new Gate({
    gateId: "WD-GATE-DF-001",
    destinationId: "darkfactory",
    allowedProfiles: [user.profile]
  }));
  const op = new Operation({
    operationId: "WD-OP-0002",
    requesterId: user.id,
    clientId: client.id,
    resourceId: channel.id,
    origin: "sucogeek",
    destination: "darkfactory",
    serviceId: service.id,
    environment: "TEST"
  });
  const out = rt.process(op, "WD-GATE-DF-001");
  assert(out.success);
  assert.strictEqual(out.operation.status, "COMPLETED");
  assert.strictEqual(out.result.status, "READY");
  assert(rt.versioning.latest(op.operationId));
});

test("V1 result, recovery, inbox, versioning and connector", () => {
  const result = new Result({ resultId: "WD-RES-0001", operationId: "WD-OP-0003", status: "READY" });
  assert(result.validate().valid);
  const op = new Operation({
    operationId: "WD-OP-0003", requesterId: "WD-USR-0001", clientId: "WD-CLI-0001",
    resourceId: "WD-CH-0001", origin: "a", destination: "b", serviceId: "WD-SVC-0001"
  });
  const recovery = new Recovery();
  const error = recovery.capture(op, new Error("TEST_ERROR"), "TEST");
  assert.strictEqual(error.status, "OPEN");
  recovery.analyze(error);
  recovery.resolve(error, "FIXED");
  assert.strictEqual(error.status, "RESOLVED");
  const inbox = new Inbox();
  const pending = inbox.pend({ type: "EXTERNAL_REQUEST", operationId: op.operationId });
  assert.strictEqual(inbox.getOpen().length, 1);
  inbox.resolve(pending.pendingId);
  assert.strictEqual(inbox.getOpen().length, 0);
  const versions = new Versioning();
  versions.create(op.operationId, op.toJSON());
  assert(versions.latest(op.operationId));
  const connector = new CoreConnector({ id: "WD-CON-0001", platform: "TEST" });
  assert.strictEqual(connector.publish({ x: 1 }).reason, "CONNECTOR_DISCONNECTED");
  connector.connect();
  assert.strictEqual(connector.publish({ x: 1 }).reason, "CONNECTOR_NOT_AUTHORIZED");
  assert(connector.publish({ x: 1 }, { authorized: true, operationId: op.operationId }).success);
});

test("V1 -> consolidated Core composition", () => {
  const security = new SecurityManager();
  const identity = new GlobalIdentity({ identityId: "WD-USR-0001", type: "PERSON" });
  security.registerIdentity(identity);
  security.grant(new GlobalAccessRule({
    identityId: identity.identityId,
    capability: "content.produce",
    action: "request",
    environment: "TEST",
    scope: "world/sky/darkfactory"
  }));

  const road = new Road();
  road.registerRoute(new GlobalRoute({
    routeId: "WD-GLOBAL-ROUTE-0001",
    origin: "world/earth/juice-country/sucocast",
    destination: "world/sky/darkfactory",
    service: "content.produce"
  }));

  const registry = new Registry();
  const engine = new Engine({
    security,
    environmentGuard: new EnvironmentGuard(),
    registry,
    route: operation => {
      const route = road.findRoute(operation.originId, operation.destinationId, operation.operationType);
      return route ? { success: true, routeId: route.routeId } : { success: false, reason: "ROUTE_NOT_FOUND" };
    },
    execute: operation => ({
      success: true,
      validated: true,
      result: { status: "V1_ADAPTER_EXECUTED", operationId: operation.operationId }
    })
  });

  const runtime = new WorldRuntime({
    accountManager: { accounts: new Map(), get: () => null },
    security,
    environmentGuard: new EnvironmentGuard(),
    road,
    registry,
    operationEngine: engine,
    entityRegistry: { entities: new Map(), register(entity){ this.entities.set(entity.id, entity); return entity; } },
    permissionSet: { authorize(){ return true; } },
    serviceRegistry: { services: new Map(), register(service){ this.services.set(service.id || service.serviceId, service); return service; } },
    emergencyStop: new EmergencyStopManager()
  });
  assert(runtime.isReady());

  const permissionSet = new WordDarkLabPermissionSet();
  permissionSet.grant(new WordDarkLabPermission({
    profile: "CLIENT_OPERATOR",
    capability: "content.produce",
    action: "request",
    resourceId: "WD-CH-0001",
    clientId: "WD-CLI-0001",
    environment: "TEST"
  }));

  const context = new Context({
    clientId: "WD-CLI-0001",
    projectId: "WD-PRJ-0001",
    resourceId: "WD-CH-0001",
    originId: "world/earth/juice-country/sucocast",
    destinationId: "world/sky/darkfactory",
    serviceId: "content.produce",
    environment: "TEST"
  });
  const gate = new Gate({
    gateId: "WD-GATE-DF-001",
    destinationId: context.destinationId,
    allowedProfiles: ["CLIENT_OPERATOR"]
  });
  const labOperation = new OperationPackage({
    operationId: "WD-OP-BRIDGE-0001",
    requesterId: "WD-USR-0001",
    context,
    permission: { capability: "content.produce", action: "request", scope: context.destinationId },
    request: { task: "Composição V1 -> Core" }
  });

  const bridge = new Bridge({ runtime, gate, permissionSet });
  const out = bridge.process(labOperation, { profile: "CLIENT_OPERATOR" });
  assert(out.success, JSON.stringify(out));
  assert.strictEqual(out.status, "DELEGATED");
  assert.strictEqual(out.legacyOperation.status, "COMPLETED");

  const denied = bridge.process(new OperationPackage({
    operationId: "WD-OP-BRIDGE-0002",
    requesterId: "WD-USR-0001",
    context,
    permission: { capability: "content.produce", action: "request", scope: context.destinationId },
    request: { task: "Deve ser bloqueado" }
  }), { profile: "VIEWER" });
  assert.strictEqual(denied.success, false);
  assert.strictEqual(denied.stage, "V1_ENTRY");
});

console.log("WordDark Core V1 full integration suite: COMPLETE");
