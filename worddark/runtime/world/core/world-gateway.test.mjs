import assert from "node:assert/strict";
import test from "node:test";
import { createAuthorizedWorldGateway } from "./world-gateway.mjs";

const identities = {
  admin: { principalId: "ADM-1", role: "world-admin", zone: "ADM", authenticated: true, active: true },
  dev: { principalId: "DEV-1", role: "developer", zone: "DEV", authenticated: true, active: true },
  public: { principalId: "PUB-1", role: "public", zone: "PUBLIC", authenticated: true, active: true }
};

function gateway(overrides = {}) {
  const calls = [];
  const handlers = Object.fromEntries(
    ["operation.submit", "world.configure", "dev.test", "dev.write", "public.read", "service.use", "security.audit"]
      .map(command => [command, payload => { calls.push({ command, payload }); return { handled: true }; }])
  );
  return {
    calls,
    instance: createAuthorizedWorldGateway({
      resolvePrincipal: identity => identities[identity] || null,
      handlers: { ...handlers, ...overrides }
    })
  };
}

test("ADM can submit operations but cannot grant access to sovereign authority", async () => {
  const g = gateway();
  assert.equal((await g.instance.invoke({ identity: "admin", command: "operation.submit" })).status, "ACCEPTED");
  assert.equal((await g.instance.invoke({ identity: "admin", command: "authority.grant" })).reason, "COMMAND_NOT_RECOGNIZED");
  assert.equal(g.calls.length, 1);
});

test("DEV can test but cannot submit or configure world operations", async () => {
  const g = gateway();
  assert.equal((await g.instance.invoke({ identity: "dev", command: "dev.test" })).status, "ACCEPTED");
  assert.equal((await g.instance.invoke({ identity: "dev", command: "operation.submit" })).reason, "DEV_CANNOT_ADMINISTER_WORLD");
  assert.equal((await g.instance.invoke({ identity: "dev", command: "world.configure" })).reason, "DEV_CANNOT_ADMINISTER_WORLD");
  assert.equal(g.calls.length, 1);
});

test("PUBLIC can use a published service but cannot inspect internal blueprint", async () => {
  const g = gateway();
  assert.equal((await g.instance.invoke({ identity: "public", command: "service.use" })).status, "ACCEPTED");
  assert.equal((await g.instance.invoke({ identity: "public", command: "operation.submit" })).reason, "PUBLIC_INTERFACE_ONLY");
  assert.equal(g.calls.length, 1);
});

test("unknown identity, unknown command and missing handler fail closed", async () => {
  const g = gateway();
  assert.equal((await g.instance.invoke({ identity: "missing", command: "public.read" })).reason, "IDENTITY_NOT_RESOLVED");
  assert.equal((await g.instance.invoke({ identity: "admin", command: "root.override" })).reason, "COMMAND_NOT_RECOGNIZED");
  const noHandler = createAuthorizedWorldGateway({ resolvePrincipal: () => identities.admin });
  assert.equal((await noHandler.invoke({ identity: "admin", command: "operation.submit" })).status, "UNAVAILABLE");
});

test("handler errors do not escape the gateway", async () => {
  const g = gateway({ "service.use": async () => { throw new Error("internal detail"); } });
  const result = await g.instance.invoke({ identity: "public", command: "service.use" });
  assert.equal(result.status, "FAILED");
  assert.equal(result.reason, "HANDLER_FAILED");
});

test("gateway awaits asynchronous handlers", async () => {
  const g = gateway({ "service.use": async () => ({ delivered: true }) });
  assert.deepEqual((await g.instance.invoke({ identity: "public", command: "service.use" })).result, { delivered: true });
});
