/**
 * Trusted backend composition for Ruan Hub → WordDark Core.
 * Transport-neutral: no HTTP route is registered and activation is opt-in.
 */
import { createRuanHubControlAdapter } from "./ruan-hub-control-adapter.js";

const fn = value => typeof value === "function";

export function inspectRuanHubControlReadiness(options = {}) {
  const missing = [];
  if (!fn(options.authenticateOperator)) missing.push("TRUSTED_OPERATOR_AUTHENTICATOR");
  if (!options.operationCenter || !fn(options.operationCenter.submit) || !fn(options.operationCenter.getStatus)) missing.push("WORDDARK_OPERATION_CENTER");
  if (!options.capabilityCatalog || !fn(options.capabilityCatalog.listPublic)) missing.push("PUBLIC_CAPABILITY_CATALOG");
  if (!fn(options.listOperations)) missing.push("OPERATION_QUERY");
  if (!fn(options.authorizeRequest)) missing.push("HUB_OPERATION_AUTHORIZATION");
  if (!fn(options.audit)) missing.push("PERSISTENT_AUDIT");
  if (options.audit?.durable !== true) missing.push("DURABLE_AUDIT_STORE");
  if (!options.idempotencyStore || fn(options.idempotencyStore.executeOnce) === false || !fn(options.idempotencyStore.executeOnce)) missing.push("ATOMIC_IDEMPOTENCY_STORE");
  if (options.idempotencyStore?.durable !== true || options.idempotencyStore?.atomic !== true) missing.push("DURABLE_ATOMIC_IDEMPOTENCY");
  return Object.freeze({
    ready: missing.length === 0,
    enabled: options.enabled === true,
    activationAllowed: options.enabled === true && missing.length === 0,
    missing: [...new Set(missing)],
    transport: "injected-backend-only",
    httpRoute: false,
    environment: "TEST"
  });
}

export function createRuanHubControlRuntime(options = {}) {
  const readiness = inspectRuanHubControlReadiness(options);
  if (options.enabled === true && !readiness.ready) {
    throw new Error("RUAN_HUB_CONTROL_RUNTIME_NOT_READY:" + readiness.missing.join(","));
  }
  const adapter = createRuanHubControlAdapter({
    operationCenter: options.operationCenter,
    capabilityCatalog: options.capabilityCatalog,
    listOperations: options.listOperations,
    authorizeRequest: options.authorizeRequest,
    audit: options.audit,
    idempotencyStore: options.idempotencyStore,
    enabled: options.enabled === true && readiness.ready
  });

  async function handle(request = {}, requestContext = null) {
    if (options.enabled !== true) return { success: false, status: "HUB_CONTROL_RUNTIME_DISABLED", worldAccepted: false };
    let trustedContext;
    try { trustedContext = await options.authenticateOperator(requestContext); }
    catch { return { success: false, status: "HUB_CONTROL_AUTHENTICATION_FAILED", worldAccepted: false }; }
    if (trustedContext?.authenticated !== true || !String(trustedContext.actorId || "").trim() || !String(trustedContext.sessionId || "").trim()) {
      return { success: false, status: "HUB_CONTROL_TRUSTED_IDENTITY_REQUIRED", worldAccepted: false };
    }
    return adapter.handle(request, trustedContext);
  }

  return Object.freeze({
    handle,
    getStatus: () => ({
      ...inspectRuanHubControlReadiness(options),
      adapter: adapter.getStatus(),
      activation: options.enabled === true ? "ENABLED_BY_TRUSTED_BACKEND_CONFIGURATION" : "DISABLED"
    })
  });
}
