const ALLOWED_SERVICES = new Set(["MARKETING", "DARK_FACTORY"]);

export function createServiceRequest({
  id,
  cityId,
  service,
  purpose,
  requestedBy,
  payload = {},
  destination = null
}) {
  if (!id || !cityId || !service || !purpose || !requestedBy) {
    throw new Error("INVALID_SERVICE_REQUEST");
  }

  if (!ALLOWED_SERVICES.has(service)) {
    throw new Error("SERVICE_NOT_AVAILABLE_TO_CITY");
  }

  return {
    id,
    cityId,
    layer: "TERRA",
    service,
    purpose,
    requestedBy,
    destination,
    payload,
    status: "REQUESTED",
    history: [
      {
        status: "REQUESTED",
        service,
        at: new Date().toISOString()
      }
    ]
  };
}

export function dispatchServiceRequest(request) {
  if (!request || request.status !== "REQUESTED") {
    throw new Error("SERVICE_REQUEST_NOT_READY");
  }

  return {
    ...request,
    status: "DISPATCHED_TO_HEAVEN",
    route: ["TERRA", "RODOVIA", "CEU", request.service],
    history: [
      ...request.history,
      {
        status: "DISPATCHED_TO_HEAVEN",
        service: request.service,
        at: new Date().toISOString()
      }
    ]
  };
}

export function receiveServiceResult(request, resultId, result = null) {
  if (!request || request.status !== "DISPATCHED_TO_HEAVEN") {
    throw new Error("SERVICE_RESULT_NOT_EXPECTED");
  }

  return {
    ...request,
    status: "RESULT_RECEIVED",
    resultId,
    result,
    history: [
      ...request.history,
      {
        status: "RESULT_RECEIVED",
        service: request.service,
        resultId,
        at: new Date().toISOString()
      }
    ]
  };
}
