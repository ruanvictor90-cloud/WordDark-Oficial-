const WordDarkRoad = require("./road");
const WordDarkRoute = require("../contracts/route");
const WordDarkMessage = require("../contracts/message");

const road = new WordDarkRoad();
road.registerRoute(new WordDarkRoute({
  routeId:"R-TEST-DF",
  origin:"world/earth/test",
  destination:"world/sky/darkfactory",
  service:"content.produce"
}));

const message = new WordDarkMessage({
  messageId:"MSG-TEST-1",
  requestId:"OP-TEST-1",
  type:"OPERATION_REQUEST",
  origin:"world/earth/test",
  destination:"world/sky/darkfactory",
  service:"content.produce",
  payload:{title:"teste"}
});

const delivered = road.send(message);
if (!delivered.success) throw new Error("A Rodovia deveria entregar uma mensagem por rota ativa.");
if (road.listDeliveries().length !== 1) throw new Error("A entrega deveria ser registrada.");

console.log("road.test: OK");
