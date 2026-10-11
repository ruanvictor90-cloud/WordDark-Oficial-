export const WORLD_ENVIRONMENTS = Object.freeze(["TEST", "PROD"]);
export const REQUEST_STATUSES = Object.freeze(["RECEIVED", "WAITING_APPROVAL", "DISPATCHED", "REJECTED", "FAILED"]);

const text = value => typeof value === "string" && value.trim().length > 0;

export function createWorldRequest(source = {}) {
  const now = new Date().toISOString();
  return {
    requestId: source.requestId || null,
    operationId: source.operationId || null,
    requesterId: source.requesterId || null,
    originId: source.originId || null,
    targetSectorId: source.targetSectorId || null,
    capability: source.capability || null,
    action: source.action || null,
    environment: source.environment || "TEST",
    scope: source.scope || null,
    requiresApproval: source.requiresApproval === true,
    approvalId: source.approvalId || null,
    payload: source.payload && typeof source.payload === "object" && !Array.isArray(source.payload) ? structuredClone(source.payload) : {},
    createdAt: source.createdAt || now,
    correlationId: source.correlationId || source.operationId || source.requestId || null
  };
}

export function validateWorldRequest(request) {
  const errors = [];
  for (const field of ["requestId", "operationId", "requesterId", "originId", "targetSectorId", "capability", "action", "scope"]) {
    if (!text(request?.[field])) errors.push({ code: "FIELD_REQUIRED", field });
  }
  if (!WORLD_ENVIRONMENTS.includes(request?.environment)) errors.push({ code: "INVALID_ENVIRONMENT", field: "environment" });
  if (request?.payload === null || typeof request?.payload !== "object" || Array.isArray(request.payload)) errors.push({ code: "INVALID_PAYLOAD", field: "payload" });
  if (request?.createdAt && !Number.isFinite(Date.parse(request.createdAt))) errors.push({ code: "INVALID_TIMESTAMP", field: "createdAt" });
  return { valid: errors.length === 0, errors };
}
