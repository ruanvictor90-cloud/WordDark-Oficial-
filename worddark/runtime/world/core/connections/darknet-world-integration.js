import {createWorldBridge} from "../../../../../darknet/darknet-world-bridge.js";
import {createDarknetWorldAdapter} from "./darknet-world-adapter.js";

/**
 * Backend composition root for the in-process Darknet ↔ WordDark contract.
 * Off by default; callers must provide trusted authorization and durable audit.
 */
export function createDarknetWorldIntegration({
  operationCenter=null,capabilityCatalog=null,authorizeRequest=async()=>({allowed:false}),
  audit=async()=>{},enabled=false
}={}){
  const adapter=createDarknetWorldAdapter({
    operationCenter,capabilityCatalog,authorizeRequest,audit,enabled:enabled===true
  });
  const bridge=createWorldBridge({
    worldPort:adapter,enabled:enabled===true,authorizeRequest:async context=>{
      const decision=await authorizeRequest({...context,stage:"DARKNET_BRIDGE"});
      return decision;
    },audit
  });
  return Object.freeze({
    request:bridge.request,
    getStatus:()=>({enabled:enabled===true,transport:"in-process",network:false,bridge:bridge.getStatus(),adapter:adapter.getStatus()})
  });
}
