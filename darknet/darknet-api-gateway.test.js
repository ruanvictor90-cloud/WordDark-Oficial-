import assert from "node:assert/strict";
import { createConnectionEngine } from "./darknet-connection-engine.js";
import { createApiGateway } from "./darknet-api-gateway.js";

assert.throws(() => createApiGateway(), /motor de conexões válido/);
const engine = createConnectionEngine({
  initialConnectors: [{ id: "local-api", name: "API local", kind: "api" }]
});
const gateway = createApiGateway({ connectionEngine: engine });
assert.deepEqual(gateway.getStatus(), { version: "0.1.0", mode: "prepare-only", transportEnabled: false });

const result = gateway.prepareRequest({
  source: "darknet-ui",
  destination: "local-api",
  connector: "local-api",
  kind: "api.request",
  payload: { operation: "list", scope: "local" },
  explicitlyApproved: true
});
assert.equal(result.accepted, true);
assert.equal(result.status, "prepared-only");
assert.equal(result.envelope.transport, "disabled");
assert.equal(result.envelope.status, "prepared");
assert.equal(result.connection.allowed, false);
assert.equal(result.connection.transportStarted, false);
assert.equal(result.transportStarted, false);
assert.equal(gateway.inspectEnvelope(result.envelope).valid, true);

assert.throws(() => gateway.prepareRequest({
  source: "darknet-ui",
  destination: "local-api",
  payload: []
}), /payload deve ser um objeto/);
assert.equal(engine.getAuditLog().length, 1);
console.log("Darknet API gateway tests passed.");
