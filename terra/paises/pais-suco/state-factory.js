import { Estado, Cidade, Bairro } from "../../core/index.js";

class ChannelPermissions {
  constructor(){this.map=new Map();}
  grant(subject,capability){if(!subject||!capability)throw new Error("PERMISSION_INVALID");if(!this.map.has(subject))this.map.set(subject,new Set());this.map.get(subject).add(capability);return true;}
  revoke(subject,capability){this.map.get(subject)?.delete(capability);}
  can(subject,capability){return !!this.map.get(subject)?.has(capability);}
  list(subject){return [...(this.map.get(subject)||[])];}
}

const CONFIGS={
  SUCOCAST:{name:"SucoCast",description:"Canal geral e piloto inicial.",identity:"PAIS-SUCO/SUCOCAST"},
  SUCOGEEK:{name:"SucoGeek",description:"Conteúdo geek, anime e jogos.",identity:"PAIS-SUCO/SUCOGEEK"},
  SUCOCOMED:{name:"SucoComed",description:"Conteúdo de humor e entretenimento.",identity:"PAIS-SUCO/SUCOCOMED"},
  SUCOEMPREENDIMENTO:{name:"SucoEmpreendimento",description:"Conteúdo sobre empreendedorismo, negócios, gestão, dinheiro e construção de projetos.",identity:"PAIS-SUCO/SUCOEMPREENDIMENTO"}
};

export function createSucoState({id,name,countryId="PAIS-SUCO",description,identity}={}) {
  const key=id||name?.toUpperCase().replace(/[^A-Z0-9]+/g,"");
  const cfg=CONFIGS[key]||{name:name||key,description:description||"",identity:identity||key};
  const stateId=key; const cityId=`${stateId}-CIDADE`;
  const bairro=new Bairro({id:`${stateId}-BAIRRO`,name:"Bairro",stateId,cityId});
  const city=new Cidade({id:cityId,name:`${cfg.name} Cidade`,countryId,stateId,bairro,gateId:`${cityId}-GATE`});
  city.permissions=new ChannelPermissions();
  city.channel={id:stateId,name:cfg.name,identity:cfg.identity,description:description||cfg.description};
  return new Estado({id:stateId,name:cfg.name,countryId,city,identity:identity||cfg.identity,description:description||cfg.description});
}
