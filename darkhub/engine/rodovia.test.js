import assert from "node:assert/strict";
import { createDarkHubRodovia, createRodoviaMessage, validateMessage, resolveRodoviaCapability } from "./rodovia.js";

let seq = 0;
const now = () => "2026-10-18T00:00:00.000Z";
const idFactory = () => "id-" + (++seq);
const road = createDarkHubRodovia({ now, idFactory });
assert.equal(road.getStatus().status, "LOCAL");
assert.throws(() => createRodoviaMessage({ origin: "app-a" }, { now, idFactory }), /destination é obrigatório/);
assert.equal(validateMessage({}).valid, false);
assert.throws(() => road.registerRoute({ routeId: "r1", origin: "app-a", destination: "app-b", status: "BROKEN" }), /Status de rota inválido/);
road.registerRoute({ routeId: "r1", origin: "app-a", destination: "app-b", service: "catalog.read" });
assert.throws(() => road.registerRoute({ routeId: "r1", origin: "app-a", destination: "app-b", service: "*" }), /Já existe/);
const catalogResult = resolveRodoviaCapability({ requestId: "q-cap", capability: "browser.open" }, {
  capabilities: [{ fullId: "shadoweb:browser.open", appId: "shadoweb", id: "browser.open", name: "Abrir navegador", status: "enabled" }]
});
assert.equal(catalogResult.status, "routed");
assert.equal(catalogResult.destination, "shadoweb");
assert.equal(resolveRodoviaCapability({ capability: "shadoweb:browser.open", requestId: "q-cap-2" }, {
  capabilities: [{ fullId: "shadoweb:browser.open", appId: "shadoweb", id: "browser.open", name: "Abrir navegador", status: "enabled" }]
}).status, "routed");
assert.equal(resolveRodoviaCapability({ capability: "post", requestId: "q-cap-3" }, {
  sectors: [{ id: "marketing", status: "active", capabilities: ["post"] }]
}).status, "routed");
assert.equal(resolveRodoviaCapability({ capability: "missing", requestId: "q-cap-4" }, { capabilities: [] }).destination, "darkhub:creation");
assert.equal(resolveRodoviaCapability({ capability: "food:cafe", requestId: "q-cap-5" }, {
  capabilities: [{ fullId: "food:café", appId: "food", id: "café", name: "Café", status: "enabled" }]
}).status, "routed");


function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, value) };
}
const requestStorage = memoryStorage();
const requestRoad = createDarkHubRodovia({ now, idFactory, storage: requestStorage });
const createdRequest = requestRoad.createRequest({ requestId: "req-1", origin: "darkhub", capability: "shadoweb:browser.open", description: "Abrir um ambiente de navegador." });
assert.equal(createdRequest.state, "received");
assert.throws(() => requestRoad.createRequest({ requestId: "req-1", origin: "darkhub", capability: "duplicado" }), /Já existe/);
const resolvedRequest = requestRoad.resolveRequest("req-1", { capabilities: [{ fullId: "shadoweb:browser.open", appId: "shadoweb", id: "browser.open", status: "enabled" }] });
assert.equal(resolvedRequest.request.state, "awaiting-approval");
assert.equal(resolvedRequest.request.destination, "shadoweb");
assert.throws(() => requestRoad.transitionRequest("req-1", "completed"), /Transição não permitida/);
requestRoad.transitionRequest("req-1", "ready", { note: "Aprovado manualmente para teste." });
requestRoad.transitionRequest("req-1", "in-transit");
requestRoad.transitionRequest("req-1", "delivered");
requestRoad.transitionRequest("req-1", "completed", { note: "Concluído." });
assert.equal(requestRoad.listRequests({ state: "completed" })[0].requestId, "req-1");
const restoredRoad = createDarkHubRodovia({ now, idFactory, storage: requestStorage });
assert.equal(restoredRoad.listRequests()[0].state, "completed");
const missingRequest = requestRoad.createRequest({ requestId: "req-2", origin: "darkhub", capability: "capability.missing" });
assert.equal(requestRoad.resolveRequest("req-2", { capabilities: [] }).request.state, "needs-creation");
assert.equal(requestRoad.transitionRequest("req-2", "received").state, "received");

let received;
road.registerEndpoint("app-b", message => { received = message; return { accepted: true }; });
const delivered = await road.send({ messageId: "m1", requestId: "q1", origin: "app-a", destination: "app-b", service: "catalog.read", payload: { item: "test" } });
assert.equal(delivered.success, true);
assert.equal(delivered.status, "DELIVERED");
assert.equal(received.routeId, "r1");
assert.equal(delivered.receipt.accepted, true);
assert.ok(road.listEvents({ requestId: "q1" }).some(event => event.kind === "DELIVERY_CONFIRMED"));
assert.equal((await road.send({ messageId: "m1", requestId: "q1", origin: "app-a", destination: "app-b", service: "catalog.read", payload: {} })).status, "DUPLICATE_BLOCKED");
assert.equal((await road.send({ messageId: "m2", requestId: "q2", origin: "app-a", destination: "app-b", service: "catalog.write", payload: {} })).status, "ROUTE_NOT_FOUND");
road.setRouteStatus("r1", "SUSPENDED");
assert.equal((await road.send({ messageId: "m3", requestId: "q3", origin: "app-a", destination: "app-b", service: "catalog.read", payload: {} })).status, "ROUTE_NOT_FOUND");
road.setRouteStatus("r1", "ACTIVE");
road.registerEndpoint("app-c", () => { throw new Error("executor offline"); });
road.registerRoute({ routeId: "r2", origin: "app-a", destination: "app-c", service: "*" });
assert.equal((await road.send({ messageId: "m4", requestId: "q4", origin: "app-a", destination: "app-c", service: "task", payload: {} })).status, "DELIVERY_FAILED");
const noEndpoint = createDarkHubRodovia({ now, idFactory });
noEndpoint.registerRoute({ routeId: "r3", origin: "a", destination: "b", service: "*" });
assert.equal((await noEndpoint.send({ messageId: "m5", requestId: "q5", origin: "a", destination: "b", service: "ping", payload: {} })).status, "ENDPOINT_UNAVAILABLE");
const tooLarge = createDarkHubRodovia({ now, idFactory, maxPayloadBytes: 8 });
tooLarge.registerRoute({ routeId: "r4", origin: "a", destination: "b", service: "*" });
tooLarge.registerEndpoint("b", () => true);
assert.equal((await tooLarge.send({ messageId: "m6", requestId: "q6", origin: "a", destination: "b", service: "ping", payload: { text: "this is too large" } })).status, "REJECTED");
assert.equal(road.getStatus().routes, 2);
console.log("darkHub Rodovia tests passed");
