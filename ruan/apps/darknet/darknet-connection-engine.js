/**
 * Darknet connection engine v0.3.
 * Registers connector metadata and records decisions only.
 * No network, runtime bridge, message dispatch, or plugin execution is performed.
 */
import { DEFAULT_CONNECTION_POLICY, evaluateConnectionRequest } from "./darknet-contracts.js";

const clean = value => String(value ?? "").trim();
const validId = value => /^[a-z0-9][a-z0-9._-]{1,79}$/i.test(clean(value));
const RESERVED_DISABLED = new Set(["external-web", "world-runtime", "message-dispatch", "private-bridge"]);

export function createConnectionEngine({ policy = DEFAULT_CONNECTION_POLICY, initialConnectors = [], now = () => new Date().toISOString() } = {}) {
  const connectors = new Map();
  const audit = [];
  let sequence = 0;

  function record(event) {
    const entry = Object.freeze({
      auditId: "DNET-AUDIT-" + (++sequence).toString().padStart(6, "0"),
      timestamp: clean(now()) || new Date().toISOString(),
      ...event
    });
    audit.push(entry);
    return entry;
  }

  function normalize(descriptor) {
    if (!descriptor || typeof descriptor !== "object" || Array.isArray(descriptor)) {
      throw new Error("Descritor de conector inválido.");
    }
    const id = clean(descriptor.id);
    const name = clean(descriptor.name);
    const kind = clean(descriptor.kind || "adapter");
    if (!validId(id)) throw new Error("ID de conector inválido.");
    if (!name) throw new Error("Nome do conector é obrigatório.");
    if (!["adapter", "api", "browser", "world"].includes(kind)) {
      throw new Error("Tipo de conector não reconhecido.");
    }
    return Object.freeze({
      id, name, kind,
      version: clean(descriptor.version || "0.1.0"),
      description: clean(descriptor.description),
      status: "disabled",
      transport: "none",
      networkAccess: false,
      runtimeAccess: false
    });
  }

  for (const descriptor of initialConnectors) {
    const item = normalize(descriptor);
    if (connectors.has(item.id)) throw new Error("Conector duplicado: " + item.id);
    connectors.set(item.id, item);
  }

  return Object.freeze({
    registerConnector(descriptor) {
      const item = normalize(descriptor);
      if (connectors.has(item.id)) throw new Error("Conector duplicado: " + item.id);
      connectors.set(item.id, item);
      record({ action: "connector.registered", connector: item.id, outcome: "metadata-only" });
      return { ...item };
    },
    getConnector(id) {
      const item = connectors.get(clean(id));
      return item ? { ...item } : null;
    },
    listConnectors() {
      return [...connectors.values()].map(item => ({ ...item }));
    },
    requestConnection({ connector, explicitlyApproved = false, requestedAction = "connect" } = {}) {
      const id = clean(connector);
      const item = connectors.get(id);
      let decision;
      if (!item) {
        decision = { allowed: false, reason: "Conector não cadastrado." };
      } else if (item.status !== "enabled" || item.transport !== "none") {
        decision = { allowed: false, reason: "O conector não está habilitado; esta versão não executa conexões." };
      } else if (RESERVED_DISABLED.has(id)) {
        decision = { allowed: false, reason: "Conector reservado e desativado por segurança." };
      } else {
        decision = evaluateConnectionRequest({ connector: id, policy, explicitlyApproved });
      }
      const entry = record({
        action: "connection.requested",
        connector: id || null,
        requestedAction: clean(requestedAction) || "connect",
        explicitlyApproved: explicitlyApproved === true,
        allowed: false,
        outcome: "blocked-no-transport",
        reason: decision.reason
      });
      return { allowed: false, status: "blocked", reason: decision.reason, auditId: entry.auditId, transportStarted: false };
    },
    getAuditLog() {
      return audit.map(entry => ({ ...entry }));
    },
    getStatus() {
      return {
        version: "0.3.0",
        connectorCount: connectors.size,
        auditCount: audit.length,
        networkAccess: false,
        worldRuntimeAccess: false,
        messageDispatch: false,
        transportEnabled: false
      };
    }
  });
}
