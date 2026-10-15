import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const catalog = JSON.parse(await readFile(new URL("./APP-CATALOG.json", import.meta.url), "utf8"));
assert.equal(catalog.schemaVersion, 1);
assert.equal(catalog.policy.existingInterfaces, "preserve");
assert.equal(catalog.policy.noFunctionalScreensWithoutUserDesign, true);
assert.equal(catalog.policy.productionRequiresExplicitApproval, true);
assert.ok(Array.isArray(catalog.apps) && catalog.apps.length >= 15);

const ids = new Set();
for (const app of catalog.apps) {
  assert.ok(typeof app.id === "string" && app.id.length > 0, "app id required");
  assert.ok(!ids.has(app.id), "duplicate app id: " + app.id);
  ids.add(app.id);
  assert.ok(typeof app.name === "string" && app.name.length > 0, "app name required: " + app.id);
  assert.ok(typeof app.owner === "string" && app.owner.length > 0, "app owner required: " + app.id);
  assert.ok(typeof app.responsibility === "string" && app.responsibility.length > 0, "responsibility required: " + app.id);
  assert.ok(typeof app.status === "string" && app.status.length > 0, "status required: " + app.id);
  assert.ok(typeof app.interface === "string" && app.interface.length > 0, "interface policy required: " + app.id);
}
assert.equal(catalog.apps.find(app => app.id === "ruan")?.interface, "preserve");
assert.equal(catalog.apps.find(app => app.id === "darknet")?.owner, "independent-system");
assert.equal(catalog.apps.find(app => app.id === "darkfactory")?.owner, "Céu");
assert.equal(catalog.apps.find(app => app.id === "darkbank")?.owner, "WordDark");
for (const id of ["sky", "terra", "darkfactory", "social-operations", "marketing", "project-management", "business-operations", "connections", "library", "security-governance", "operations-center", "world-school", "darkbank", "commercial-intake", "first-sale-operations"]) {
  const app = catalog.apps.find(item => item.id === id);
  assert.ok(app, "registered shell app required: " + id);
  assert.equal(app.interface, "shell-and-requirements-dialog-only", "new app must not gain a functional UI without design: " + id);
  assert.equal(app.route, "worddark/apps/app-shell.html?app=" + id, "minimal shell route required: " + id);
}
console.log("APP-CATALOG: invariants passed (" + catalog.apps.length + " apps/categories)");
