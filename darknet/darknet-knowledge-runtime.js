/**
 * Production assembly for Darknet → WordDark knowledge.
 * No secrets are read from browser payloads; all trusted services are injected by backend code.
 */
import { createDarknetKnowledgeIntegration } from "./darknet-knowledge-integration.js";
import { createDurableKnowledgeRepository } from "../worddark/runtime/world/library/durable-knowledge-repository.js";
import { createDurableKnowledgeIntakeRegistry } from "../worddark/runtime/world/library/durable-knowledge-intake-registry.js";
import { createCentralKnowledgeArchiver } from "../worddark/runtime/world/library/central-knowledge-archiver.js";
import {
  createFirestoreKnowledgeBackend,
  createFirestoreCentralKnowledgeStore
} from "../worddark/runtime/world/library/firestore-knowledge-adapters.js";

const fn = value => typeof value === "function";
const hasTransactionalFirestore = firestore =>
  !!firestore && typeof firestore.collection === "function" && typeof firestore.runTransaction === "function";

function resolveOptions(options = {}) {
  const resolved = { ...options };
  if (hasTransactionalFirestore(options.firestore)) {
    if (!resolved.repository) {
      resolved.repository = createFirestoreKnowledgeBackend({
        firestore: options.firestore,
        collectionName: options.knowledgeIntakeCollection || "worddarkKnowledgeIntake"
      });
    }
    if (!resolved.centralKnowledgeStore && fn(options.createKnowledgeRecord)) {
      resolved.centralKnowledgeStore = createFirestoreCentralKnowledgeStore({
        firestore: options.firestore,
        collectionName: options.centralKnowledgeCollection || "worddarkCentralLibrary",
        libraryId: options.centralLibraryId || "WORDDARK-CENTRAL-LIBRARY"
      });
    }
  }
  return resolved;
}

export function inspectDarknetKnowledgeReadiness(input = {}) {
  const options = resolveOptions(input);
  const configuredProviders = Array.isArray(options.knowledgeConnections) ? options.knowledgeConnections : [];
  const gatewayStatus = options.externalConnectionGateway?.getStatus?.();
  const registered = new Set((gatewayStatus?.adapters || []).map(id => String(id).toUpperCase()));
  const missing = [];
  if (!options.externalConnectionGateway || typeof options.externalConnectionGateway.execute !== "function") missing.push("CENTRAL_CONNECTION_GATEWAY");
  if (!configuredProviders.length) missing.push("KNOWLEDGE_PROVIDER_CONFIG");
  for (const item of configuredProviders) {
    if (!item?.providerId || !item?.accountId || !item?.capability) missing.push("PROVIDER_ACCOUNT_CAPABILITY");
    if (item?.providerId && !registered.has(String(item.providerId).toUpperCase())) missing.push("REGISTERED_ADAPTER:" + String(item.providerId).toUpperCase());
    if (String(item?.capability || "").toUpperCase() !== "KNOWLEDGE_RESEARCH") missing.push("KNOWLEDGE_RESEARCH_CAPABILITY:" + String(item?.providerId || "UNKNOWN").toUpperCase());
  }
  if (options.repository?.durable !== true || options.repository?.atomic !== true) missing.push("DURABLE_ATOMIC_REPOSITORY");
  if (!fn(options.authenticateService)) missing.push("TRUSTED_SERVICE_AUTHENTICATOR");
  if (!fn(options.authorizeDarknet)) missing.push("DARKNET_AUTHORIZATION");
  if (!fn(options.authorizeWordDark)) missing.push("WORDDARK_AUTHORIZATION");
  if (!fn(options.authorizeReview)) missing.push("KNOWLEDGE_REVIEW_AUTHORIZATION");\n  if (!fn(options.authorizeKnowledgeRead)) missing.push("KNOWLEDGE_READ_AUTHORIZATION");\n  if (!fn(options.auditKnowledgeRead)) missing.push("KNOWLEDGE_READ_AUDIT");
  if (!fn(options.auditDarknet)) missing.push("DARKNET_AUDIT");
  if (!fn(options.auditWordDark)) missing.push("WORDDARK_AUDIT");
  if (!fn(options.auditReview)) missing.push("REVIEW_AUDIT");
  if (!fn(options.createKnowledgeRecord) || !options.centralKnowledgeStore || typeof options.centralKnowledgeStore.archive !== "function") missing.push("CANONICAL_KNOWLEDGE_ARCHIVE");
  else {
    if (options.centralKnowledgeStore.durable !== true) missing.push("DURABLE_CANONICAL_KNOWLEDGE_ARCHIVE");
    if (options.centralKnowledgeStore.idempotent !== true) missing.push("IDEMPOTENT_CANONICAL_ARCHIVE");
  }
  return Object.freeze({
    ready: missing.length === 0,
    enabled: options.enabled === true,
    activationAllowed: options.enabled === true && missing.length === 0,
    missing: [...new Set(missing)],
    registeredProviderIds: [...registered],
    configuredProviderIds: configuredProviders.map(x => String(x?.providerId || "").toUpperCase()).filter(Boolean),
    persistence: options.repository?.type || (options.repository?.durable === true ? "injected-durable-backend" : "unavailable"),
    networkAccess: "delegated-to-central-connection-gateway"
  });
}

export function createDarknetKnowledgeRuntime(input = {}) {
  const options = resolveOptions(input);
  const readiness = inspectDarknetKnowledgeReadiness(options);
  if (options.enabled === true && !readiness.ready) {
    throw new Error("DARKNET_KNOWLEDGE_RUNTIME_NOT_READY:" + readiness.missing.join(","));
  }
  const repository = options.repository?.durable === true && options.repository?.atomic === true
    ? createDurableKnowledgeRepository({ backend: options.repository })
    : null;
  const archiver = fn(options.createKnowledgeRecord) && options.centralKnowledgeStore && typeof options.centralKnowledgeStore.archive === "function"
    ? createCentralKnowledgeArchiver({ createKnowledgeRecord: options.createKnowledgeRecord, centralKnowledgeStore: options.centralKnowledgeStore })
    : null;
  const registry = createDurableKnowledgeIntakeRegistry({
    repository,
    authorizeReview: options.authorizeReview,
    audit: options.auditReview,
    archiveValidated: archiver?.archiveValidated,
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
  async function authenticateRequest(requestContext) {\n    let trustedContext;\n    try { trustedContext = await options.authenticateService(requestContext); }\n    catch { return { error: "TRUSTED_SERVICE_AUTHENTICATION_FAILED" }; }\n    if (trustedContext?.authenticated !== true || !trustedContext.actorId || !trustedContext.sessionId) {\n      return { error: "TRUSTED_SERVICE_IDENTITY_REQUIRED" };\n    }\n    return { trustedContext };\n  }\n  async function learn({ providerId, query, limit = 10, requestContext = null } = {}) {
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
