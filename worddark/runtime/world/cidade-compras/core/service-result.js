export const RESULT_STATES = Object.freeze(["CREATED","READY","DELIVERED","REJECTED"]);

export function createServiceResult({ id, requestId, service, status = "CREATED", payload = {}, errors = [] }) {
  if (!id || !requestId || !service) throw new Error("INVALID_SERVICE_RESULT");
  if (!RESULT_STATES.includes(status)) throw new Error("INVALID_SERVICE_RESULT_STATUS");
  return { id, requestId, service, status, payload, errors, history: [{ status, at: new Date().toISOString() }] };
}

export function deliverServiceResult(result) {
  if (!result || !["CREATED","READY"].includes(result.status)) throw new Error("SERVICE_RESULT_NOT_READY");
  return { ...result, status: "DELIVERED", history: [...result.history, { status: "DELIVERED", at: new Date().toISOString() }] };
}
