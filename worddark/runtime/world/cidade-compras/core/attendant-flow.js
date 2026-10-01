export const ATTENDANT_FLOW=Object.freeze([
  "RECEIVE_MESSAGE","IDENTIFY_CUSTOMER","IDENTIFY_INTENT","FIND_PRODUCT","ANSWER","BUILD_CART","CONFIRM_ORDER","HANDOFF"
]);

export function nextAttendantStep(current){
  const i=ATTENDANT_FLOW.indexOf(current);
  return i<0 ? ATTENDANT_FLOW[0] : ATTENDANT_FLOW[i+1] ?? "HANDOFF";
}
