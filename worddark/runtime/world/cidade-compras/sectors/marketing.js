import {
  createMarketingRequest,
  planMarketingRequest,
  sendToFactory,
  returnToMarketing,
  distributeMarketingResult
} from "../core/marketing-request.js";

export const MARKETING_STATES = Object.freeze([
  "REQUESTED",
  "PLANNED",
  "SENT_TO_FACTORY",
  "RESULT_RETURNED",
  "READY_FOR_DISTRIBUTION"
]);

export {
  createMarketingRequest,
  planMarketingRequest,
  sendToFactory,
  returnToMarketing,
  distributeMarketingResult
};

export function receiveFactoryResult(request, resultId) {
  return returnToMarketing(request, resultId);
}

export function prepareDistribution(request) {
  return distributeMarketingResult(request);
}
