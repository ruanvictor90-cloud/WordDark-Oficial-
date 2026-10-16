# WordDark — Registro de auditoria e correções isoladas

**Branch:** `finalize/worddark-2026-10-15`  
**Base de referência:** `main`  
**Regra:** não integrar nem publicar sem aprovação explícita.

## Correções aplicadas nesta branch

### 1. Barreira de ambientes — fail-closed
Arquivo: `worddark/runtime/world/core/environment-guard.js`

A barreira agora bloqueia:
- operação ausente ou inválida;
- ambiente diferente de `TEST` e `PROD`;
- ambiente não cadastrado ou sem função verificável de estado ativo;
- ambiente bloqueado;
- produção sem aprovação específica;
- exceção durante a verificação da aprovação de produção.

O fluxo aprovado de TEST permanece disponível quando o ambiente está cadastrado e ativo. PROD continua exigindo aprovação explícita.

Testes ampliados em `environment-guard.test.js` para os cenários acima. Uma verificação isolada em harness local passou (`environment-guard.test: OK`). Isso não substitui a execução da suíte completa no repositório.

### 2. Central de conexão — privilégio explícito para publicação
Arquivos:
- `worddark/runtime/world/core/connections/connection-gateway.js`
- `worddark/runtime/world/core/connections/connection-gateway.test.js`

A autorização do gateway exigia uma capacidade traduzida por alias: `CONTENT_PUBLISH` era reduzida a `CONTENT_ROUTE`. Isso poderia permitir publicação quando a conta tivesse apenas permissão de roteamento. O gateway agora verifica a capacidade solicitada exata; possuir `CONTENT_ROUTE` não concede automaticamente `CONTENT_PUBLISH`.

Foi adicionado um teste de regressão com uma conta que possui apenas `CONTENT_ROUTE`, esperando `CAPABILITY_NOT_GRANTED` para uma solicitação de publicação.

**Status do teste de regressão do gateway:** alteração registrada; execução pendente no ambiente completo.

## Commits desta rodada

- Plano de finalização: `8a5c81c0b19d17e3236ed9014085940776d9a694`
- Barreira de ambientes: `d56d7e7fc267a5194191607898d862fc4e8c27d9`
- Testes da barreira: `e240b5d9e6885c8915e0cba7bbf337e713488add`
- Capacidade explícita no gateway: `9b41d5aa7a3108f1b315443574cae89b5fdd00ce`
- Teste de regressão de publicação: `8afbdc42541e0c4147c06d6e238410ecc93f65c6`

## Pendências antes de considerar o WordDark finalizado

1. Executar `npm test` integralmente a partir desta branch e registrar o resultado real.
2. Verificar se todos os testes de integração do Core usam o guard de ambientes e a central de conexão canônica.
3. Testar o ciclo de operação de ponta a ponta: solicitação, validação, autorização, rota, execução, validação do resultado e registro.
4. Confirmar bloqueio de chamadas externas em TEST e a aprovação explícita em PROD.
5. Auditar o armazenamento de credenciais e confirmar que segredos reais nunca são persistidos em armazenamento do navegador.
6. Verificar navegação e persistência de cada aplicativo sem reformular as interfaces nesta etapa.
7. Documentar o que é funcional localmente, simulado ou realmente conectado.
8. Manter esta branch isolada até revisão e aprovação explícitas.

## Limites do relatório

Este registro não declara a suíte completa aprovada, não declara conectores reais ativos e não autoriza merge para `main`. As correções foram feitas na branch de finalização isolada.


## Auditoria complementar — fluxo Core → Céu → conexões (2026-10-15)

### Achado WD-AUD-003 — contrato síncrono/assíncrono não está explícito

Arquivos inspecionados:
- `worddark/runtime/world/core/operation-engine.js`
- `worddark/runtime/world/core/communication.js`
- `worddark/runtime/world/core/operation-coordinator.js`
- `worddark/runtime/world/core/production-engine.js`
- `worddark/runtime/world/sky/darkfactory/core/operation-bridge.js`
- `worddark/runtime/world/sky/darkfactory/core/content-factory.js`

O Operation Engine chama `route(operation)` e `execute(operation)` sem `await`. O Communication Bus e o Operation Coordinator também trabalham com retornos síncronos. Em paralelo, a Dark Factory expõe `async executeFromModule()` e os testes de integração fornecem módulos assíncronos. É necessário estabelecer e testar o contrato real do executor antes de alterar a cadeia: uma Promise não tratada pode ser interpretada como falha mesmo que o trabalho continue em segundo plano, ou pode deixar o ciclo sem uma confirmação válida.

**Risco:** estados de operação/produção inconsistentes e falta de correspondência entre resultado reportado e efeito real. Não foi afirmado que há publicação real indevida; esse comportamento ainda precisa de teste reproduzível.

**Ação recomendada:** adicionar teste de integração com executor que retorne Promise resolvida e Promise rejeitada; definir um único contrato (síncrono ou assíncrono) e propagar o resultado consistentemente por Operation Engine → Coordinator → Production Engine → Operation Center. Se a cadeia for convertida para async, atualizar os chamadores e testes que hoje esperam resultados imediatos. Não aplicar uma correção parcial só no Engine.

**Status:** achado registrado; correção pendente para evitar uma alteração transversal sem validação.

### Achado WD-AUD-004 — persistência OAuth e registro operacional ainda são etapas separadas

Arquivos inspecionados:
- `worddark/bridge/google-oauth/connection-store.js`
- `worddark/runtime/world/core/connections/connection-registry.js`
- `worddark/runtime/world/core/connections/connection-gateway.js`
- `worddark/runtime/world/core/connections/index.html`

O backend OAuth persiste metadados e o pacote de tokens criptografado via KMS/Firestore. Já o registry usado pelo gateway mantém metadados em storage do navegador e credenciais de runtime em um Map em memória. A interface indica corretamente que salvar a conexão não significa ativação operacional.

**Risco/limite:** não há, nos arquivos inspecionados, uma ponte demonstrada que carregue a conexão persistida no backend para o registry de runtime e faça a gestão de credenciais no servidor. Portanto, a autorização Google e a persistência não bastam para afirmar que o gateway consegue executar uma chamada externa real.

**Ação recomendada:** manter estado como PERSISTED/PENDING até existir endpoint autenticado de ativação; implementar o carregamento de metadados e credenciais somente no servidor; garantir revogação, expiração, escopo e capacidade exata; testar com adapter simulado antes de ativar chamadas reais.

**Status:** achado registrado; sem alegação de conexão real ativa.

### Evidência de testes desta rodada

- O teste isolado do Environment Guard havia passado em harness local reconstruído; isso não equivale à suíte do repositório.
- O teste de regressão do gateway foi atualizado, mas não foi executado nesta rodada.
- `npm test` ainda não foi executado integralmente.
- Nenhuma alteração foi feita em `main`; nenhuma integração ou publicação foi realizada.
