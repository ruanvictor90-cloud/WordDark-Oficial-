import { randomUUID } from "node:crypto";

const clean = value => typeof value === "string" ? value.trim() : "";
const json = (status, body) => ({
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  },
  body
});

function validText(value, max) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

/**
 * Framework-neutral public commercial intake handler.
 * No network listener, credentials, or cloud resources are initialized here.
 * Production use requires real persistent store, audit sink, origin allowlist and limiter.
 */
export function createCommercialIntakeApi({
  store,
  audit,
  rateLimiter,
  allowedOrigins = [],
  now = () => new Date().toISOString(),
  idFactory = () => randomUUID(),
  maxBodyBytes = 8192
} = {}) {
  if (!store || typeof store.createIntake !== "function") {
    throw new Error("COMMERCIAL_INTAKE_DURABLE_STORE_REQUIRED");
  }
  if (!audit || typeof audit.write !== "function") {
    throw new Error("COMMERCIAL_INTAKE_AUDIT_REQUIRED");
  }
  if (!rateLimiter || typeof rateLimiter.consume !== "function") {
    throw new Error("COMMERCIAL_INTAKE_RATE_LIMITER_REQUIRED");
  }
  if (!Array.isArray(allowedOrigins) || allowedOrigins.length === 0 ||
      allowedOrigins.some(origin => typeof origin !== "string" || !/^https:\/\//.test(origin))) {
    throw new Error("COMMERCIAL_INTAKE_ORIGIN_ALLOWLIST_REQUIRED");
  }

  return async function handle(request = {}) {
    const method = clean(request.method).toUpperCase();
    const path = clean(request.path);
    const headers = request.headers || {};
    const origin = clean(headers.origin || headers.Origin);
    const requestId = idFactory();

    if (method === "OPTIONS") return json(405, {
      success: false, error: { code: "METHOD_NOT_ALLOWED", message: "Método não permitido." }, requestId
    });
    if (method !== "POST" || path !== "/api/v1/commercial/intakes") {
      return json(404, {
        success: false, error: { code: "NOT_FOUND", message: "Rota não encontrada." }, requestId
      });
    }
    if (!allowedOrigins.includes(origin)) {
      return json(403, {
        success: false, error: { code: "ORIGIN_NOT_ALLOWED", message: "Origem não autorizada." }, requestId
      });
    }
    const contentType = clean(headers["content-type"] || headers["Content-Type"]).toLowerCase();
    if (!contentType.startsWith("application/json")) {
      return json(415, {
        success: false, error: { code: "JSON_REQUIRED", message: "Envie os dados em formato JSON." }, requestId
      });
    }

    let body;
    try {
      const raw = typeof request.rawBody === "string" ? request.rawBody : null;
      if (raw !== null && Buffer.byteLength(raw, "utf8") > maxBodyBytes) throw new Error("TOO_LARGE");
      body = raw !== null ? JSON.parse(raw) : request.body;
      if (raw === null && Buffer.byteLength(JSON.stringify(body ?? null), "utf8") > maxBodyBytes) {
        throw new Error("TOO_LARGE");
      }
    } catch (error) {
      const tooLarge = error?.message === "TOO_LARGE";
      return json(tooLarge ? 413 : 400, {
        success: false,
        error: {
          code: tooLarge ? "PAYLOAD_TOO_LARGE" : "INVALID_JSON",
          message: tooLarge ? "A solicitação é muito grande." : "Confira os dados enviados."
        },
        requestId
      });
    }

    const contactName = clean(body?.contactName);
    const contactMethod = clean(body?.contactMethod);
    const need = clean(body?.need);
    const category = clean(body?.category);
    if (!validText(contactName, 100) || !validText(contactMethod, 200) ||
        !validText(need, 2000) || !validText(category, 80) || body?.consent !== true) {
      return json(400, {
        success: false,
        error: { code: "VALIDATION_FAILED", message: "Confira os dados e confirme o consentimento." },
        requestId
      });
    }

    const fingerprint = clean(request.clientFingerprint) || "unknown";
    let limit;
    try { limit = await rateLimiter.consume({ key: fingerprint, action: "commercial-intake" }); }
    catch {
      return json(503, {
        success: false,
        error: { code: "RATE_LIMITER_UNAVAILABLE", message: "O recebimento está temporariamente indisponível." },
        requestId
      });
    }
    if (limit?.allowed !== true) {
      return json(429, {
        success: false,
        error: { code: "RATE_LIMITED", message: "Tente novamente mais tarde." },
        requestId
      });
    }

    const intake = {
      intakeId: idFactory(),
      status: "RECEIVED",
      contactName,
      contactMethod,
      need,
      category,
      consent: true,
      receivedAt: now(),
      requestId
    };

    try {
      await store.createIntake(intake);
    } catch {
      return json(503, {
        success: false,
        error: { code: "INTAKE_STORAGE_UNAVAILABLE", message: "Não foi possível registrar agora. Tente novamente mais tarde." },
        requestId
      });
    }

    try {
      await audit.write({
        event: "COMMERCIAL_INTAKE_RECEIVED",
        requestId,
        intakeId: intake.intakeId,
        status: intake.status,
        at: intake.receivedAt
      });
    } catch {
      // Do not report success when the required audit record could not be persisted.
      return json(503, {
        success: false,
        error: { code: "INTAKE_AUDIT_UNAVAILABLE", message: "O registro precisa ser verificado antes de confirmar o recebimento." },
        requestId
      });
    }

    return json(201, {
      success: true,
      status: "INTAKE_RECEIVED",
      protocol: intake.intakeId,
      receivedAt: intake.receivedAt,
      requestId
    });
  };
}
