# Auditoria de consolidação do Core atual

**Escopo:** reforçar a camada operacional existente sem importar a arquitetura visual antiga. Este documento registra decisões de consolidação; não ativa integrações externas.

## Fonte única de execução

- **Core ativo:** `worddark/runtime/world/core/`.
- **Legado de referência:** `worddark/core-central/`. Permanece fora da execução e da suíte padrão.
- **Ruan:** privado e soberano, fora do mundo WordDark.
- **WordDark:** coordenação, contratos, roteamento, segurança, auditoria e conexões.
- **Céu:** execução de capacidades, incluindo Dark Factory.
- **Terra:** origem das necessidades, pedidos e operações comerciais.

Não criar segundo runtime, segundo orquestrador global, nova raiz de permissões ou uma interface herdada para acomodar código legado.

## Consolidação aplicada nesta revisão

### Registro operacional

O `operation-registry.js` ativo agora isola snapshots e eventos por cópia defensiva:
- dados recebidos são copiados antes de serem guardados;
- `get`, `getEvents` e `list` devolvem cópias;
- mutações em objetos devolvidos não devem alterar o histórico interno;
- os registros enviados às bibliotecas recebem cópias, evitando compartilhar referências mutáveis.

A suíte de teste cobre essa fronteira. Isso melhora a integridade do histórico em memória, mas **não transforma o registro em armazenamento durável** nem substitui testes de integração com bibliotecas.

## Mapa de responsabilidades ativo

| Capacidade | Camada canônica | Regra de integração |
| --- | --- | --- |
| Criar/executar operações | `operation.js`, `operation-engine.js` | Um contrato e um motor ativo; sem orquestrador legado paralelo |
| Coordenação/roteamento | `operation-coordinator.js`, `operation-center.js`, `road.js`, `communication.js` | Resolver destino e encaminhar pelo fluxo atual |
| Histórico e auditoria | `operation-registry.js`, bibliotecas e memória operacional | Detalhes no setor; índice/resumo na camada central |
| Permissões | `permissions.js`, `permission-set.js` conforme o contrato já usado | Não fundir interfaces diferentes sem mapear consumidores e testes |
| Segurança ambiental | `environment-guard.js`, `emergency-stop-manager.js`, módulos de segurança | TEST/PROD explícitos; produção exige aprovação configurada |
| Conexões externas | `core/connections/connection-gateway.js` e contratos associados | Sem chamada real sem conta, capacidade, autorização e adapter registrado |
| Recuperação/diagnóstico | `error-recovery.js`, `operation-diagnostics.js` e suíte atual | Reutilizar comportamento testado; snapshots/undo do legado não são rollback durável |
| Produção de conteúdo | `sky/darkfactory/` e contratos de operação atuais | Céu executa; políticas por plataforma e revisão humana permanecem explícitas |
| Operações comerciais | `earth/commercial-engine.js` e contratos atuais | Terra origina necessidades; não ativar pagamentos ou compromissos externos sem controles |

## Achados do legado — não transplantar diretamente

1. **Orquestração, registro e rollback:** sobrepõem capacidades atuais. O rollback legado guarda callbacks e snapshots em memória; não é um mecanismo persistente de reversão. Extrair requisitos/testes, não copiar o orquestrador inteiro.
2. **Política de autonomia:** contém conceitos úteis de ações permitidas, aprovação e parada de emergência, mas deve ser traduzida para permissões, guardas e parada já ativos, sem uma segunda política global.
3. **Fronteira de informação:** o código antigo normaliza metadados e clona o payload, mas não faz redação de campos sensíveis dentro do payload. Não tratar essa cópia como sanitização de segredos.
4. **Pilha de conexões:** há um gateway ativo e contratos atuais. A camada antiga usa valores de ambiente diferentes (`PRODUCTION` em alguns pontos contra `TEST/PROD` no Core atual) e modelos próprios; exige adaptação e testes antes de reutilização.
5. **Canais/conteúdo:** comparar os estados antigos com o ciclo atual de operação, decisão de conteúdo, Dark Factory e Central Social. Manter autorização humana e não habilitar publicação externa por herança.
6. **Contas e login:** não conectar gerenciadores antigos à identidade/autorização atuais sem revisão de fronteiras, credenciais e responsabilidades.
7. **Governança, escola e mapas:** extrair regras e conhecimento validados para os setores/bibliotecas atuais; não restaurar páginas nem navegação antiga.
8. **Modelos de permissão:** existe mais de uma implementação com nome/contratos parecidos. O ponto de entrada ativo exporta `permissions.js`; verificar consumidores de `permission-set.js` antes de remover, adaptar ou declarar uma implementação obsoleta.

## Critérios de promoção

Um item sai do CreationDark somente quando:
1. tem destino e responsável claros;
2. tem contrato de entrada/saída e dependências mapeados;
3. não cria um segundo Core nem duplica autoridade;
4. tem testes cobrindo sucesso, bloqueio, erro e fronteiras de dados relevantes;
5. mantém a interface atual ou não altera interface alguma;
6. passa a suíte de testes e revisão do diff;
7. só ativa produção/conexões externas após autorização explícita e configuração segura.

## Pendências de validação

- Executar `npm test` integral no ambiente de CI após esta revisão.
- Confirmar que a nova cobertura de isolamento do registro passa.
- Continuar a comparação de permissões, conexões, canais e contas por comportamento, não por semelhança de nomes.
- Fazer teste visual/manual do CreationDark e do Hub; inventário local não é sincronização entre dispositivos.

**Estado:** revisão operacional parcial aplicada; não declarar consolidação completa nem publicação oficial até os testes e a revisão final.
