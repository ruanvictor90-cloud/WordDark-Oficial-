import assert from "node:assert/strict";
import { createRuanHubControlRuntime, inspectRuanHubControlReadiness } from "./ruan-hub-control-runtime.js";

let submissions = 0;
let auditEvents = [];
const operationCenter = {
  getStatus: () => ({ environment: "TEST", status: "READY" }),
  submit: () => { submissions++; return { success: true, status: "OPERATION_ACCEPTED", operationId: "OP-TEST-1" }; }
};
const capabilityCatalog = { listPublic: () => [{ capability: "CONTENT_CREATE" }] };
const idempotencyStore = {
  durable: true, atomic: true, values: new Map(),
  async executeOnce(key, work) {
    if (this.values.has(key)) return this.values.get(key);
    const result = await work();
    this.values.set(key, result);
    return result;
  }
};
const audit = async event => { auditEvents.push(event); };
audit.durable = true;
const options = {
  enabled: true, operationCenter, capabilityCatalog, idempotencyStore, audit,
  authenticateOperator: async context => context?.sessionToken === "trusted-session"
    ? { authenticated: true, actorId: "operator-1", sessionId: "session-1" }
    : null,
  authorizeRequest: async () => ({ allowed: true, approved: true, approvalId: "APPROVAL-1" }),
  listOperations: async () => [{ operationId: "OP-OLD", status: "SUCCEEDED", action: "CONTENT_CREATE", secretToken: "NEVER_RETURN" }]
};
assert.equal(inspectRuanHubControlReadiness(options).ready, true);
const runtime = createRuanHubControlRuntime(options);
const request = { requestId: "HUB-REQ-1", source: "RUAN_HUB", destination: "WORDDARK", action: "SUBMIT_NEED", need: "Create a sample content package" };
assert.equal((await runtime.handle(request)).status, "HUB_CONTROL_TRUSTED_IDENTITY_REQUIRED");
assert.equal(submissions, 0);
const submitted = await runtime.handle(request, { sessionToken: "trusted-session" });
assert.equal(submitted.success, true);
assert.equal(submitted.worldAccepted, true);
assert.equal(submitted.environment, "TEST");
assert.equal(submissions, 1);
assert.equal((await runtime.handle({ ...request, requestId: "HUB-REQ-2" }, { sessionToken: "trusted-session" })).success, true);
assert.equal(submissions, 2);
const listed = await runtime.handle({ requestId: "HUB-LIST-1", source: "RUAN_HUB", destination: "WORDDARK", action: "LIST_OPERATIONS" }, { sessionToken: "trusted-session" });
assert.equal(listed.operations[0].operationId, "OP-OLD");
assert.equal(JSON.stringify(listed).includes("NEVER_RETURN"), false);
const deniedRuntime = createRuanHubControlRuntime({ ...options, authorizeRequest: async () => ({ allowed: false }) });
assert.equal((await deniedRuntime.handle({ ...request, requestId: "HUB-DENIED" }, { sessionToken: "trusted-session" })).status, "HUB_CONTROL_REQUEST_DENIED");
const disabled = createRuanHubControlRuntime({ ...options, enabled: false });
assert.equal((await disabled.handle(request, { sessionToken: "trusted-session" })).status, "HUB_CONTROL_RUNTIME_DISABLED");
assert.throws(() => createRuanHubControlRuntime({ enabled: true }), /RUAN_HUB_CONTROL_RUNTIME_NOT_READY/);
assert.ok(auditEvents.some(event => event.event === "RUAN_HUB_OPERATION_SUBMITTED"));
console.log("ruan-hub-control-runtime.test: OK");
