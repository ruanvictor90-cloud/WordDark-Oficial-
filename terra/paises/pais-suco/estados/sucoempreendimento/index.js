import { createSucoState } from "../../state-factory.js";
export class SucoEmpreendimentoState {
  constructor({countryId="PAIS-SUCO"}={}) {
    Object.assign(this,createSucoState({id:"SUCOEMPREENDIMENTO",countryId}));
  }
}
export function createSucoEmpreendimentoState(options={}){return new SucoEmpreendimentoState(options);}
