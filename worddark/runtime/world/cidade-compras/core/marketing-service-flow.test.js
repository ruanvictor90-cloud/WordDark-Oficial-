import assert from "node:assert/strict";
import { createCommerceMarketingFlow, returnCommerceMarketingResult } from "./marketing-service-flow.js";

const flow = createCommerceMarketingFlow({
  serviceRequestId: "WD-SVC-MKT-TEST",
  marketingRequestId: "WD-MKT-TEST",
  requestedBy: "WD-USR-TEST",
  brief: "Criar uma peça para o lançamento do produto.",
  channelIds: ["WD-CH-SOCIAL"],
  campaignId: "WD-CAMP-TEST",
  destination: "SOCIAL"
});

assert.equal(flow.serviceRequest.status, "DISPATCHED_TO_HEAVEN");
assert.deepEqual(flow.serviceRequest.route, ["TERRA", "RODOVIA", "CEU", "MARKETING"]);
assert.equal(flow.marketingRequest.status, "SENT_TO_FACTORY");
assert.deepEqual(flow.route, ["TERRA", "RODOVIA", "CEU", "MARKETING", "DARK_FACTORY"]);

const returned = returnCommerceMarketingResult(flow, {
  resultId: "WD-RES-MKT-TEST",
  result: { status: "READY", asset: "content-test" }
});

assert.equal(returned.serviceRequest.status, "RESULT_RECEIVED");
assert.equal(returned.marketingRequest.status, "READY_FOR_DISTRIBUTION");
assert.equal(returned.serviceRequest.resultId, "WD-RES-MKT-TEST");
assert.equal(returned.marketingRequest.resultId, "WD-RES-MKT-TEST");
assert.deepEqual(returned.route, ["DARK_FACTORY", "RODOVIA", "TERRA", "COMMERCE_CITY"]);

assert.throws(
  () => createCommerceMarketingFlow({
    serviceRequestId: "WD-SVC-BAD",
    marketingRequestId: "WD-MKT-BAD",
    requestedBy: "WD-USR-TEST",
    brief: "x",
    purpose: "INVALID"
  }),
  /SERVICE_NOT_AVAILABLE_TO_CITY/
);

console.log("cidade-compras marketing service flow tests: ok");