import { createSucoState } from "../../state-factory.js";
export class SucoCastState {constructor({countryId="PAIS-SUCO"}={}){Object.assign(this,createSucoState({id:"SUCOCAST",countryId}));}}
export function createSucoCastState(options={}){return new SucoCastState(options);}
