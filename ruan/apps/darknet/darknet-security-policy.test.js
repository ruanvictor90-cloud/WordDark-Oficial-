import assert from "node:assert/strict";
import { createSecurityPolicy } from "./darknet-security-policy.js";

const security = createSecurityPolicy({ now: () => "2026-10-13T20:40:00Z" });
assert.equal(security.getStatus().mode, "default-deny");
assert.equal(security.evaluate({ action: "catalog.read" }).allowed, true);
assert.equal(security.evaluate({ action: "metadata.read" }).allowed, true);
assert.equal(security.evaluate({ action: "request.prepare", explicitlyApproved: false }).allowed, false);
assert.equal(security.evaluate({ action: "request.prepare", explicitlyApproved: true }).allowed, true);
for (const action of ["network.connect", "world.invoke", "message.dispatch", "plugin.execute", "filesystem.write", "process.execute"]) {
  const result = security.evaluate({ action, explicitlyApproved: true, principal: "test" });
  assert.equal(result.allowed, false, action);
  assert.equal(result.transportStarted, false);
  assert.equal(result.executionStarted, false);
}
assert.equal(security.evaluate({ action: "unknown.action", explicitlyApproved: true }).allowed, false);
assert.equal(security.getAuditLog().length, 11);
assert.equal(security.getStatus().sensitiveActionsEnabled, false);
console.log("Darknet security policy tests passed.");
