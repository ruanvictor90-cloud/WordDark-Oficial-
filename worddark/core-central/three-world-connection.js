export const WORLD_LAYERS={
  ADM:{id:"ADM",name:"Área ADM",authority:"EXTERNAL_SOVEREIGN",canControlWorld:true,worldCanControl:false},
  WORDDARK:{id:"WORDDARK",name:"Mundo WordDark",authority:"OPERATIONAL",canControlWorld:false,worldCanControl:false},
  EXTERNAL:{id:"EXTERNAL",name:"Mundo Externo",authority:"PROVIDER_REAL_WORLD",canControlWorld:false,worldCanControl:false}
};

export const CONNECTION_DOOR={
  id:"CENTRAL-DE-CONEXAO",version:"2.0.0",role:"THREE_WORLD_GATE",
  route:"ADM ↔ VEIL ↔ WORDDARK ↔ VEIL ↔ EXTERNAL",
  directWorldToSecretAccess:false,directWorldToAdmRoot:false,directExternalToWorld:false,
  allowedTransitions:["ADM_TO_WORDDARK_CONTROLLED","ADM_TO_EXTERNAL_AUTHORIZATION","EXTERNAL_TO_WORDDARK_SANITIZED_INFORMATION","WORDDARK_TO_EXTERNAL_AUTHORIZED_CAPABILITY"]
};

export function threeWorldStatus({veil=null,connections=null}={}) {
  return {door:CONNECTION_DOOR,worlds:WORLD_LAYERS,veil:veil?.status?.()||null,connections:connections?.status?.()||null};
}
