import { createServiceRequest, dispatchServiceRequest, receiveServiceResult } from "./service-request.js";
import { createMarketingRequest, planMarketingRequest, sendToFactory, returnToMarketing, distributeMarketingResult } from "./marketing-request.js";

export function createCommerceMarketingFlow({
  serviceRequestId,
  marketingRequestId,
  cityId = "WD-CITY-COMMERCE",
  purpose = "CONTENT_PRODUCTION",
  requestedBy,
  brief,
  channelIds = [],
  campaignId = null,
  destination = null,
  payload = {}
}) {
  if (!serviceRequestId || !marketingRequestId || !requestedBy || !brief) {
    throw new Error("INVALID_MARKETING_FLOW_INPUT");
  }

  const serviceRequest = createServiceRequest({
    id: serviceRequestId,
    cityId,
    service: "MARKETING",
    purpose,
    requestedBy,
    payload: { ...payload, brief, channelIds, campaignId },
    destination
  });

  const dispatched = dispatchServiceRequest(serviceRequest);

  const marketing = createMarketingRequest({
    id: marketingRequestId,
    source: cityId,
    channelIds,
    brief,
    requestedBy,
    campaignId
  });

  const planned = planMarketingRequest(marketing);
  const factoryRequest = sendToFactory(planned);

  return {
    serviceRequest: dispatched,
    marketingRequest: factoryRequest,
    route: ["TERRA", "RODOVIA", "CEU", "MARKETING", "DARK_FACTORY"],
    status: "SENT_TO_FACTORY"
  };
}

export function returnCommerceMarketingResult(flow, {
  resultId,
  result
}) {
  if (!flow?.serviceRequest || !flow?.marketingRequest || !resultId) {
    throw new Error("INVALID_MARKETING_RESULT_FLOW");
  }

  const serviceResult = receiveServiceResult(flow.serviceRequest, resultId, result);
  const returned = returnToMarketing(flow.marketingRequest, resultId);
  const ready = distributeMarketingResult(returned);

  return {
    ...flow,
    serviceRequest: serviceResult,
    marketingRequest: ready,
    result,
    route: ["DARK_FACTORY", "RODOVIA", "TERRA", "COMMERCE_CITY"],
    status: "READY_FOR_DISTRIBUTION"
  };
}