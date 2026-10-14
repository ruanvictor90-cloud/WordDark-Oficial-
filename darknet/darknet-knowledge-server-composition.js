/**
 * Server-side composition for the Darknet → WordDark knowledge path.
 *
 * Joins the persisted OAuth connection store, the governed Central de Conexões
 * gateway, provider adapters, and the durable knowledge runtime. No HTTP route
 * is registered and the gateway is never returned to callers.
 */
import { createPersistedKnowledgeGateway } from "../worddark/runtime/world/core/connections/persisted-knowledge-gateway.js";
import { createKnowledgeSearchAdapter } from "../worddark/runtime/world/core/connections/knowledge-search-adapter.js";
import { createDarknetKnowledgeRuntime } from "./darknet-knowledge-runtime.js";

const fn = value => typeof value === "function";
const clean = value => String(value ?? "").trim();

export function createDarknetKnowledgeServerComposition(input = {}) {
  const {
    connectionStore,
    providerHandlers = {},
    knowledgeConnections = [],
    authenticateIncomingService,
    authorizeConnection,
    auditConnection,
    enabled = false
  } = input;

  if (!connectionStore || !fn(connectionStore.load) || !fn(connectionStore.loadTokens)) {
    throw new Error("SERVER_PERSISTED_CONNECTION_STORE_REQUIRED");
  }

  // Only this closure can mint contexts accepted by the internal gateway.
  // A caller-supplied {authenticated:true} object is not sufficient.
  const trustedContexts = new WeakSet();
  const authenticateService = fn(authenticateIncomingService)
    ? async requestContext => {
        let identity;
        try { identity = await authenticateIncomingService(requestContext); }
        catch { return null; }
        if (identity?.authenticated !== true || !clean(identity.actorId) || !clean(identity.sessionId) ||
            (typeof identity !== "object" && typeof identity !== "function")) return null;
        trustedContexts.add(identity);
        return identity;
      }
    : null;

  const adapters = {};
  for (const [providerId, handlers] of Object.entries(providerHandlers || {})) {
    const id = clean(providerId).toUpperCase();
    if (!id || !handlers || !fn(handlers.search)) {
      throw new Error("SERVER_KNOWLEDGE_PROVIDER_HANDLER_INVALID:" + (id || "UNKNOWN"));
    }
    adapters[id] = createKnowledgeSearchAdapter({
      providerId: id,
      search: handlers.search,
      fetchSource: fn(handlers.fetchSource) ? handlers.fetchSource : null,
      now: input.now
    });
  }

  const gateway = createPersistedKnowledgeGateway({
    connectionStore,
    adapters,
    authenticateService: context => trustedContexts.has(context) ? context : null,
    authorize: fn(authorizeConnection) ? authorizeConnection : undefined,
    audit: fn(auditConnection) ? auditConnection : undefined,
    enabled: enabled === true
  });

  const runtime = createDarknetKnowledgeRuntime({
    ...input,
    enabled: enabled === true,
    authenticateService,
    externalConnectionGateway: gateway,
    knowledgeConnections
  });

  return Object.freeze({
    runtime,
    getStatus: () => runtime.getStatus()
  });
}
