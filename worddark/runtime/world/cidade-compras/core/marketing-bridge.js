import { createMarketingRequest, planMarketingRequest, sendToFactory, returnToMarketing, distributeMarketingResult } from "./marketing-request.js";
export { createMarketingRequest, planMarketingRequest, sendToFactory, returnToMarketing, distributeMarketingResult };
export function createContentRequirement(args) {
  return createMarketingRequest({id:args.id,source:args.commerceSource,channelIds:args.channelIds,brief:args.brief,requestedBy:args.commerceSource,campaignId:args.campaignId});
}
export function dispatchToMarketing(requirement) {
  return planMarketingRequest(requirement);
}
export function dispatchToFactory(requirement) {
  return sendToFactory(requirement);
}
export function receiveFactoryResult(requirement,resultId) {
  return returnToMarketing(requirement,resultId);
}
export function prepareDistribution(requirement) {
  return distributeMarketingResult(requirement);
}