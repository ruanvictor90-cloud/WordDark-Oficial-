export const INCIDENT_STATES = Object.freeze(["OPEN","ANALYZING","REQUEUED","RESOLVED","CANCELLED"]);

export const INCIDENT_TRANSITIONS = Object.freeze({
  OPEN: ["ANALYZING", "CANCELLED"],
  ANALYZING: ["REQUEUED", "RESOLVED", "CANCELLED"],
  REQUEUED: ["ANALYZING", "CANCELLED"],
  RESOLVED: [],
  CANCELLED: []
});

export function createIncident({
  id,
  source,
  operationId = null,
  orderId = null,
  type,
  description
}) {
  if (!id || !source || !type || !description) throw new Error("INVALID_INCIDENT");

  return {
    id,
    source,
    operationId,
    orderId,
    type,
    description,
    status: "OPEN",
    history: [{ status: "OPEN", at: new Date().toISOString() }]
  };
}

export function transitionIncident(incident, status, note = null) {
  if (!incident || !INCIDENT_TRANSITIONS[incident.status]?.includes(status)) {
    throw new Error("INVALID_INCIDENT_TRANSITION");
  }

  return {
    ...incident,
    status,
    history: [
      ...incident.history,
      { status, note, at: new Date().toISOString() }
    ]
  };
}
