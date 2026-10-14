/**
 * Production assembly for Darknet → WordDark knowledge.
 * No secrets are read from browser payloads; caller must inject backend services.
 */
import { createDarknetKnowledgeIntegration } from "./darknet-knowledge-integration.js";
import { createDurableKnowledgeRepository } from "../worddark/runtime/world/library/durable-knowledge-repository.js";
import { createDurableKnowledgeIntakeRegistry } from "../worddark/runtime/world/library/durable-knowledge-intake-registry.js";
import { createCentralKnowledgeArchiver } from "../worddark/runtime/world/library/central-knowledge-archiver.js";

const fn = value => typeof value === "function";

export function inspectDarknetKnowledgeReadiness({
  enabled = false, externalConnectionGateway = null, knowledgeConnections = [],
  repository = null, authenticateService = null, authorizeDarknet = null,
  authorizeWordDark = null, authorizeReview = null, auditDarknet = null,
  auditWordDark = null, auditReview = null, createKnowledgeRecord = null,
  centralKnowledgeStore = null
} = {}) {
  const configuredProviders = Array.isArray(knowledgeConnections) ? knowledgeConnections : [];
  const gatewayStatus = externalConnectionGateway?.getStatus?.();
  const registered = new Set((gatewayStatus?.adapters || []).map(id => String(id).toUpperCase()));
  const missing = [];
  if (!externalConnectionGateway || typeof externalConnectionGateway.execute !== "function") missing.push("CENTRAL_CONNECTION_GATEWAY");
  if (!configuredProviders.length) missing.push("KNOWLEDGE_PROVIDER_CONFIG");
  for (const item of configuredProviders) {
    if (!item?.providerId || !item?.accountId || !item?.capability) missing.push("PROVIDER_ACCOUNT_CAPABILITY");
    if (item?.providerId && !registered.has(String(item.providerId).toUpperCase())) missing.push("REGISTERED_ADAPTER:" + String(item.providerId).toUpperCase());
  }
  if (repository?.durable !== true || repository?.atomic !== true) missing.push("DURABLE_ATOMIC_REPOSITORY");
  if (!fn(authenticateService)) missing.push("TRUSTED_SERVICE_AUTHENTICATOR");
  if (!fn(authorizeDarknet)) missing.push("DARKNET_AUTHORIZATION");
  if (!fn(authorizeWordDark)) missing.push("WORDDARK_AUTHORIZATION");
  if (!fn(authorizeReview)) missing.push("KNOWLEDGE_REVIEW_AUTHORIZATION");
  if (!fn(auditDarknet)) missing.push("DARKNET_AUDIT");
  if (!fn(auditWordDark)) missing.push("WORDDARK_AUDIT");
  if (!fn(auditReview)) missing.push("REVIEW_AUDIT");
  if (!fn(createKnowledgeRecord) || !centralKnowledgeStore || typeof centralKnowledgeStore.archive !== "function") missing.push("CANONICAL_KNOWLEDGE_ARCHIVE");
  return Object.freeze({ ready: missing.length === 0, enabled: enabled === true, activationAllowed: enabled === true && missing.length === 0, missing: [...new Set(missing)], registeredProviderIds: [...registered], configuredProviderIds: configuredProviders.map(x => String(x?.providerId || "").toUpperCase()).filter(Boolean), networkAccess: "delegated-to-central-connection-gateway" });
}

export function createDarknetKnowledgeRuntime(options = {}) {
  const readiness = inspectDarknetKnowledgeReadiness(options);
  if (options.enabled === true && !readiness.ready) {
    throw new Error("DARKNET_KNOWLEDGE_RUNTIME_NOT_READY:" + readiness.missing.join(","));
  }
  const repository = createDurableKnowledgeRepository({ backend: options.repository });
  const archiver = createCentralKnowledgeArchiver({ createKnowledgeRecord: options.createKnowledgeRecord, centralKnowledgeStore: options.centralKnowledgeStore });
  const registry = createDurableKnowledgeIntakeRegistry({
    repository,
    authorizeReview: options.authorizeReview,
    audit: options.auditReview,
    archiveValidated: archiver.archiveValidated,
    enabled: options.enabled === true,
    now: options.now
  });
  const integration = createDarknetKnowledgeIntegration({
    knowledgeConnections: options.knowledgeConnections,
    externalConnectionGateway: options.externalConnectionGateway,
    knowledgeRegistry: registry,
    authorizeDarknet: options.authorizeDarknet,
    authorizeWordDark: options.authorizeWordDark,
    auditDarknet: options.auditDarknet,
    auditWordDark: options.auditWordDark,
    enabled: options.enabled === true,
    now: options.now
  });
  async function learn({ providerId, query, limit = 10, requestContext = null } = {}) {
    if (options.enabled !== true) return { success: false, status: "DARKNET_KNOWLEDGE_RUNTIME_DISABLED" };
    let trustedContext;
    try { trustedContext = await options.authenticateService(requestContext); }
    catch { return { success: false, status: "TRUSTED_SERVICE_AUTHENTICATION_FAILED" }; }
    if (trustedContext?.authenticated !== true || !trustedContext.actorId || !trustedContext.sessionId) {
      return { success: false, status: "TRUSTED_SERVICE_IDENTITY_REQUIRED" };
    }
    return integration.learn({ providerId, query, limit, trustedContext });
  }
  return Object.freeze({
    learn,
    review: registry.review,
    listPending: registry.listPending,
    searchValidated: registry.searchValidated,
    getStatus: async () => ({
      readiness: inspectDarknetKnowledgeReadiness(options),
      integration: integration.getStatus(),
      registry: await registry.getStatus(),
      activation: options.enabled === true ? "ENABLED_BY_TRUSTED_BACKEND_CONFIGURATION" : "DISABLED"
    })
  });
}
