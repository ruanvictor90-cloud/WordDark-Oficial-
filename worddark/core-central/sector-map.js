export const SECTOR_RESPONSIBILITY = Object.freeze({
  CENTRAL_CONTROL: "CENTRAL_CONTROL",
  EXTERNAL_CONNECTIONS: "EXTERNAL_CONNECTIONS",
  GOVERNANCE: "GOVERNANCE",
  JUDICIARY: "JUDICIARY",
  WORLD_SCHOOL: "WORLD_SCHOOL",
  WORLD_MEMORY: "WORLD_MEMORY",
  SECURITY: "SECURITY",
  ROAD: "ROAD",
  OPERATIONS: "OPERATIONS",
  DARK_FACTORY: "DARK_FACTORY",
  MARKETING: "MARKETING",
  FINANCE: "FINANCE",
  TERRA: "TERRA"
});

export const WORLD_SECTOR_MAP = Object.freeze({
  CENTRAL_CONTROL: Object.freeze({id:"CENTRAL-CONTROL",responsibility:SECTOR_RESPONSIBILITY.CENTRAL_CONTROL,owns:["CENTRAL-AUTOMATION-CONTROLLER","CENTRAL-ORCHESTRATOR","POSTING-LINE","WORLD-SCHOOL"],rule:"coordena o mundo operacional e abriga a Escola; nao substitui governanca, conexoes ou execucao especializada"}),
  EXTERNAL_CONNECTIONS: Object.freeze({id:"EXTERNAL-CONNECTION-HUB",responsibility:SECTOR_RESPONSIBILITY.EXTERNAL_CONNECTIONS,owns:["PROVIDERS","CONNECTORS","AUTHORIZATION_STATE","HEALTH","EXTERNAL_ACCOUNTS"],rule:"toda conexao com o mundo externo pertence a esta central; setores nunca mantem conectores proprios"}),
  GOVERNANCE: Object.freeze({id:"WORLD-GOVERNANCE",responsibility:SECTOR_RESPONSIBILITY.GOVERNANCE,owns:["WORLD-COUNCIL","LAWS","TERMS","CONTRACTS","JUDICIARY","EXTERNAL_RULES"],rule:"responsavel pelas leis e julgamentos do mundo; composicao e cargos serao definidos depois"}),
  WORLD_MEMORY: Object.freeze({id:"WORLD-MEMORY",responsibility:SECTOR_RESPONSIBILITY.WORLD_MEMORY,owns:["LOCAL_LIBRARIES","CENTRAL_LIBRARY","KNOWLEDGE_HISTORY"],rule:"preserva a memoria mundial; nao orquestra e nao julga"}),
  SECURITY: Object.freeze({id:"WORLD-SECURITY",responsibility:SECTOR_RESPONSIBILITY.SECURITY,owns:["PERMISSIONS","EMERGENCY_STOP","AUDIT","CAPABILITY_POLICY"],rule:"protege acesso, poder e rastreabilidade"}),
  ROAD: Object.freeze({id:"WORDARK-ROAD",responsibility:SECTOR_RESPONSIBILITY.ROAD,owns:["ROUTING","DELIVERY","RETURN"],rule:"transporta pedidos e resultados; nao decide"}),
  OPERATIONS: Object.freeze({id:"WORDARK-OPERATIONS",responsibility:SECTOR_RESPONSIBILITY.OPERATIONS,owns:["RUNTIME","CONTRACTS","DEPENDENCIES","ROLLBACK","LIFECYCLE","OPERATION_REGISTRY"],rule:"infraestrutura operacional compartilhada"}),
  DARK_FACTORY: Object.freeze({id:"DARK-FACTORY",responsibility:SECTOR_RESPONSIBILITY.DARK_FACTORY,owns:["CONTENT_STUDIO","EDITING","SCRIPT","VISUAL","AUDIO","ASSEMBLY","QUALITY","CONTENT_OPTIMIZATION","CONTENT_RESTRUCTURE","CONTENT_REDO"],rule:"fabrica modular de conteudo; produz, edita, reestrutura, refaz, valida e entrega resultados, mas nao publica no mundo externo"}),
  MARKETING: Object.freeze({id:"MARKETING",responsibility:SECTOR_RESPONSIBILITY.MARKETING,owns:["CAMPAIGNS","DISTRIBUTION_STRATEGY","METRIC_INTERPRETATION","TREND_STRATEGY","CONTENT_CANDIDATES","PERFORMANCE_FEEDBACK"],rule:"estrategia, pesquisa de mercado, leitura de desempenho e direcionamento de conteudo; nao possui conectores externos"}),
  FINANCE: Object.freeze({id:"CENTRAL-FINANCE",responsibility:SECTOR_RESPONSIBILITY.FINANCE,owns:["FINANCE_OPERATIONS"],rule:"permanece modular e separado ate integracao definida"}),
  TERRA: Object.freeze({id:"TERRA",responsibility:SECTOR_RESPONSIBILITY.TERRA,owns:["NEEDS","GROUPS","OPERATIONS","ENVIRONMENTS","EXECUTOR_SECTORS"],rule:"gera necessidades, recebe resultados e representa as operacoes do mundo"})
});

export class WorldSectorRegistry {
  constructor({audit=null}={}) {
    this.id="WORLD-SECTOR-REGISTRY";
    this.audit=audit;
    this.sectors=new Map(Object.entries(WORLD_SECTOR_MAP));
  }
  get(id){ return structuredClone(this.sectors.get(id)||null); }
  list(){ return [...this.sectors.values()].map(structuredClone); }
  responsibilityFor(component){
    return this.list().find(sector=>sector.owns.includes(component))||null;
  }
  assertOwner(component,sectorId){
    const sector=this.sectors.get(sectorId);
    if(!sector||!sector.owns.includes(component)) throw new Error("SECTOR_RESPONSIBILITY_MISMATCH");
    return true;
  }
  status(){ return {id:this.id,total:this.sectors.size,sectors:this.list()}; }
}
