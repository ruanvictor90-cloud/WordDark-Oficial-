# Contrato Darknet ↔ WordDark

Darknet é uma central de acesso independente. Não é parte do Ruan, não substitui o WordDark e não recebe autoridade administrativa do mundo. A Central de Conexões permanece como fronteira externa governada pelo Core.

## Limites

- Darknet prepara solicitações e envelopes.
- WordDark autentica/autorização a solicitação, valida capacidade, registra auditoria e decide se a Central de Operações pode receber o pedido.
- Céu executa; Terra representa necessidades e operações externas.
- Nenhum token ou segredo de provedor atravessa o contrato Darknet.
- Não aceitar um campo de aprovação fornecido pelo cliente como prova de aprovação: a função de autorização deve resolver a aprovação numa fonte confiável.
- Default deny: sem porta, autorização ou auditoria, não há encaminhamento.
- Ambiente fixado em `TEST`; ações que publiquem ou modifiquem contas externas não fazem parte deste contrato inicial.

## Contrato v1

Campos obrigatórios: `requestId`, `source=DARKNET`, `destination=WORDDARK`, `sector` (`worddark`, `ceu`, `terra`), `action`, `payload` objeto. Ações iniciais: `CAPABILITY_DISCOVERY`, `REQUEST_OPERATION`, `REQUEST_STATUS`, `SUBMIT_NEED`.

O contrato é independente de transporte. `darknet-world-bridge.js` prepara o lado Darknet; `darknet-world-adapter.js` implementa o lado do WordDark. O transporte é uma porta in-process injetada, não uma rota HTTP.

## Ativação

A ponte é desativada por padrão em ambos os lados. A habilitação exige uma implementação backend confiável de `authorizeRequest`, auditoria persistente e injeção da porta. Uma flag de frontend não constitui autorização. A conexão externa com APIs/plugins permanece separada e desativada.

## Testes

`darknet/darknet-world-bridge.test.js` cobre modo desligado, encaminhamento autorizado, setor inválido, negação e falha de auditoria. `worddark/runtime/world/core/connections/darknet-world-adapter.test.js` cobre modo desligado, submissão em TEST, origem inválida, pedido incompleto, negação e descoberta de capacidades.


## Integração de conhecimento — montagem de backend

O fluxo de conhecimento usa `darknet/darknet-knowledge-runtime.js` e os adapters transacionais em `worddark/runtime/world/library/firestore-knowledge-adapters.js`. A identidade de serviço e as funções de autorização/auditoria são obrigatoriamente injetadas pelo backend; não usar dados de identidade recebidos diretamente do cliente. Consultas, revisão e leitura de pendências têm controles próprios.

A configuração do runtime permanece desligada por padrão. A ativação é recusada se faltar qualquer dependência exigida pelo relatório de prontidão. Testes de contrato com Firestore falso não substituem a validação de IAM, dados, APIs e sessão real em staging.
