import { Pais } from "../../core/index.js";
import { createSucoCastState } from "./estados/sucocast/index.js";
import { createSucoGeekState } from "./estados/sucogeek/index.js";
import { createSucoComedState } from "./estados/sucocomed/index.js";
import { createSucoFactorState } from "./estados/sucofactor/index.js";

export class PaisSuco extends Pais {
  constructor({id="PAIS-SUCO",name="País Suco"}={}) {
    super({id,name,description:"Cliente/ecossistema que utiliza o WordDark como infraestrutura."});
    this.registerState(createSucoCastState({countryId:id}));
    this.registerState(createSucoGeekState({countryId:id}));
    this.registerState(createSucoComedState({countryId:id}));
    this.registerState(createSucoFactorState({countryId:id}));
  }
}
export function createPaisSuco(options={}){return new PaisSuco(options);}
