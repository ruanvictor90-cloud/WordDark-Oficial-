const assert = require("assert");
const WordDarkOperation = require("./operation");
const WordDarkWorldRuntime = require("./world-runtime");

const operationEngine = {
  create: source => new WordDarkOperation({
    ...source,
    operationId: source.operationId || "OP-RUNTIME-001",
    clientId: source.clientId || "CLIENT-RUNTIME",
    resourceId: source.resourceId || "RESOURCE-RUNTIME",
    serviceId: source.serviceId || source.operationType || "runtime.test"
  }),
  run: operation => operation
};

function deps(overrides = {}) {
  return {
    accountManager: { accounts: new Map([["A1", {}]]), get: () => ({}) },
    security: {
      identities: new Map([["I1", {}]]),
      registerIdentity: () => {},
      authorize: () => ({ allowed: true })
    },
    environmentGuard: { canRun: () => ({ allowed: true }) },
    road: {
      routes: new Map([["R1", {}]]),
      registerRoute: () => ({ success: true }),
      findRoute: () => ({ routeId: "R1" }),
      send: () => ({ success: true })
    },
    registry: {
      list: () => [],
      events: [],
      record: () => {},
      recordEvent: () => {}
    },
    operationEngine,
    entityRegistry: { entities: new Map(), register: entity => entity },
    permissionSet: { authorize: () => true, grant: rule => rule },
    serviceRegistry: { services: new Map(), register: service => service },
    emergencyStop: { trigger: () => true, assertRunning: () => true },
    ...overrides
  };
}

(function testRuntimeOperation() {
  const runtime = new WordDarkWorldRuntime(deps());
  const result = runtime.runOperation({
    requesterId: "I1",
    originId: "world/earth/test",
    destinationId: "world/sky/darkfactory",
    operationType: "content.produce",
    environment: "TEST",
    clientId: "CLIENT-RUNTIME",
    resourceId: "RESOURCE-RUNTIME"
  });

  assert.strictEqual(result.operationId, "OP-RUNTIME-001");
  assert.strictEqual(runtime.getStatus().operations, 0);
})();

(function testDegradedHealth() {
  const runtime = new WordDarkWorldRuntime(deps({ environmentGuard: null }));
  const health = runtime.getHealth();

  assert.strictEqual(health.status, "DEGRADED");
  assert.strictEqual(health.ready, false);
  assert(health.missing.includes("environmentGuard"));
  assert.strictEqual(runtime.isReady(), false);
})();

(function testHealthyComposition() {
  const runtime = WordDarkWorldRuntime.compose(deps());
  assert.strictEqual(runtime.isReady(), true);
  assert.strictEqual(runtime.getHealth().status, "HEALTHY");
  assert.strictEqual(runtime.version, "1.0-V1-INTEGRATED");
})();

(function testIncompleteComposition() {
  assert.throws(
    () => WordDarkWorldRuntime.compose(deps({ operationEngine: null })),
    /WordDark Core não está pronto/
  );
})();

console.log("world-runtime.test: OK");
