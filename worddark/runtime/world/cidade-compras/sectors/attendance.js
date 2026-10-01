export const ATTENDANCE_STEPS = Object.freeze(["IDENTIFY_CUSTOMER","IDENTIFY_INTENT","SEARCH_CATALOG","ANSWER","BUILD_CART","CONFIRM_ORDER","HANDOFF"]);
export function startAttendance({ id, communicationId, customerId = null }) {
  if (!id || !communicationId) throw new Error("INVALID_ATTENDANCE");
  return { id, communicationId, customerId, step: "IDENTIFY_CUSTOMER", status: "ACTIVE", history: [{ step: "IDENTIFY_CUSTOMER", at: new Date().toISOString() }] };
}
export function advanceAttendance(attendance, step) {
  if (!ATTENDANCE_STEPS.includes(step)) throw new Error("INVALID_ATTENDANCE_STEP");
  return { ...attendance, step, history: [...attendance.history, { step, at: new Date().toISOString() }] };
}