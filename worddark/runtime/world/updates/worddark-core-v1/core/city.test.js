const assert = require("assert");
const City = require("./city");
const { Client, Channel, User, Service } = require("./entities");
const { WordDarkLabPermission } = require("./permissions");
const { WordDarkLabRoute } = require("./route");
const Gate = require("./gate");
const Operation = require("./operation");

function baseCity() {
  const city = new City({
    cityId: "WD-CITY-0001",
    name: "SucoGeek",
    identity: "world/earth/juice-country/sucogeek"
  });

  const client = city.register(
    new Client({ id: "WD-CLI-0001", name: "País Suco" })
  );
  city.register(
    new Channel({ id: "WD-CH-0001", name: "SucoGeek", clientId: client.id })
  );
  const user = city.register(
    new User({
      id: "WD-USR-0001",
      name: "Operador",
      profile: "CITY_OPERATOR",
      clientId: client.id
    })
  );

  city.addPermission(
    new WordDarkLabPermission({
      profile: "CITY_OPERATOR",
      capability: "operation.execute",
      action: "request",
      resourceId: "WD-CH-0001",
      clientId: client.id,
      environment: "TEST"
    })
  );

  city.addGate(
    new Gate({
      gateId: "WD-GATE-0001",
      destinationId: "world/earth/juice-country/sucogeek",
      allowedProfiles: ["CITY_OPERATOR"]
    })
  );

  return { city, client, user };
}

function operation(user, overrides = {}) {
  return new Operation({
    operationId: overrides.operationId || "WD-OP-0001",
    requesterId: user.id,
    clientId: "WD-CLI-0001",
    resourceId: "WD-CH-0001",
    origin: "world/earth/juice-country/sucogeek",
    destination: overrides.destination || "world/sky/darkfactory",
    serviceId: overrides.serviceId || "WD-SVC-0001",
    environment: "TEST",
    request: overrides.request || { task: "Produzir teste" }
  });
}

function ok(name, fn) {
  try {
    fn();
    console.log("PASS", name);
  } catch (e) {
    console.error("FAIL", name, e.message);
    process.exitCode = 1;
  }
}

ok("cidade é autônoma e executa serviço local", () => {
  const { city, user } = baseCity();

  city.addService(new Service({
    id: "WD-SVC-0001",
    name: "Serviço Local",
    executor: op => ({
      success: true,
      status: "DONE",
      operationId: op.operationId,
      output: "RESULTADO_LOCAL"
    })
  }));

  city.addRoute(new WordDarkLabRoute({
    routeId: "WD-ROUTE-LOCAL-001",
    origin: "world/earth/juice-country/sucogeek",
    destination: "world/sky/darkfactory",
    serviceId: "WD-SVC-0001"
  }));

  const out = city.process(operation(user));
  assert(out.success);
  assert.strictEqual(out.status, "COMPLETED_LOCALLY");
  assert.strictEqual(out.operation.status, "COMPLETED");
  assert.strictEqual(out.result.status, "READY");
  assert.strictEqual(city.getStatus().pendingRequests, 0);
});

ok("cidade gera pedido externo quando não possui o serviço", () => {
  const { city, user } = baseCity();

  const out = city.process(operation(user));
  assert(out.success);
  assert.strictEqual(out.status, "REQUESTED_EXTERNALLY");
  assert.strictEqual(out.request.status, "PENDING");
  assert.strictEqual(out.request.destinationId, "world/sky/darkfactory");
  assert.strictEqual(out.request.reason, "SERVICE_NOT_AVAILABLE_LOCALLY");
  assert.strictEqual(city.getStatus().pendingRequests, 1);
  assert(city.inbox.getOpen().length === 1);
});

ok("cidade rejeita perfil que não passa pelo portão", () => {
  const { city, user } = baseCity();
  const out = city.process(operation(user), { profile: "VIEWER" });
  assert(!out.success);
  assert.strictEqual(out.status, "REJECTED");
  assert.strictEqual(out.stage, "CITY_ENTRY");
});

ok("cidade registra falha de execução e cria recuperação", () => {
  const { city, user } = baseCity();

  city.addService(new Service({
    id: "WD-SVC-0001",
    name: "Serviço quebrado",
    executor: () => ({
      success: false,
      status: "FAILED",
      reason: "INTENTIONAL_TEST_FAILURE"
    })
  }));

  city.addRoute(new WordDarkLabRoute({
    routeId: "WD-ROUTE-LOCAL-001",
    origin: "world/earth/juice-country/sucogeek",
    destination: "world/sky/darkfactory",
    serviceId: "WD-SVC-0001"
  }));

  const out = city.process(operation(user, { operationId: "WD-OP-0002" }));
  assert(!out.success);
  assert.strictEqual(out.status, "FAILED");
  assert.strictEqual(city.recovery.list().length, 1);
  assert.strictEqual(city.inbox.getOpen().length, 1);
});

ok("pedido externo pode ser resolvido sem apagar histórico", () => {
  const { city, user } = baseCity();
  const out = city.process(operation(user, { operationId: "WD-OP-0003" }));
  const request = city.resolveRequest(out.request.requestId);

  assert.strictEqual(request.status, "RESOLVED");
  assert(city.events.some(e => e.event === "EXTERNAL_REQUEST_CREATED"));
  assert(city.events.some(e => e.event === "EXTERNAL_REQUEST_RESOLVED"));
});

console.log("WordDark Lab City suite: COMPLETE");
