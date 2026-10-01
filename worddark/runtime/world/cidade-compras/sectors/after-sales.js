export const AFTER_SALES_TYPES = Object.freeze(["TRACKING","EXCHANGE","REFUND","SUPPORT","FEEDBACK"]);
export const AFTER_SALES_STATES = Object.freeze(["OPEN","IN_PROGRESS","CLOSED","CANCELLED"]);

export const AFTER_SALES_TRANSITIONS = Object.freeze({
  OPEN: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["CLOSED", "CANCELLED"],
  CLOSED: [],
  CANCELLED: []
});

export function createAfterSalesCase({ id, orderId, customerId, type, description }) {
  if (!id || !orderId || !customerId || !AFTER_SALES_TYPES.includes(type) || !description) {
    throw new Error("INVALID_AFTER_SALES_CASE");
  }

  return {
    id,
    orderId,
    customerId,
    type,
    description,
    status: "OPEN",
    history: [{ status: "OPEN", at: new Date().toISOString() }]
  };
}

export function transitionAfterSalesCase(caseFile, status, note = null) {
  if (!caseFile || !AFTER_SALES_TRANSITIONS[caseFile.status]?.includes(status)) {
    throw new Error("INVALID_AFTER_SALES_TRANSITION");
  }

  return {
    ...caseFile,
    status,
    history: [
      ...caseFile.history,
      { status, note, at: new Date().toISOString() }
    ]
  };
}

export function closeAfterSalesCase(caseFile, resolution) {
  if (!resolution) throw new Error("AFTER_SALES_RESOLUTION_REQUIRED");

  const inProgress = caseFile.status === "OPEN"
    ? transitionAfterSalesCase(caseFile, "IN_PROGRESS")
    : caseFile;

  return transitionAfterSalesCase(inProgress, "CLOSED", resolution);
}
