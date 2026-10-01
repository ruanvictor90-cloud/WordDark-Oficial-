import assert from "node:assert/strict";
import { createWordDarkWorld } from "../main.js";
import { Operation } from "./operation.js";

const world = createWordDarkWorld();

world.security.register({id:"TEST-USER",status:"ACTIVE"});
world.security.grant("TEST-USER","DARK-FACTORY");
assert.equal(world.security.authorize({
  subjectId:"TEST-USER", capability:"DARK-FACTORY", environment:"TEST"
}).allowed, true);

world.localLibrary.save({id:"LOCAL-1",type:"TEST",value:"knowledge"});
const promoted = world.library.promote(world.localLibrary.get("LOCAL-1"), {
  source: "WORDDARK-LOCAL-CORE"
});
assert.equal(promoted.type, "LEARNING_PROMOTION");

const op = new Operation({
  origin:"TEST-CITY",
  service:"IMAGE",
  gateId:"DARK-FACTORY-GATE",
  requesterId:"TEST-USER",
  payload:{task:"test"}
});
const sent = world.communication.send(op);
assert.equal(sent.success, true);
assert.equal(sent.receipt.status, "RECEIVED");

const adapter = {
  integrationId:"TEST-INTEGRATION",
  platform:"TEST",
  status:"TEST",
  execute(operation, payload){ return {success:true, operationId:operation.id, payload}; }
};
world.integrations.register(adapter);
assert.equal(world.integrations.execute("TEST-INTEGRATION",op,{ok:true}).success,true);

world.operationRegistry.recordEvent(op,"ABSORPTION_TEST",{ok:true});
assert.equal(world.operationRegistry.getEvents(op.id).length, 1);

console.log("Legacy absorption suite: PASS");
