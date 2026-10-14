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
  if (!fn(options.authorizeReview)) missing.push("KNOWLEDGE_REVIEW_AUTHORIZATION");
  if (!fn(options.authorizeKnowledgeRead)) missing.push("KNOWLEDGE_READ_AUTHORIZATION");
  if (!fn(options.auditKnowledgeRead)) missing.push("KNOWLEDGE_READ_AUDIT");
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

  async function authenticateRequest(requestContext) {
    let trustedContext;
    try { trustedContext = await options.authenticateService(requestContext); }
    catch { return { error: "TRUSTED_SERVICE_AUTHENTICATION_FAILED" }; }
    if (trustedContext?.authenticated !== true || !trustedContext.actorId || !trustedContext.sessionId) {
      return { error: "TRUSTED_SERVICE_IDENTITY_REQUIRED" };
    }
    return { trustedContext };
  }

  async function learn({ providerId, query, limit = 10, requestContext = null } = {}) {
    if (options.enabled !== true) return { success: false, status: "DARKNET_KNOWLEDGE_RUNTIME_DISABLED" };
    const auth = await authenticateRequest(requestContext);
    if (auth.error) return { success: false, status: auth.error };
    return integration.learn({ providerId, query, limit, trustedContext: auth.trustedContext });
  }

  async function review({ recordId, decision, reason = "", requestContext = null } = {}) {
    if (options.enabled !== true) return { success: false, status: "KNOWLEDGE_REGISTRY_DISABLED" };
    const auth = await authenticateRequest(requestContext);
    if (auth.error) return { success: false, status: auth.error };
    return registry.review(recordId, { decision, reason, trustedContext: auth.trustedContext });
  }

  async function recoverStaleReviews({ staleAfterMs = 300000, requestContext = null } = {}) {
    if (options.enabled !== true) return { success: false, status: "KNOWLEDGE_REGISTRY_DISABLED", recovered: 0 };
    const auth = await authenticateRequest(requestContext);
    if (auth.error) return { success: false, status: auth.error, recovered: 0 };
    return registry.recoverStaleReviews({ staleAfterMs, trustedContext: auth.trustedContext });
  }

  async function readKnowledge(action, requestContext, callback) {
    if (options.enabled !== true) return { success: false, status: "KNOWLEDGE_REGISTRY_DISABLED", records: [] };
    const auth = await authenticateRequest(requestContext);
    if (auth.error) return { success: false, status: auth.error, records: [] };
    let permission;
    try {
      permission = await options.authorizeKnowledgeRead({
        actorId: auth.trustedContext.actorId,
        sessionId: auth.trustedContext.sessionId,
        action
      });
    } catch {
      return { success: false, status: "KNOWLEDGE_READ_AUTHORIZATION_UNAVAILABLE", records: [] };
    }
    if (permission?.allowed !== true) return { success: false, status: "KNOWLEDGE_READ_DENIED", records: [] };
    try {
      await options.auditKnowledgeRead({
        event: "WORDDARK_KNOWLEDGE_READ",
        actorId: auth.trustedContext.actorId,
        action,
        approvalId: permission.approvalId || null
      });
    } catch {
      return { success: false, status: "KNOWLEDGE_READ_AUDIT_UNAVAILABLE", records: [] };
    }
    try {
      return { success: true, status: "KNOWLEDGE_READ_OK", records: await callback() };
    } catch {
      return { success: false, status: "KNOWLEDGE_READ_FAILED", records: [] };
    }
  }

  async function listPending({ limit = 100, requestContext = null } = {}) {
    return readKnowledge("KNOWLEDGE_LIST_PENDING", requestContext, () => registry.listPending(limit));
  }

  async function searchValidated({ query = "", limit = 10, requestContext = null } = {}) {
    return readKnowledge("KNOWLEDGE_SEARCH_VALIDATED", requestContext, () => registry.searchValidated(query, limit));
  }

  return Object.freeze({
    learn,
    review,
    recoverStaleReviews,
    listPending,
    searchValidated,
    getStatus: async () => ({
      readiness: inspectDarknetKnowledgeReadiness(options),
      integration: integration.getStatus(),
      registry: await registry.getStatus(),
      activation: options.enabled === true ? "ENABLED_BY_TRUSTED_BACKEND_CONFIGURATION" : "DISABLED"
    })
  });
}
