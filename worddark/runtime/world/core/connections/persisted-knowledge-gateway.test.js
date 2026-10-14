import assert from "node:assert/strict";
import { createPersistedKnowledgeGateway } from "./persisted-knowledge-gateway.js";

let audits = [];
let executions = 0;
const store = {
  async load({ providerId, accountId }) {
    if (providerId !== "RESEARCH_API" || !["ACCOUNT-1", "NO-GRANT"].includes(accountId)) return null;
    return { providerId, accountId, status: "PERSISTED", capabilities: accountId === "ACCOUNT-1" ? ["KNOWLEDGE_RESEARCH"] : [], title: "Research account" };
  },
  async loadTokens() { return { access_token: "ACCESS_SECRET", refresh_token: "REFRESH_SECRET" }; }
};
const adapter = { async execute(request, context) {
  executions++;
  assert.equal(request.action, "SEARCH_KNOWLEDGE");
  assert.equal(context.credential.access_token, "ACCESS_SECRET");
  assert.equal(context.account.title, "Research account");
  return { success: true, status: "KNOWLEDGE_SEARCH_COMPLETED", result: { results: [{ title: "Source", url: "https://example.org/a" }], debugToken: "DO_NOT_RETURN" } };
}};
const deps = {
  connectionStore: store,
  adapters: { RESEARCH_API: adapter },
  authenticateService: async context => context?.serviceToken === "trusted-test-token"
    ? { authenticated: true, actorId: "service-darknet", sessionId: "session-1" }
    : null,
  authorize: async ({ capability }) => ({ allowed: capability === "KNOWLEDGE_RESEARCH", approvalId: "approval-1" }),
  audit: async event => { audits.push(event); },
  enabled: true
};
const gateway = createPersistedKnowledgeGateway(deps);
assert.deepEqual(gateway.getStatus().adapters, ["RESEARCH_API"]);
const request = {
  requestId: "REQ-1", operationId: "OP-1", providerId: "RESEARCH_API", accountId: "ACCOUNT-1",
  capability: "KNOWLEDGE_RESEARCH", action: "SEARCH_KNOWLEDGE", payload: { query: "source", limit: 5 }
};
assert.equal((await gateway.execute(request)).status, "PERSISTED_KNOWLEDGE_TRUSTED_IDENTITY_REQUIRED");
assert.equal(executions, 0);
const result = await gateway.execute(request, { requestContext: { serviceToken: "trusted-test-token" } });
assert.equal(result.success, true);
assert.equal(result.result.status, "KNOWLEDGE_SEARCH_COMPLETED");
assert.equal(JSON.stringify(result).includes("DO_NOT_RETURN"), false);
assert.equal(JSON.stringify(result).includes("ACCESS_SECRET"), false);
assert.equal(JSON.stringify(result).includes("REFRESH_SECRET"), false);
assert.equal(audits.length, 2);
assert.equal((await gateway.execute({ ...request, capability: "CONTENT_PUBLICATION" }, { requestContext: { serviceToken: "trusted-test-token" } })).status, "PERSISTED_KNOWLEDGE_REQUEST_INVALID");
assert.equal((await gateway.execute({ ...request, accountId: "MISSING" }, { requestContext: { serviceToken: "trusted-test-token" } })).status, "PERSISTED_CONNECTION_NOT_AVAILABLE");
assert.equal((await gateway.execute({ ...request, accountId: "NO-GRANT" }, { requestContext: { serviceToken: "trusted-test-token" } })).status, "PERSISTED_CONNECTION_CAPABILITY_NOT_GRANTED");
const disabled = createPersistedKnowledgeGateway({ ...deps, enabled: false });
assert.equal((await disabled.execute(request, { requestContext: { serviceToken: "trusted-test-token" } })).status, "PERSISTED_KNOWLEDGE_GATEWAY_DISABLED");
console.log("persisted-knowledge-gateway.test: OK");
