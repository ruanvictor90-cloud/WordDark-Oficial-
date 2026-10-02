import assert from "node:assert/strict";
import { createWordDarkWorld } from "../worddark/main.js";
import { Pais, Estado, Cidade, Bairro } from "./core/index.js";

const world=createWordDarkWorld();
const {terra,runtime}=world;

// Terra oficial começa dinâmica: não depende de País/SucoCast pré-criados.
assert.equal(terra.countries.size,0);

// Criamos somente a estrutura necessária para este teste.
const country=new Pais({id:"TERRA-TEST-COUNTRY",name:"Grupo de Teste"});
const city=new Cidade({
  id:"TERRA-TEST-CITY",
  name:"Ambiente de Teste",
  countryId:country.id,
  stateId:"TERRA-TEST-STATE",
  bairro:new Bairro({id:"TERRA-TEST-BARRIO",stateId:"TERRA-TEST-STATE",cityId:"TERRA-TEST-CITY"})
});
const state=new Estado({
  id:"TERRA-TEST-STATE",
  name:"Operação de Teste",
  countryId:country.id,
  city
});
country.registerState(state);
terra.registerCountry(country);

assert.equal(terra.countries.size,1);
assert.ok(country.getState(state.id));
assert.equal(city.layer,"TERRA");
assert.ok(runtime.gates.has(city.gateId));

const need=city.receiveNeed({
  type:"IMAGE",
  requester:{
    type:"SOCIAL_CHANNEL",
    id:"TEST-CHANNEL",
    network:"INSTAGRAM",
    channelId:"TEST-CHANNEL"
  },
  description:"Preciso de uma imagem para uma publicação.",
  data:{format:"16:9",theme:"teste"},
  priority:"NORMAL"
});

assert.equal(need.status,"PENDING");
const request=city.createOperationFromNeed(need.id);
assert.equal(request.context.needId,need.id);
assert.equal(request.payload.contentType,"IMAGE");

const result=city.submit(request);
assert.equal(result.status,"COMPLETED");
assert.equal(city.results.has(request.id),true);
assert.equal(city.results.get(request.id).status,"COMPLETED");

const status=terra.status();
assert.equal(status.countries.length,1);
assert.equal(status.countries[0].states.length,1);

console.log("Terra dynamic structure test: OK");
