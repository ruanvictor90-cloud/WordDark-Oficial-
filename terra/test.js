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

  const request=city.requestService("IMAGE",{taskType:"IMAGE",channel:state.id,test:true});
  const result=city.submit(request);

  assert.equal(result.status,"COMPLETED");
  assert.equal(city.results.has(request.id),true);
  assert.equal(city.results.get(request.id).status,"COMPLETED");
}

const status=terra.status();
assert.equal(status.countries.length,1);
assert.equal(status.countries[0].states.length,4);

console.log("Terra test: OK");
