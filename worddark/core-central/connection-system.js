import {ConnectionRegistry} from "./connection-registry.js";
import {ConnectionPolicy,CONNECTION_ACCESS} from "./connection-policy.js";
import {InformationBoundary} from "./information-boundary.js";
import {ConnectionWorldBridge} from "./connection-world-bridge.js";
import {CONNECTION_PROVIDERS} from "./connection-providers.js";
import {createVeilSystem} from "../veu/veil-system.js";
import {ConnectionDoor} from "./connection-door.js";
import {threeWorldStatus} from "./three-world-connection.js";

export function createConnectionSystem({audit=null,permissionManager=null,centralManager=null,accountManager=null,router=null}={}) {
  const registry=new ConnectionRegistry({audit});
  for(const provider of CONNECTION_PROVIDERS) registry.registerProvider(provider);

  const policy=new ConnectionPolicy({permissionManager,audit});
  for(const provider of CONNECTION_PROVIDERS) {
    policy.set(provider.id,{
      allowedCapabilities:["IDENTITY_READ","PROFILE_READ","CONTENT_READ","ANALYTICS_READ","MEDIA_READ","STORAGE_READ"],
      worldAccess:CONNECTION_ACCESS.WORLD_READ_ONLY,
      requiresApproval:false
    });
  }

  policy.set("GOOGLE",{
    allowedCapabilities:["IDENTITY_READ","PROFILE_READ","CONTENT_READ","CONTENT_CREATE","CONTENT_UPDATE","CONTENT_PUBLISH","MEDIA_UPLOAD","MEDIA_READ","ANALYTICS_READ","STORAGE_READ","STORAGE_WRITE"],
    worldAccess:CONNECTION_ACCESS.WORLD_OPERATION,
    requiresApproval:true
  });

  const boundary=new InformationBoundary({registry,policy,audit});
  const bridge=new ConnectionWorldBridge({boundary,centralManager,accountManager,router});

  const system={registry,policy,boundary,bridge,veil:null,door:null,status(){
    return {
      registry:registry.status(),
      boundary:boundary.status(),
      bridge:bridge.status(),
      veil:system.veil?.status?.()||null,
      door:system.door?.status?.()||null
    };
  }};

  system.veil=createVeilSystem({audit,connectionSystem:system});
  system.door=new ConnectionDoor({veil:system.veil,connectionSystem:system});
  return system;
}

export {threeWorldStatus};
