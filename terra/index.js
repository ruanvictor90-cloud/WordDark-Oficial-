import { Terra } from "./core/index.js";
import { createPaisSuco } from "./paises/pais-suco/index.js";

export function createTerra({runtime=null}={}) {
  const terra=new Terra();
  const paisSuco=createPaisSuco();
  terra.registerCountry(paisSuco);
  if(runtime) terra.attachRuntime(runtime);
  return {terra,paisSuco};
}
