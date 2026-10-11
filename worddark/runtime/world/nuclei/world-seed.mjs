export const WORDDARK_NUCLEI = Object.freeze([
  { id: "IDENTITY", status: "EXISTING_REVIEW", responsibility: "Identidade da operação e isolamento da Área ADM/Ruan." },
  { id: "ACCESS", status: "EXISTING_REVIEW", responsibility: "Permissões por identidade, capacidade, ação, ambiente e escopo." },
  { id: "GOVERNANCE", status: "FOUNDATION", responsibility: "Portão, decisões, aprovações e regras de progressão." },
  { id: "OPERATIONS", status: "EXISTING_COMPOSITION", responsibility: "Coordenar operações usando o motor operacional já existente." },
  { id: "COMMUNICATION", status: "EXISTING_ADAPTER", responsibility: "Eventos, mensagens, confirmações e retorno entre setores." },
  { id: "ROAD", status: "EXISTING_ADAPTER", responsibility: "Transportar mensagens por rotas permitidas; não autoriza nem executa." },
  { id: "REGISTRY", status: "EXISTING_ADAPTER", responsibility: "Registrar setores, capacidades, operações e histórico." },
  { id: "LIBRARY", status: "EXISTING_ADAPTER", responsibility: "Memória, documentos, versões e conhecimento validado." },
  { id: "SECURITY", status: "EXISTING_REVIEW", responsibility: "Fronteira, auditoria, redução de exposição e bloqueios seguros." },
  { id: "ENVIRONMENT", status: "EXISTING_REVIEW", responsibility: "Separar TEST e PROD e bloquear produção sem aprovação explícita." },
  { id: "EMERGENCY", status: "EXISTING_ADAPTER", responsibility: "Interromper uma operação inteira e exigir liberação explícita." },
  { id: "CONNECTORS", status: "INTEGRATION_REQUIRED", responsibility: "Expor capacidades externas sem expor tokens ou segredos." },
  { id: "RESULTS", status: "EXISTING_ADAPTER", responsibility: "Devolver estados, erros, artefatos e confirmação real de conclusão." },
  { id: "LEARNING", status: "EXISTING_ADAPTER", responsibility: "Transformar falhas em propostas de aprendizado sujeitas a validação." }
]);

export const INITIAL_SECTORS = Object.freeze([
  { sectorId: "world.operations", name: "Operações", domain: "CENTRAL", status: "ACTIVE", capabilities: ["operation.submit", "operation.inspect"], visibleApp: true, ownerNucleus: "OPERATIONS" },
  { sectorId: "world.approvals", name: "Aprovações", domain: "CENTRAL", status: "ACTIVE", capabilities: ["approval.request", "approval.decide"], visibleApp: true, ownerNucleus: "GOVERNANCE" },
  { sectorId: "world.bank", name: "Banco", domain: "CENTRAL", status: "PLANNED", capabilities: ["finance.read", "finance.record", "finance.plan"], visibleApp: true, ownerNucleus: "REGISTRY" },
  { sectorId: "world.library", name: "Biblioteca", domain: "CENTRAL", status: "ACTIVE", capabilities: ["knowledge.read", "knowledge.propose", "knowledge.validate"], visibleApp: true, ownerNucleus: "LIBRARY" },
  { sectorId: "world.security", name: "Segurança", domain: "CENTRAL", status: "ACTIVE", capabilities: ["security.inspect", "access.evaluate"], visibleApp: true, ownerNucleus: "SECURITY" },
  { sectorId: "world.marketing", name: "Marketing", domain: "SKY", status: "PLANNED", capabilities: ["marketing.plan", "marketing.analyze"], visibleApp: true, ownerNucleus: "OPERATIONS" },
  { sectorId: "world.darkfactory", name: "Dark Factory", domain: "SKY", status: "ACTIVE", capabilities: ["content.produce", "content.validate"], visibleApp: true, ownerNucleus: "OPERATIONS" },
  { sectorId: "world.channels", name: "Canais", domain: "EARTH", status: "PLANNED", capabilities: ["channels.inspect", "channels.publish"], visibleApp: true, ownerNucleus: "CONNECTORS" },
  { sectorId: "world.road", name: "Rodovia", domain: "INFRA", status: "ACTIVE", capabilities: ["transport.route"], visibleApp: false, ownerNucleus: "ROAD" },
  { sectorId: "world.veil", name: "Véu", domain: "INFRA", status: "ACTIVE", capabilities: ["security.boundary"], visibleApp: false, ownerNucleus: "SECURITY" }
]);
