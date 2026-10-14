/**
 * Server-only gateway for persisted external connections.
 * Uses the encrypted backend connection store; never reads browser localStorage.
 * This gateway intentionally supports read-only knowledge research only.
 */
const clean = value => String(value ?? "").trim();
const ACTION_CAPABILITIES = Object.freeze({
  SEARCH_KNOWLEDGE: "KNOWLEDGE_RESEARCH",
  FETCH_KNOWLEDGE: "KNOWLEDGE_RESEARCH"
});
const SECRET_KEYS = /token|secret|credential|authorization|ciphertext|encrypted/i;

function sanitize(value, depth = 0) {
  if (depth > 8) return null;
  if (Array.isArray(value)) return value.slice(0, 100).map(item => sanitize(item, depth + 1));
  if (!value || typeof value !== "object") {
    if (typeof value === "string") return value.slice(0, 20000);
    return value;
  }
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (SECRET_KEYS.test(key)) continue;
    output[key] = sanitize(item, depth + 1);
  }
  return output;
}

export function createPersistedKnowledgeGateway({
  connectionStore = null,
  adapters = {},
  authenticateService = async () => null,
  authorize = async () => ({ allowed: false }),
  audit = async () => { throw new Error("AUDIT_UNAVAILABLE"); },
  enabled = false
} = {}) {
  if (!connectionStore || typeof connectionStore.load !== "function" || typeof connectionStore.loadTokens !== "function") {
    throw new Error("PERSISTED_CONNECTION_STORE_REQUIRED");
  }

  async function execute(source = {}, { requestContext = null } = {}) {
    if (enabled !== true) return { success: false, status: "PERSISTED_KNOWLEDGE_GATEWAY_DISABLED" };
    const providerId = clean(source.providerId).toUpperCase();
    const accountId = clean(source.accountId);
    const action = clean(source.action).toUpperCase();
    const capability = clean(source.capability).toUpperCase();
    const requiredCapability = ACTION_CAPABILITIES[action];
    if (!providerId || !accountId || !requiredCapability || capability !== requiredCapability ||
        !source.requestId || !source.operationId || !source.payload || typeof source.payload !== "object" ||
        Array.isArray(source.payload)) {
      return { success: false, status: "PERSISTED_KNOWLEDGE_REQUEST_INVALID" };
    }

    let identity;
    try { identity = await authenticateService(requestContext); }
    catch { return { success: false, status: "PERSISTED_KNOWLEDGE_IDENTITY_UNAVAILABLE" }; }
    if (identity?.authenticated !== true || !clean(identity.actorId) || !clean(identity.sessionId)) {
      return { success: false, status: "PERSISTED_KNOWLEDGE_TRUSTED_IDENTITY_REQUIRED" };
    }

    let permission;
    try {
      permission = await authorize({
        actorId: identity.actorId, sessionId: identity.sessionId,
        providerId, accountId, capability, action, operationId: source.operationId
      });
    } catch { return { success: false, status: "PERSISTED_KNOWLEDGE_AUTHORIZATION_UNAVAILABLE" }; }
    if (permission?.allowed !== true) return { success: false, status: "PERSISTED_KNOWLEDGE_ACCESS_DENIED" };

    let account;
    try { account = await connectionStore.load({ providerId, accountId }); }
    catch { return { success: false, status: "PERSISTED_CONNECTION_READ_FAILED" }; }
    if (!account || account.status !== "PERSISTED" ||
        String(account.providerId || "").toUpperCase() !== providerId ||
        String(account.accountId || "") !== accountId) {
      return { success: false, status: "PERSISTED_CONNECTION_NOT_AVAILABLE" };
    }
    if (!Array.isArray(account.capabilities) || !account.capabilities.includes(requiredCapability)) {
      return { success: false, status: "PERSISTED_CONNECTION_CAPABILITY_NOT_GRANTED" };
    }

    const adapter = adapters instanceof Map ? adapters.get(providerId) : adapters[providerId];
    if (!adapter || typeof adapter.execute !== "function") {
      return { success: false, status: "PERSISTED_PROVIDER_ADAPTER_UNAVAILABLE" };
    }
    try {
      await audit({
        event: "EXTERNAL_KNOWLEDGE_REQUEST_AUTHORIZED",
        actorId: identity.actorId, sessionId: identity.sessionId,
        providerId, accountId, capability, action,
        operationId: source.operationId, approvalId: permission.approvalId || null
      });
    } catch { return { success: false, status: "PERSISTED_KNOWLEDGE_AUDIT_UNAVAILABLE" }; }

    let credential;
    try { credential = await connectionStore.loadTokens({ providerId, accountId }); }
    catch { return { success: false, status: "PERSISTED_CONNECTION_CREDENTIAL_UNAVAILABLE" }; }
    if (!credential || typeof credential !== "object") {
      return { success: false, status: "PERSISTED_CONNECTION_CREDENTIAL_UNAVAILABLE" };
    }

    let result;
    try {
      result = await adapter.execute({
        ...source, providerId, accountId, capability, action,
        payload: sanitize(source.payload)
      }, { account: sanitize(account), credential });
    } catch {
      try { await audit({ event: "EXTERNAL_KNOWLEDGE_REQUEST_FAILED", actorId: identity.actorId, providerId, accountId, action, operationId: source.operationId }); } catch {}
      return { success: false, status: "PERSISTED_PROVIDER_EXECUTION_FAILED" };
    }

    try {
      await audit({
        event: "EXTERNAL_KNOWLEDGE_REQUEST_FINISHED",
        actorId: identity.actorId, providerId, accountId, action,
        operationId: source.operationId, resultStatus: clean(result?.status || "UNKNOWN")
      });
    } catch {
      return { success: false, status: "PERSISTED_KNOWLEDGE_FINAL_AUDIT_UNAVAILABLE" };
    }
    return {
      success: result?.success !== false,
      status: result?.status || "EXTERNAL_KNOWLEDGE_EXECUTED",
      operationId: source.operationId,
      providerId, accountId,
      result: sanitize(result)
    };
  }

  return Object.freeze({
    execute,
    getStatus: () => ({
      enabled: enabled === true,
      transport: "server-only-persisted-connection-store",
      actions: Object.keys(ACTION_CAPABILITIES),
      credentialsExposed: false,
      requiresTrustedIdentity: true,
      requiresAuthorization: true,
      requiresAudit: true
    })
  });
}
