import { WordDarkRuntime } from "./core-central/runtime.js";

export function createWordDarkWorld(){
  const runtime=new WordDarkRuntime();
  runtime.registerGate({gateId:"WORLD-GATE",ownerId:"WORDDARK",layer:"CENTRAL"});
  return {
    runtime,
    status(){return {runtime:runtime.status(),officialRuntime:"worddark/runtime/world"};}
  };
}

export function worldStatus(world){
  return world?.status?.()||{runtime:world?.runtime?.status?.()||null};
}
