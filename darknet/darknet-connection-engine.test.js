import assert from "node:assert/strict";
import { createConnectionEngine } from "./darknet-connection-engine.js";

let tick = 0;
const engine = createConnectionEngine({
  now: () => "2026-10-13T20:00:0" + tick++ + "Z",
  initialConnectors: [
    { id: "local-catalog", name: "Catálogo local", kind: "adapter" },
    { id: "external-web", name: "Web externa", kind: "browser" }
  ]
});

assert.equal(engine.getStatus().transportEnabled, false);
assert.equal(engine.getStatus().networkAccess, false);
assert.equal(engine.listConnectors().length, 2);
assert.equal(engine.getConnector("local-catalog").status, "disabled");
assert.equal(engine.getConnector("local-catalog").networkAccess, false);
assert.equal(engine.getConnector("missing"), null);

assert.throws(() => engine.registerConnector({ id: "x", name: "Too short" }), /ID de conector inválido/);
assert.throws(() => engine.registerConnector({ id: "bad-kind", name: "Bad kind", kind: "shell" }), /Tipo de conector/);
assert.throws(() => engine.registerConnector({ id: "local-catalog", name: "Duplicate" }), /duplicado/);
assert.equal(engine.registerConnector({ id: "api-directory", name: "Diretório de APIs", kind: "api" }).status, "disabled");

const unknown = engine.requestConnection({ connector: "unknown", explicitlyApproved: true });
assert.equal(unknown.allowed, false);
assert.match(unknown.reason, /não cadastrado/);
assert.equal(unknown.transportStarted, false);

const noApproval = engine.requestConnection({ connector: "local-catalog" });
assert.equal(noApproval.allowed, false);
assert.match(noApproval.reason, /não está habilitado|autorização explícita/);

const external = engine.requestConnection({ connector: "external-web", explicitlyApproved: true });
assert.equal(external.allowed, false);
assert.match(external.reason, /não está habilitado|reservado/);
assert.equal(external.transportStarted, false);

const audit = engine.getAuditLog();
assert.equal(audit.length, 4);
assert.deepEqual(audit.map(x => x.action), ["connector.registered", "connection.requested", "connection.requested", "connection.requested"]);
assert.equal(audit[0].outcome, "metadata-only");
assert.ok(audit.slice(1).every(x => x.outcome === "blocked-no-transport" && x.allowed === false));
assert.equal(engine.getStatus().auditCount, 4);
assert.equal(engine.getStatus().connectorCount, 3);

// Returned records are copies; callers cannot mutate the engine's internal audit log.
audit[0].outcome = "forged";
assert.equal(engine.getAuditLog()[0].outcome, "metadata-only");

console.log("Darknet connection engine tests passed.");
