import {CONNECTION_DOOR,WORLD_LAYERS} from "./three-world-connection.js";

export const WORLD_ALIGNMENT_VERSION="2.0.0";
export const WORLD_STRUCTURE={
  ROOT:{id:"WORDDARK",name:"Mundo WordDark",role:"coordination_and_operation"},
  CENTRAL:{id:"CENTRAL",role:"knowledge_decision_and_orchestration"},
  RODOVIA:{id:"RODOVIA",role:"internal_transport_and_routing",visible:false},
  SKY:{id:"CEU",role:"solutions_and_production"},
  EARTH:{id:"TERRA",role:"needs_business_requests_and_external_operations"},
  FACTORY:{id:"DARK_FACTORY",role:"content_production"},
  MARKETING:{id:"MARKETING",role:"identity_channel_strategy_and_trends"},
  CONNECTION:{id:"CENTRAL-DE-CONEXAO",role:"three_world_gate"},
  VEIL:{id:"VEU",role:"security_privacy_identity_and_external_boundary"}
};
export const WORLD_RULES=[
  "WordDark does not administer the root of Área ADM.",
  "WordDark never receives raw secrets, OAuth codes, refresh tokens, passwords or private keys.",
  "External providers never enter WordDark directly; information crosses through the Veil.",
  "The Central de Conexão exposes capabilities and states, not credentials.",
  "Each capability may operate independently without rerunning unrelated sectors.",
  "Approval is required whenever policy marks an external action as controlled.",
  "The real-world interface exposes only the context and action appropriate to the current gate.",
  "The Veil is infrastructure, not a second World and not a public interface."
];
export function worldAlignment(){return {version:WORLD_ALIGNMENT_VERSION,worlds:WORLD_LAYERS,structure:WORLD_STRUCTURE,rules:WORLD_RULES,door:CONNECTION_DOOR};}
