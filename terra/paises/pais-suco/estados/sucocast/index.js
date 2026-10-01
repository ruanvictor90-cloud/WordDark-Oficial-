import { SucoCastCity } from "./cidade/index.js";
export class SucoCastState {constructor({id="SUCOCAST",countryId="PAIS-SUCO",name="SucoCast"}={}){this.id=id;this.type="ESTADO";this.countryId=countryId;this.name=name;this.city=new SucoCastCity({stateId:id,countryId});this.responsibility="SECTOR";this.status="ACTIVE";}status(){return {id:this.id,type:this.type,countryId:this.countryId,city:this.city.status(),responsibility:this.responsibility};}}
export function createSucoCastState(options={}){return new SucoCastState(options);}
