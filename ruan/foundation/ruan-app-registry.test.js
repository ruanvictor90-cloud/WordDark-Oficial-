import assert from "node:assert/strict";
import { RUAN_APPS, getApp, listApps, authorize } from "./ruan-app-registry.js";

assert.ok(RUAN_APPS.length >= 10);
assert.equal(getApp("finance").owns.includes("transactions"), true);
assert.equal(getApp("finance").owns.includes("tasks"), false);
assert.equal(listApps({ status: "active" }).some(app => app.id === "shopping"), true);
assert.equal(listApps({ status: "planned" }).some(app => app.id === "documents"), true);

assert.deepEqual(authorize({ actor: "owner", appId: "tasks", action: "create", dataScope: "tasks" }), {
  allowed: true, reason: "module_owns_scope"
});
assert.equal(authorize({ actor: "owner", appId: "finance", action: "create", dataScope: "tasks" }).allowed, false);
assert.equal(authorize({ actor: "other", appId: "tasks", action: "view" }).allowed, false);
assert.equal(authorize({ actor: "owner", appId: "not-real", action: "view" }).allowed, false);
assert.equal(authorize({ actor: "owner", appId: "overview", action: "view", dataScope: "finance.summary" }).allowed, true);
assert.equal(authorize({ actor: "owner", appId: "overview", action: "view", dataScope: "transactions" }).allowed, false);
assert.equal(authorize({
  actor: "owner", appId: "overview", action: "view", dataScope: "transactions",
  grants: ["overview:view:transactions"]
}).allowed, true);

console.log("Ruan app registry tests passed.");
