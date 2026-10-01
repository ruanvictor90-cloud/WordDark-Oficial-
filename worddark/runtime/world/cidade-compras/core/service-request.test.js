import assert from "node:assert/strict";
import {
  createServiceRequest,
  dispatchServiceRequest,
  receiveServiceResult
} from "./service-request.js";
import { authorizeCityAction } from "./permissions.js";
import { receiveAtGate, authorizeAtGate, routeFromGate } from "../sectors/gate.js";

const auth = authorizeCityAction({
  actorId: "WD-USR-TEST",
  actorRole: "OPERATOR",
  action: "ENTER_CITY",
  cityId: "WD-CITY-COMMERCE"
});

assert.equal(auth.authorized, true);

const gateEntry = receiveAtGate({
  id: "WD-GATE-TEST",
  source: "SOCIAL",
  destination: "COMMUNICATION",
  actorId: "WD-USR-TEST",
  actorRole: "OPERATOR",
  context: { cityId: "WD-CITY-COMMERCE" }
});

const routed = routeFromGate(authorizeAtGate(gateEntry));
assert.equal(routed.status, "ROUTED");

const request = createServiceRequest({
  id: "WD-SVC-TEST",
  cityId: "WD-CITY-COMMERCE",
  service: "DARK_FACTORY",
  purpose: "CONTENT_PRODUCTION",
  requestedBy: "WD-USR-TEST",
  payload: { brief: "Produto de teste" },
  destination: "SOCIAL"
});

const dispatched = dispatchServiceRequest(request);
assert.equal(dispatched.status, "DISPATCHED_TO_HEAVEN");
assert.deepEqual(dispatched.route, ["TERRA", "RODOVIA", "CEU", "DARK_FACTORY"]);

const returned = receiveServiceResult(dispatched, "WD-RES-TEST", {
  status: "READY"
});

assert.equal(returned.status, "RESULT_RECEIVED");
assert.equal(returned.resultId, "WD-RES-TEST");

console.log("cidade-compras service boundary tests: ok");
