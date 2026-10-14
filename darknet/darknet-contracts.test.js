import assert from "node:assert/strict";
import {
  DARKNET_CONTRACT_VERSION, DEFAULT_CONNECTION_POLICY,
  createConnectionEnvelope, validateConnectionEnvelope,
  createPluginRegistry, evaluateConnectionRequest
} from "./darknet-contracts.js";

assert.equal(DARKNET_CONTRACT_VERSION, "0.2.0");
const envelope = createConnectionEnvelope({
  id: "test-001", source: "ruan", destination: "worddark",
  kind: "request", payload: { action: "status" }
});
assert.equal(validateConnectionEnvelope(envelope).valid, true);
assert.equal(envelope.transport, "disabled");
assert.equal(envelope.dispatchedAt, null);
assert.equal(validateConnectionEnvelope({ ...envelope, transport: "http" }).valid, false);
assert.equal(validateConnectionEnvelope({ ...envelope, status: "sent" }).valid, false);
assert.throws(() => createConnectionEnvelope({ source: "ruan", destination: "world", payload: [] }));
assert.throws(() => createConnectionEnvelope({ source: "", destination: "world", payload: {} }));

const registry = createPluginRegistry();
const plugin = registry.register({
  id: "example.search", name: "Example Search", version: "0.1.0",
  capabilities: ["search", "search", "catalog"]
});
assert.equal(plugin.status, "disabled");
assert.equal(plugin.execution, "not-loaded");
assert.equal(plugin.networkAccess, false);
assert.deepEqual(plugin.capabilities, ["search", "catalog"]);
assert.equal(registry.get("example.search").id, "example.search");
assert.equal(registry.list().length, 1);
assert.throws(() => registry.register({ id: "example.search", name: "Duplicate", version: "1" }));
assert.throws(() => registry.register({ id: "bad id", name: "Bad", version: "1" }));
assert.throws(() => registry.enable("example.search"));
assert.throws(() => registry.execute("example.search"));

assert.equal(evaluateConnectionRequest({ connector: "external-web" }).allowed, false);
assert.equal(evaluateConnectionRequest({ connector: "external-web", explicitlyApproved: true }).allowed, false);
assert.equal(evaluateConnectionRequest({
  connector: "external-web", explicitlyApproved: true,
  policy: { ...DEFAULT_CONNECTION_POLICY, allowExternalNetwork: true }
}).allowed, true);
assert.equal(evaluateConnectionRequest({
  connector: "world-runtime", explicitlyApproved: true,
  policy: { ...DEFAULT_CONNECTION_POLICY, allowWorldRuntime: true }
}).allowed, true);
assert.equal(evaluateConnectionRequest({
  connector: "message-dispatch", explicitlyApproved: true,
  policy: { ...DEFAULT_CONNECTION_POLICY, allowMessageDispatch: true }
}).allowed, true);
console.log("Darknet contracts tests passed (no plugin execution or transport).");
