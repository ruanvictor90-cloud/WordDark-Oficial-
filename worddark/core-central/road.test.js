import assert from "node:assert/strict";
import { CapabilityRegistry } from "./capabilities.js";
import { Road } from "./road.js";
import { Operation } from "./operation.js";

const registry = new CapabilityRegistry();
registry.register({
  id:"IMAGE", name:"IMAGE", owner:"DARK-FACTORY",
  layer:"CEU", handler:()=>({success:true}),
  metadata:{domain:"DARK-FACTORY", region:"IMAGEM", nucleus:"EDITOR"}
});

const road = new Road({registry});
const op = new Operation({
  origin:"SUCOCAST-CITY",
  service:"IMAGE",
  gateId:"SUCOCAST-GATE",
  payload:{assetId:"A1"}
});

const routed = road.route(op);
assert.equal(routed.success,true);
assert.equal(routed.capability.owner,"DARK-FACTORY");

const delivered = road.deliver(op);
assert.equal(delivered.success,true);
assert.equal(delivered.delivery.status,"DELIVERED");

const returned = road.return(op,{success:true,assetId:"A1"});
assert.equal(returned.success,true);
assert.equal(returned.delivery.status,"RETURNED");

const missing = road.route(new Operation({
  origin:"SUCOCAST-CITY",
  service:"UNKNOWN",
  gateId:"SUCOCAST-GATE"
}));
assert.equal(missing.status,"CAPABILITY_NOT_FOUND");

console.log("Road suite: PASS");
