import { createSucoCastState } from "./estados/sucocast/index.js";
export class PaisSuco {
 constructor({id="PAIS-SUCO",name="País Suco"}={}){this.id=id;this.name=name;this.type="PAIS";this.layer="TERRA";this.states=new Map();this.registerState(createSucoCastState({countryId:id}));}
 registerState(state){if(!state?.id)throw new Error("STATE_INVALID");this.states.set(state.id,state);return state;}
 getState(id){return this.states.get(id)||null;}
 status(){return {id:this.id,name:this.name,type:this.type,states:[...this.states.values()].map(x=>x.status())};}
}
export function createPaisSuco(options={}){return new PaisSuco(options);}
