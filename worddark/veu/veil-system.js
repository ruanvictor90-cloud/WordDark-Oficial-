import {VeilRegistry} from "./veil-registry.js";
import {VeilCapabilityGateway} from "./veil-capability-gateway.js";

const ZONES=[
  ["IDENTITY","Identidade e acesso"],
  ["OAUTH","Autorização OAuth"],
  ["CREDENTIAL_VAULT","Cofre de credenciais"],
  ["TOKEN_SESSIONS","Tokens e sessões"],
  ["CONNECTIONS","Conexões externas"],
  ["CAPABILITIES","Capacidades autorizadas"],
  ["INGRESS","Entrada externa"],
  ["EGRESS","Saída externa"],
  ["REVOCATION","Revogação"],
  ["ROTATION","Rotação de credenciais"],
  ["AUDIT","Auditoria"],
  ["PRIVACY","Privacidade"],
  ["RECOVERY","Recuperação"],
  ["EMERGENCY","Emergência"],
  ["INTEGRITY","Integridade"],
  ["WORLD_BRIDGE","Ponte com o Mundo"]
];

export function createVeilSystem({audit=null,connectionSystem=null}={}){
  const registry=new VeilRegistry({audit});
  for(const [id,name] of ZONES)registry.registerZone({id,name,responsibility:name});
  const gateway=new VeilCapabilityGateway({registry,connectionSystem,audit});
  return{registry,gateway,status(){return{registry:registry.status(),gateway:gateway.status()};}};
}
