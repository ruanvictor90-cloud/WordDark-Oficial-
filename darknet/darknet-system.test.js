import assert from "node:assert/strict";
import { createDarknetSystem } from "./darknet-system.js";

const system = createDarknetSystem({
  connectors: [
    { id: "local-directory", name: "Local Directory", kind: "adapter" },
    { id: "external-web", name: "External Web", kind: "browser" }
  ],
  now: () => "2026-10-13T21:00:00Z"
});
const status = system.getStatus();
assert.equal(status.mode, "isolated");
assert.equal(status.overall, "operational-isolated");
assert.equal(status.transportEnabled, false);
assert.equal(status.externalNetworkEnabled, false);
assert.equal(status.worldRuntimeEnabled, false);
assert.equal(status.pluginExecutionEnabled, false);
assert.equal(status.knowledge.enabled, false);
assert.equal(status.knowledge.providerCount, 0);
assert.equal(system.knowledge.getStatus().networkAccess, false);
assert.equal(status.modules.length, 4);
assert.equal(system.connections.listConnectors().length, 2);

const prepared = system.apiGateway.prepareRequest({
  source: "darknet-ui",
  destination: "local-directory",
  connector: "local-directory",
  payload: { query: "internal catalog" },
  explicitlyApproved: true
});
assert.equal(prepared.accepted, true);
assert.equal(prepared.transportStarted, false);
assert.equal(prepared.connection.allowed, false);

const review = system.security.evaluate({ action: "network.connect", explicitlyApproved: true });
assert.equal(review.allowed, false);
assert.equal(review.transportStarted, false);
assert.equal(system.getStatus().transportEnabled, false);
console.log("Darknet system composition tests passed.");
