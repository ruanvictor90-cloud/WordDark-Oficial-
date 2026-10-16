import { validateRequest } from "./contracts.js";
export class Bridge {
  constructor({ connectors, handlers, gate, audit }) { this.connectors = connectors; this.handlers = handlers; this.gate = gate; this.audit = audit; }
  async request(input, context = {}) {
    const request = validateRequest(input);
    const connector = this.connectors.find(item => item.id === request.connectorId);
    this.audit.record("gateway.request", { requestId: request.requestId, connectorId: request.connectorId, action: request.action });
    try {
      if (!connector) throw new Error("Conector não registrado.");
      const scope = context.scope || connector.scopes[0];
      this.gate.authorize(connector, scope);
      const handler = this.handlers[connector.id];
      if (typeof handler !== "function") throw new Error("Este conector não possui executor implementado.");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const result = await handler(request.input, { signal: controller.signal });
        this.audit.record("gateway.success", { requestId: request.requestId, connectorId: connector.id });
        return { version: "1.0.0", requestId: request.requestId, ok: true, result };
      } finally { clearTimeout(timer); }
    } catch (error) {
      const denied = /permissão|desativado|não registrado|não permitido/i.test(error?.message || "");
      this.audit.record(denied ? "gateway.denied" : "gateway.error", { requestId: request.requestId, connectorId: request.connectorId, reason: error?.message || "Erro desconhecido" });
      return { version: "1.0.0", requestId: request.requestId, ok: false, error: error?.message || "Falha no conector." };
    }
  }
}
