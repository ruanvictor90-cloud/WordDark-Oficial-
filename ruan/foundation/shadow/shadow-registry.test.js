import assert from "node:assert/strict";
import { SHADOW_MODULES, getShadowModule, listShadowModules, validateExtensionManifest, authorizeShadowScope } from "./shadow-registry.js";

assert.deepEqual(SHADOW_MODULES.map(module => module.id), ["shadow-shell", "darknet-browser-core", "darkeye-overlay", "connectors", "plugins", "permissions", "activity"]);
assert.equal(getShadowModule("darknet-browser-core").status, "planned");
assert.equal(getShadowModule("darkeye-overlay").requestedScopes.includes("translation.request"), true);
assert.equal(listShadowModules().find(module => module.id === "plugins").owns[0], "shadow.extensions");
assert.deepEqual(validateExtensionManifest({ id: "demo", name: "Demo", version: "1.0.0", kind: "plugin", publisher: "local", requestedScopes: [] }), { valid: true, errors: [] });
assert.equal(validateExtensionManifest({ id: "bad", kind: "unknown" }).valid, false);
assert.deepEqual(authorizeShadowScope({ moduleId: "darknet-browser-core", scope: "browser.navigation" }), { allowed: false, reason: "scope_not_granted" });
assert.deepEqual(authorizeShadowScope({ moduleId: "darknet-browser-core", scope: "browser.navigation", grants: ["darknet-browser-core:browser.navigation"] }), { allowed: true, reason: "explicit_grant" });
assert.deepEqual(authorizeShadowScope({ moduleId: "darkeye-overlay", scope: "translation.request" }), { allowed: false, reason: "scope_not_granted" });
assert.deepEqual(authorizeShadowScope({ moduleId: "darkeye-overlay", scope: "personal.finance" }), { allowed: false, reason: "scope_not_granted" });
console.log("Shadow registry: OK");
