import assert from "node:assert/strict";
import { SHADOW_MODULES, getShadowModule, listShadowModules, validateExtensionManifest, authorizeShadowScope } from "./shadow-registry.js";

assert.deepEqual(SHADOW_MODULES.map(module => module.id), ["shadow-shell", "darkeye", "connectors", "plugins", "permissions", "activity"]);
assert.equal(getShadowModule("darkeye").status, "planned");
assert.equal(listShadowModules().find(module => module.id === "plugins").owns[0], "shadow.extensions");
assert.deepEqual(validateExtensionManifest({ id: "demo", name: "Demo", version: "1.0.0", kind: "plugin", publisher: "local", requestedScopes: [] }), { valid: true, errors: [] });
assert.equal(validateExtensionManifest({ id: "bad", kind: "unknown" }).valid, false);
assert.deepEqual(authorizeShadowScope({ moduleId: "darkeye", scope: "browser.navigation" }), { allowed: false, reason: "scope_not_granted" });
assert.deepEqual(authorizeShadowScope({ moduleId: "darkeye", scope: "browser.navigation", grants: ["darkeye:browser.navigation"] }), { allowed: true, reason: "explicit_grant" });
assert.deepEqual(authorizeShadowScope({ moduleId: "darkeye", scope: "personal.finance" }), { allowed: false, reason: "scope_not_granted" });
console.log("Shadow registry: OK");
