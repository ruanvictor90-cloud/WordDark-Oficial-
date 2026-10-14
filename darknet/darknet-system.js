/**
 * Darknet System Composition v0.1.
 * Wires isolated modules into one facade. Construction has no external side effects.
 */
import { createConnectionEngine } from "./darknet-connection-engine.js";
import { createApiGateway } from "./darknet-api-gateway.js";
import { createPluginManager } from "./darknet-plugin-manager.js";
import { createSecurityPolicy } from "./darknet-security-policy.js";
import { createDarknetMonitor } from "./darknet-monitor.js";
import { createWorldBridge } from "./darknet-world-bridge.js";
import { createDarknetKnowledgePipeline } from "./darknet-knowledge-pipeline.js";

export function createDarknetSystem(options = {}) {
  const connections = createConnectionEngine({
    policy: options.connectionPolicy,
    initialConnectors: Array.isArray(options.connectors) ? options.connectors : [],
    now: options.now
  });
  const plugins = createPluginManager({ now: options.now });
  const security = createSecurityPolicy({
    rules: options.securityRules,
    now: options.now
  });
  const apiGateway = createApiGateway({ connectionEngine: connections });
  const worldBridge = createWorldBridge({ worldPort: options.worldPort || null, enabled: options.worldBridgeEnabled === true, authorizeRequest: options.authorizeWorldRequest, audit: options.auditWorldRequest, });
  const monitor = createDarknetMonitor({ connections, plugins, security, gateway: apiGateway });
  const knowledge = createDarknetKnowledgePipeline({
    providers: Array.isArray(options.knowledgeProviders) ? options.knowledgeProviders : [],
    knowledgePort: options.knowledgePort || null,
    authorize: options.authorizeKnowledgeRequest,
    audit: options.auditKnowledgeRequest,
    enabled: options.knowledgeEnabled === true,
    now: options.now
  });

  return Object.freeze({
    connections,
    plugins,
    security,
    apiGateway,
    monitor,
    knowledge,
    getStatus() {
      const snapshot = monitor.snapshot();
      return {
        version: "0.1.0",
        mode: "isolated",
        overall: snapshot.overall,
        transportEnabled: false,
        externalNetworkEnabled: false,
        worldRuntimeEnabled: false,
        pluginExecutionEnabled: false,
        worldBridge: worldBridge.getStatus(),
        knowledge: knowledge.getStatus(),
        modules: snapshot.modules
      };
    }
  });
}
