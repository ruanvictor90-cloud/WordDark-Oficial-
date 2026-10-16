import { AuditLog } from "./audit.js";
import { Gate } from "./gate.js";
import { builtInConnectors, connectorHandlers } from "./connectors.js";
import { Bridge } from "./bridge.js";
import { PluginManager } from "./plugin-manager.js";
import { Knowledge } from "./knowledge.js";
export function createShadowebRuntime(storage = localStorage) {
  const audit = new AuditLog(storage), gate = new Gate(storage);
  const connectors = builtInConnectors.map(item => ({...item}));
  const plugins = new PluginManager({ storage, audit });
  const knowledge = new Knowledge({ storage, audit });
  const handlers = { ...connectorHandlers, "local-knowledge": async input => connectorHandlers["local-knowledge"]({ ...input, notes: knowledge.list() }) };
  const bridge = new Bridge({ connectors, handlers, gate, audit });
  return { audit, gate, connectors, bridge, plugins, knowledge };
}
