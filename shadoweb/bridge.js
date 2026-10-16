import { validateRequest } from "./contracts.js";

export class Bridge {
  constructor({ connectors, handlers, gate, audit, timeoutMs = 8000 }) {
    this.connectors = connectors;
    this.handlers = handlers;
    this.gate = gate;
    this.audit = audit;
    this.timeoutMs = timeoutMs;
  }

  async request(input, context = {}) {
    const request = validateRequest(input);
    const connector = this.connectors.find(item => item.id === request.connectorId);
    this.audit.record("gateway.request", {
      requestId: request.requestId,
      connectorId: request.connectorId,
      action: request.action,
      appId: typeof context.appId === "string" ? context.appId : "shadoweb-core"
    });

    try {
      if (!connector) throw new Error("Conector não registrado.");
      if (!Array.isArray(connector.actions) || !connector.actions.includes(request.action)) {
        throw new Error("Ação não permitida para este conector.");
      }

      const scope = context.scope || connector.scopes[0];
      this.gate.authorize(connector, scope);

      const handler = this.handlers[connector.id];
      if (typeof handler !== "function") {
        throw new Error("Este conector não possui executor implementado.");
      }

      const controller = new AbortController();
      let timer;
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error("Tempo limite do conector excedido."));
        }, this.timeoutMs);
      });

      try {
        const execution = Promise.resolve().then(() =>
          handler(request.input, { signal: controller.signal })
        );
        const result = await Promise.race([execution, timeout]);
        this.audit.record("gateway.success", {
          requestId: request.requestId,
          connectorId: connector.id,
          appId: typeof context.appId === "string" ? context.appId : "shadoweb-core"
        });
        return { version: "1.0.0", requestId: request.requestId, ok: true, result };
      } finally {
        clearTimeout(timer);
      }
    } catch (error) {
      const message = error?.message || "Falha no conector.";
      const denied = /permissão|desativado|não registrado|não permitid[oa]|escopo incompatível/i.test(message);
      this.audit.record(denied ? "gateway.denied" : "gateway.error", {
        requestId: request.requestId,
        connectorId: request.connectorId,
        reason: message,
        appId: typeof context.appId === "string" ? context.appId : "shadoweb-core"
      });
      return { version: "1.0.0", requestId: request.requestId, ok: false, error: message };
    }
  }
}
