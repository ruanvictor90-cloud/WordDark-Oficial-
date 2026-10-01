import assert from "node:assert/strict";
import { createWordDarkWorld } from "../worddark/main.js";

const world=createWordDarkWorld();
const {paisSuco,terra,runtime}=world;

assert.equal(paisSuco.states.size,4);
assert.ok(paisSuco.getState("SUCOCAST"));
assert.ok(paisSuco.getState("SUCOGEEK"));
assert.ok(paisSuco.getState("SUCOCOMED"));
assert.ok(paisSuco.getState("SUCOEMPREENDIMENTO"));

for(const state of paisSuco.states.values()){
  const city=state.city;
  assert.equal(city.layer,"TERRA");
  assert.equal(city.bairro.responsibility,"NEEDS_MANAGEMENT");
  assert.ok(runtime.gates.has(city.gateId));

  const need=city.receiveNeed({
    type:"IMAGE",
    requester:{
      type:"SOCIAL_CHANNEL",
      id:state.id+"-CHANNEL",
      network:"INSTAGRAM",
      channelId:state.id
    },
    description:"Preciso de uma imagem para uma publicação.",
    data:{format:"16:9",theme:"anime"},
    priority:"NORMAL"
  });

  assert.equal(need.status,"PENDING");
  assert.equal(need.requester.type,"SOCIAL_CHANNEL");

  const request=city.createOperationFromNeed(need.id);
  assert.equal(request.context.needId,need.id);
  assert.equal(request.context.network,"INSTAGRAM");
  assert.equal(request.payload.contentType,"IMAGE");

  const result=city.submit(request);

  assert.equal(result.status,"COMPLETED");
  assert.equal(city.results.has(request.id),true);
  assert.equal(city.results.get(request.id).status,"COMPLETED");
  assert.equal(city.bairro.needs.find(x=>x.id===need.id).status,"IN_OPERATION");
}

const status=terra.status();
assert.equal(status.countries.length,1);
assert.equal(status.countries[0].states.length,4);

console.log("Terra test: OK");
