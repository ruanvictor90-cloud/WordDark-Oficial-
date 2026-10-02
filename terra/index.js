import { Terra } from "./core/index.js";
export function createTerra({runtime=null}={}){const terra=new Terra();if(runtime)terra.attachRuntime(runtime);return{terra};}