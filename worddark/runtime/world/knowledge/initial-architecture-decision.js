const { WordDarkKnowledgeRecord } = typeof module !== "undefined" && module.exports
  ? require("../contracts/knowledge.js")
  : window.WordDarkKnowledge;

/*
 * Registro arquitetural canônico do WordDark.
 *
 * Este registro representa a arquitetura construída e refinada nas conversas
 * de desenvolvimento do projeto e posteriormente formalizada no repositório.
 * As conversas são a origem do desenho; os documentos e módulos do repositório
 * são as evidências materializadas dessa arquitetura.
 */

const firstArchitecturalDecision = new WordDarkKnowledgeRecord({
  knowledgeId: "WD-K-ARCH-001",
  type: WordDarkKnowledgeRecord.TYPES.ARCHITECTURE_DECISION,
  title: "Arquitetura WordDark — separação entre Céu, Terra, execução e conhecimento",
  summary:
    "A arquitetura WordDark é construída de forma modular e evolutiva. Céu fornece infraestrutura, serviços e execução compartilhada. Terra cria necessidades, define regras de negócio e mantém a responsabilidade sobre seus resultados e distribuição. A Dark Factory pertence ao Céu e funciona como serviço compartilhado de produção: recebe requerimentos autorizados, cria, edita, processa e valida conteúdo, mas não decide o destino ou a publicação. Rodovia/Comunicação transporta operações entre unidades. Identidade, acesso e segurança controlam quem pode agir. Operações tornam o trabalho rastreável. Bibliotecas preservam memória, histórico e conhecimento, com a Biblioteca Central como arquivo permanente. Esta arquitetura representa as decisões e conceitos desenvolvidos nos chats de construção do WordDark e continuamente formalizados no código e na documentação.",
  sourceId: "worddark-development-chats",
  sourceType: "ARCHITECTURE",
  status: WordDarkKnowledgeRecord.STATUS.VALIDATED,
  version: "1.1.0",
  tags: [
    "worddark",
    "architecture",
    "ceu",
    "terra",
    "dark-factory",
    "rodovia",
    "identity",
    "access",
    "security",
    "operation",
    "local-library",
    "central-library",
    "knowledge"
  ],
  evidence: [
    "Conversas de desenvolvimento do projeto WordDark",
    "world/README.md",
    "world/architecture/OPERATION.md",
    "docs/DEVELOPERS.md",
    "world/contracts/identity.js",
    "world/contracts/access.js",
    "world/contracts/operation.js",
    "world/security/security-manager.js",
    "world/core/operation-engine.js",
    "world/core/operation-registry.js",
    "world/library/README.md",
    "world/library/local-library.js",
    "world/library/central-library.js",
    "world/contracts/knowledge.js",
    "world/sky/darkfactory/README.md",
    "world/sky/darkfactory/core/operation-bridge.js",
    "world/earth/juice-country/sucocast/README.md"
  ],
  createdAt: "2026-09-28T00:55:00-03:00",
  validatedAt: "2026-09-28T00:55:00-03:00",
  metadata: {
    decision: "canonical_worddark_architecture",
    origin: "chat_development",
    rule: "A Fábrica produz. O País/Estado decide o que precisa e para onde vai.",
    architecturePrinciple:
      "A conversa pode gerar a proposta arquitetural; o registro, a documentação, os contratos e os testes transformam a proposta em parte verificável do sistema.",
    evolution:
      "Este registro é uma versão formal da arquitetura atual e pode receber novas versões conforme decisões futuras sejam validadas.",
    scope: "WORDDARK",
    permanence: "CENTRAL_KNOWLEDGE_CANDIDATE"
  }
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { firstArchitecturalDecision };
} else {
  window.WordDarkInitialKnowledge = { firstArchitecturalDecision };
}
