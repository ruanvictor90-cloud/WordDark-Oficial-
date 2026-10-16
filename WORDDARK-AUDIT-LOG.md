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


### Achado WD-AUD-005 — registro aceita status pendente como se estivesse conectado (corrigido)

Arquivos:
- `worddark/runtime/world/core/connections/connection-registry.js`
- `worddark/runtime/world/core/connections/connection-gateway.test.js`

O registry verificava se a conta existia e possuía a capacidade/credencial de runtime, mas não exigia que o registro tivesse `status === "CONNECTED"`. Uma conta `PENDING` com uma credencial residual poderia passar pela autorização local. Agora o registry recusa ausência de registro ou status diferente de CONNECTED como `ACCOUNT_NOT_CONNECTED`. Foi acrescentado teste para uma conta PENDING com credencial presente.

**Status:** correção e teste registrados; execução do teste pendente.

### Achado WD-AUD-006 — adapter sem confirmação explícita podia ser reportado como sucesso (corrigido)

Arquivo: `worddark/runtime/world/core/connections/connection-gateway.js`

O gateway tratava qualquer retorno diferente de `{success:false}`, inclusive `undefined`, como sucesso. Agora exige que o adapter retorne explicitamente `success: true`; retorno ausente ou ambíguo vira `EXTERNAL_EXECUTION_FAILED`. Foi adicionado teste de regressão com adapter que retorna `undefined`.

**Status:** correção e teste registrados; execução do teste pendente.

### Commits complementares

- Registry exige status CONNECTED: `198f5985d888a1c5c76db76c19fcfc8f3589b42f`
- Gateway exige sucesso explícito do adapter: `41c75c3f6117f2b45cae1379c77f2938a100564f`
- Testes de conta PENDING e retorno inválido: `8801f89f77949a20b423b2233e7cee2a9f846121`

Essas correções reforçam a autorização local, mas não resolvem a ponte servidor-a-servidor OAuth descrita no WD-AUD-004 e não comprovam que chamadas externas reais estejam habilitadas.


### Achado WD-AUD-007 — autoridade raiz padrão ainda apontava para Ruan (corrigido)

Arquivos:
- `worddark/runtime/world/security/authority-policy.js`
- `worddark/runtime/world/security/security-core.test.js`

O padrão do núcleo de segurança usava `ADM-RUAN` como autoridade raiz, misturando a identidade do app pessoal com a raiz de autoridade do WordDark. O padrão agora é `WORDDARK-ROOT`; o teste verifica que a autoridade raiz padrão não é a identidade Ruan. Testes que criam explicitamente uma política de autoridade com outra raiz continuam podendo fazê-lo para cenários isolados.

**Status:** correção e teste registrados; execução pendente.

Commit: `5a5d986e57d6818062716d7f63651160837d87bc`; teste: `bf39702caff069aab63987c649b63000343a621f`.

### Achado WD-AUD-008 — liberação da parada de emergência não valida autoridade (bloqueador)

Arquivo: `worddark/runtime/world/core/emergency-stop-manager.js`; chamada de UI identificada em `worddark/runtime/world/sky/darkfactory/index.html`.

O método `release(operationId, {requesterId, reason})` libera uma parada apenas com o identificador da operação e não consulta uma política de autorização. A UI da Dark Factory o chama com `requesterId: "UI-DF"`, o que não demonstra aprovação de uma autoridade responsável. Isso enfraquece a parada global: um controle de interface pode solicitar a liberação sem prova de autorização.

**Correção necessária:** a liberação deve exigir autorização explícita do serviço/política de segurança (fail-closed), registrar a referência da aprovação e não tratar o identificador informado pelo cliente como prova. Atualizar testes e UI para representar um pedido de liberação autorizado; sem serviço de autorização configurado, manter a parada ativa.

**Status:** bloqueador aberto; não foi alterado ainda para evitar quebrar a UI sem antes conectar o contrato de autorização de forma coerente.

### Evidência e limites atualizados

O clone do repositório para executar os testes não foi possível neste ambiente por indisponibilidade de resolução de `github.com`. Portanto, nenhum teste novo da conexão ou da política de autoridade foi executado aqui; todos permanecem como pendentes de execução real. A suíte completa segue pendente.


### Achado WD-AUD-008 — liberação da parada de emergência protegida (correção aplicada; validação pendente)

Arquivos:
- `worddark/runtime/world/core/emergency-stop-manager.js`
- `worddark/runtime/world/core/emergency-stop.test.js`
- `worddark/runtime/world/sky/darkfactory/index.html`

A liberação agora falha de forma fechada se não houver callback de autorização, se o callback negar/lançar exceção, ou se a aprovação não trouxer uma referência auditável. Tentativas negadas são registradas no log de auditoria; uma parada já liberada não é liberada novamente. A UI não é tratada como autoridade: sua tentativa com `UI-DF` será negada enquanto não existir política conectada.

Os testes agora cobrem ausência de política, negação, autorização com referência de aprovação e exceção da política. **Ainda não executados na suíte real**, pois o clone local segue indisponível; a alteração precisa ser validada com os testes do repositório e com o serviço real de autorização antes de aceite.

**Nota operacional:** esta correção prioriza segurança e mantém o stop ativo por padrão. A interface não consegue liberar uma parada legitimamente até que a política de autoridade seja injetada na composição do runtime; isso é intencional, não uma falha a contornar por requester fixo.
