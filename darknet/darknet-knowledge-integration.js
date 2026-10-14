/**
 * Darknet ↔ WordDark knowledge intake composition.
 * Joins the acquisition pipeline to the Core intake adapter in-process only.
 * Disabled by default; credentials and durable storage are injected by trusted backend services.
 */
import { createDarknetKnowledgePipeline } from "./darknet-knowledge-pipeline.js";
import { createCentralConnectionKnowledgeProvider } from "./darknet-central-connection-provider.js";
import { createDarknetKnowledgeAdapter } from "../worddark/runtime/world/core/connections/darknet-knowledge-adapter.js";

export function createDarknetKnowledgeIntegration({
  providers = [],
  knowledgeConnections = [],
  externalConnectionGateway = null,
  knowledgeRegistry = null,
  authorizeDarknet = async () => ({ allowed: false }),
  authorizeWordDark = async () => ({ allowed: false }),
  auditDarknet = async () => { throw new Error("AUDIT_UNAVAILABLE"); },
  auditWordDark = async () => { throw new Error("AUDIT_UNAVAILABLE"); },
  enabled = false,
  now = () => new Date().toISOString()
} = {}) {
  const worldAdapter = createDarknetKnowledgeAdapter({
    knowledgeRegistry,
    authorizeRequest: authorizeWordDark,
    audit: auditWordDark,
    enabled: enabled === true
  });
  const gatewayProviders = Array.isArray(knowledgeConnections)
    ? knowledgeConnections.map(connection => createCentralConnectionKnowledgeProvider({ gateway: externalConnectionGateway, ...connection }))
    : [];
  const pipeline = createDarknetKnowledgePipeline({
    providers: [...(Array.isArray(providers) ? providers : []), ...gatewayProviders],
    knowledgePort: { receive: (record, trustedContext) => worldAdapter.receive(record, trustedContext) },
    authorize: authorizeDarknet,
    audit: auditDarknet,
    enabled: enabled === true,
    now
  });
  return Object.freeze({
    learn: pipeline.learn,
    listProviders: pipeline.listProviders,
    getStatus: () => ({
      enabled: enabled === true,
      transport: "in-process-only",
      networkAccess: false,
      pipeline: pipeline.getStatus(),
      wordDarkIntake: worldAdapter.getStatus()
    })
  });
}
