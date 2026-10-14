import assert from "node:assert/strict";
import { createPluginManager } from "./darknet-plugin-manager.js";

let n = 0;
const manager = createPluginManager({ now: () => "2026-10-13T20:30:0" + n++ + "Z" });
const registered = manager.register({
  id: "catalog-helper", name: "Catalog Helper", version: "1.0.0",
  capabilities: ["catalog.read", "metadata.read", "network"]
});
assert.equal(registered.status, "disabled");
assert.equal(registered.execution, "not-loaded");
assert.deepEqual(registered.permissions, { approved: false, grantedCapabilities: [] });
assert.throws(() => manager.register({ id: "catalog-helper", name: "Duplicate", version: "1" }), /duplicado/);
assert.throws(() => manager.register({ id: "x", name: "Bad", version: "1" }), /ID de plugin inválido/);

const undeclared = manager.reviewPermissions({ id: "catalog-helper", requestedCapabilities: ["filesystem-write"], explicitlyApproved: true });
assert.equal(undeclared.allowed, false);
assert.match(undeclared.reason, /não declarada/);
const forbidden = manager.reviewPermissions({ id: "catalog-helper", requestedCapabilities: ["network"], explicitlyApproved: true });
assert.equal(forbidden.allowed, false);
assert.match(forbidden.reason, /bloqueada/);
const reviewOnly = manager.reviewPermissions({ id: "catalog-helper", requestedCapabilities: ["catalog.read"], explicitlyApproved: true });
assert.equal(reviewOnly.allowed, false);
assert.equal(reviewOnly.approved, false);
assert.equal(reviewOnly.executionStarted, false);
assert.match(reviewOnly.reason, /continuam desativadas/);
assert.throws(() => manager.enable("catalog-helper"), /indisponível/);
assert.throws(() => manager.execute("catalog-helper"), /indisponível/);
assert.equal(manager.getStatus().enabledPlugins, 0);
assert.equal(manager.getStatus().executionEnabled, false);
assert.equal(manager.getAuditLog().length, 4);
console.log("Darknet plugin manager tests passed.");
