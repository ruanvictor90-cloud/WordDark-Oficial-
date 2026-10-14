import assert from "node:assert/strict";
import { RUAN_PLATFORM, getPlatformApp, listPlatformApps, canRenderGlobalDrawer, authorizePlatformScope } from "./ruan-platform-registry.js";

assert.equal(RUAN_PLATFORM.id, "ruan");
assert.equal(RUAN_PLATFORM.globalNavigationOwner, true);
assert.deepEqual(listPlatformApps().map(app => app.id), ["home", "personal", "shadow"]);
assert.equal(getPlatformApp("shadow").path, "/shadow/");
assert.equal(canRenderGlobalDrawer("ruan"), true);
assert.equal(canRenderGlobalDrawer("personal"), false);
assert.equal(canRenderGlobalDrawer("shadow"), false);
assert.deepEqual(authorizePlatformScope({ appId: "personal", dataScope: "personal.finance" }), { allowed: true, reason: "declared_scope" });
assert.deepEqual(authorizePlatformScope({ appId: "shadow", dataScope: "personal.finance" }), { allowed: false, reason: "scope_not_granted" });
assert.deepEqual(authorizePlatformScope({ appId: "shadow", dataScope: "personal.finance", grants: ["shadow:personal.finance"] }), { allowed: true, reason: "explicit_grant" });
assert.deepEqual(authorizePlatformScope({ appId: "unknown", dataScope: "anything" }), { allowed: false, reason: "unknown_app_or_scope" });
console.log("Ruan platform registry: OK");
