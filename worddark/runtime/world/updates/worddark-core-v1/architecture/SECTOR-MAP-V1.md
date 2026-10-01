# WordDark Core V1 — Mapa de Setores

| Setor | Arquivos principais | Função |
|---|---|---|
| identity | id.js, entities.js, entity-registry.js | identidade e entidades |
| access | permissions.js, context.js | permissões e contexto |
| gates | gate.js | entrada e encaminhamento |
| operations | operation.js, operation-package.js | trabalho rastreável |
| routing | route.js, service.js | rotas e execução |
| connectors | connector.js | plataformas externas |
| recovery | error-recovery.js | erro e recuperação |
| history | versioning.js, inbox.js | histórico e pendências |
| results | result.js | saída da operação |
| runtime | runtime.js | composição ponta a ponta |
| tests | core-contracts.test.js, integration.test.js | validação |

Transplante: SETOR → TESTES → REVISÃO → AUTORIZAÇÃO → TRANSPLANTE.
O código central recebe setores, não um pacote monolítico.
