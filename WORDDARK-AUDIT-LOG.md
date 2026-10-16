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
