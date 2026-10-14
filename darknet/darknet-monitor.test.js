import assert from "node:assert/strict";
import { createConnectionEngine } from "./darknet-connection-engine.js";
import { createPluginManager } from "./darknet-plugin-manager.js";
import { createSecurityPolicy } from "./darknet-security-policy.js";
import { createApiGateway } from "./darknet-api-gateway.js";
import { createDarknetMonitor } from "./darknet-monitor.js";

const connections = createConnectionEngine();
const plugins = createPluginManager();
const security = createSecurityPolicy();
const gateway = createApiGateway({ connectionEngine: connections });
const monitor = createDarknetMonitor({ connections, plugins, security, gateway });
const snapshot = monitor.snapshot();
assert.equal(snapshot.overall, "operational-isolated");
assert.equal(snapshot.mode, "read-only");
assert.equal(snapshot.transportEnabled, false);
assert.equal(snapshot.networkAccess, false);
assert.equal(snapshot.worldRuntimeAccess, false);
assert.deepEqual(snapshot.modules.map(x => x.module), ["connections", "plugins", "security", "apiGateway"]);
assert.ok(snapshot.modules.every(x => x.available));
assert.deepEqual(monitor.getStatus(), { version: "0.1.0", mode: "read-only", pollingEnabled: false, actionsEnabled: false });

const partial = createDarknetMonitor({ connections, plugins }).snapshot();
assert.equal(partial.overall, "partial");
assert.equal(partial.modules[2].available, false);
console.log("Darknet monitor tests passed.");
