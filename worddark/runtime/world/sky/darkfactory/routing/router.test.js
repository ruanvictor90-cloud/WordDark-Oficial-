/*
 * Dark Factory — Routing Test
 * DF-0.4 foundation
 *
 * Teste isolado da Rodovia:
 * 1. registra rota válida
 * 2. encaminha envelope pela rota
 * 3. preserva messageId/requestId
 * 4. rejeita destino sem rota
 */

const WordDarkRoute = require("../contracts/route");
const WordDarkRouter = require("./router");

function assert(condition, message) {
  if (!condition) {
    throw new Error("TEST FAILED: " + message);
  }
}

const router = new WordDarkRouter();

const route = new WordDarkRoute({
  routeId: "ROUTE-TEST-EARTH-DF",
  origin: "world/earth",
  destination: "darkfactory",
  service: "test"
});

const registration = router.registerRoute(route);

assert(registration.success === true, "rota válida não foi registrada.");

const envelope = {
  protocol: "DF-0.4",
  messageId: "MSG-ROUTING-001",
  requestId: "DF-ROUTING-001",
  origin: "world/earth",
  destination: "darkfactory",
  type: "REQUEST",
  payload: {
    task: "teste da rodovia"
  }
};

const forwarded = router.send({
  envelope,
  origin: "world/earth",
  destination: "darkfactory",
  service: "test"
});

assert(forwarded.success === true, "mensagem não foi encaminhada.");
assert(forwarded.status === "ENCAMINHADO", "status de encaminhamento inválido.");
assert(forwarded.routeId === "ROUTE-TEST-EARTH-DF", "routeId incorreto.");
assert(forwarded.messageId === "MSG-ROUTING-001", "messageId não preservado.");
assert(forwarded.requestId === "DF-ROUTING-001", "requestId não preservado.");

const rejected = router.send({
  envelope,
  origin: "world/earth",
  destination: "darkfactory",
  service: "unknown"
});

assert(rejected.success === false, "rota inexistente foi aceita.");
assert(rejected.status === "ROTA_NAO_ENCONTRADA", "status de rejeição incorreto.");

console.log("ROUTING TEST: PASS");
console.log({
  registeredRoute: registration.routeId,
  forwarded: forwarded.status,
  preservedMessageId: forwarded.messageId,
  preservedRequestId: forwarded.requestId,
  rejectedUnknownRoute: rejected.status,
  routerStatus: router.getStatus()
});
