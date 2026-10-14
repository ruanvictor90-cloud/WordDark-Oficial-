import {createConnectionSystem} from "./connection-system.js";

function assert(condition,message){if(!condition)throw new Error(message);}

export function runThreeWorldConnectionTests(){
  const system=createConnectionSystem();
  const view=system.door.worldView();

  assert(view.door.role==="THREE_WORLD_GATE","DOOR_ROLE_INVALID");
  assert(view.worlds.ADM.worldCanControl===false,"ADM_ROOT_BOUNDARY_INVALID");
  assert(view.worlds.WORDDARK.canControlWorld===false,"WORDDARK_AUTHORITY_INVALID");
  assert(view.worlds.EXTERNAL.canControlWorld===false,"EXTERNAL_AUTHORITY_INVALID");
  assert(system.veil.status().registry.count===16,"VEIL_ZONE_COUNT_INVALID");
  assert(view.veil.registry.count===16,"WORLD_VIEW_VEIL_COUNT_INVALID");

  return {ok:true,door:view.door.id,veilZones:view.veil.registry.count,providers:view.connections.length};
}
