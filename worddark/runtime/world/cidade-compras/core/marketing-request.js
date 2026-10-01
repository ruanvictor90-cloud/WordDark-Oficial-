export function createMarketingRequest({id,source,channelIds=[],brief,requestedBy,campaignId=null}) {
  if (!id || !source || !brief || !requestedBy) throw new Error("INVALID_MARKETING_REQUEST");
  return {
    id, source, channelIds, brief, requestedBy, campaignId,
    status:"REQUESTED",
    currentService:"MARKETING",
    nextService:"MARKETING",
    history:[{status:"REQUESTED", service:"MARKETING", at:new Date().toISOString()}]
  };
}
export function planMarketingRequest(request) {
  if (request.status !== "REQUESTED") throw new Error("MARKETING_REQUEST_NOT_READY");
  return {...request,status:"PLANNED",currentService:"MARKETING",nextService:"DARK_FACTORY",
    history:[...request.history,{status:"PLANNED",service:"MARKETING",nextService:"DARK_FACTORY",at:new Date().toISOString()}]};
}
export function sendToFactory(request) {
  if (request.status !== "PLANNED") throw new Error("MARKETING_REQUEST_NOT_PLANNED");
  return {...request,status:"SENT_TO_FACTORY",currentService:"DARK_FACTORY",nextService:"DARK_FACTORY",
    history:[...request.history,{status:"SENT_TO_FACTORY",service:"DARK_FACTORY",at:new Date().toISOString()}]};
}
export function returnToMarketing(request,resultId) {
  if (request.status !== "SENT_TO_FACTORY") throw new Error("FACTORY_RESULT_NOT_EXPECTED");
  return {...request,status:"RESULT_RETURNED",currentService:"MARKETING",nextService:"MARKETING",resultId,
    history:[...request.history,{status:"RESULT_RETURNED",service:"MARKETING",resultId,at:new Date().toISOString()}]};
}
export function distributeMarketingResult(request) {
  if (request.status !== "RESULT_RETURNED") throw new Error("MARKETING_RESULT_NOT_READY");
  return {...request,status:"READY_FOR_DISTRIBUTION",currentService:"MARKETING",nextService:"CHANNEL",
    history:[...request.history,{status:"READY_FOR_DISTRIBUTION",service:"CHANNEL",at:new Date().toISOString()}]};
}