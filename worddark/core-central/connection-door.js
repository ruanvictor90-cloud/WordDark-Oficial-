import {CONNECTION_DOOR,WORLD_LAYERS} from "./three-world-connection.js";

export class ConnectionDoor {
  constructor({veil,connectionSystem}={}) {
    if(!veil||!connectionSystem) throw new Error("CONNECTION_DOOR_COMPONENTS_REQUIRED");
    this.id=CONNECTION_DOOR.id;this.version=CONNECTION_DOOR.version;this.veil=veil;this.connectionSystem=connectionSystem;
  }
  requestCapability(input={}){return this.veil.gateway.request(input);}
  worldView(){return {door:CONNECTION_DOOR,worlds:WORLD_LAYERS,connections:this.connectionSystem.registry.list(),veil:this.veil.status()};}
  status(){return {id:this.id,version:this.version,role:CONNECTION_DOOR.role,veil:this.veil.status(),connections:this.connectionSystem.status()};}
}
