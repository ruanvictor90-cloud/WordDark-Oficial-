# Contrato de controle — Ruan Hub ↔ WordDark Core

## Propósito

O Ruan Hub é o painel superior pertencente ao Ruan. Este contrato define como poderá solicitar operações e consultar o estado do mundo sem abrir cada setor. O Hub não é o Core e não deve tomar decisões de autorização localmente.

## Estado atual

O contrato server-side está implementado em `ruan-hub-control-adapter.js`, mas permanece **desligado por padrão**. Não existe rota HTTP ativa para ele e nenhuma sessão de operador real é conectada por este módulo. O Hub de navegador apenas cria rascunhos locais.

## Envelope de entrada

- `requestId`: identificador estável para idempotência.
- `source`: valor literal `RUAN_HUB`.
- `destination`: valor literal `WORDDARK`.
- `action`: `SUBMIT_NEED`, `REQUEST_STATUS`, `CAPABILITY_DISCOVERY` ou `LIST_OPERATIONS`.
- `need` / `intent`: texto limitado a 4.000 caracteres para submissão.
- `limit`: opcional, limitado pelo adaptador a 1–100 para listagem.

A identidade confiável não pertence ao envelope. Ela deve ser injetada pelo backend em `trustedContext`, com `authenticated=true`, `actorId` e `sessionId`. Valores de identidade enviados pelo navegador nunca são autoridade.

## Ações

| Ação | Efeito |
|---|---|
| `SUBMIT_NEED` | Exige autorização e aprovação explícita; usa o Core com ambiente fixado em `TEST`; requer idempotência atômica. |
| `REQUEST_STATUS` | Retorna o estado geral exposto pelo runtime, não uma lista inventada de operações. |
| `LIST_OPERATIONS` | Consulta uma função de leitura autorizada e devolve apenas campos allowlisted; omite payloads, tokens e campos arbitrários. |
| `CAPABILITY_DISCOVERY` | Devolve apenas capacidades públicas expostas pelo catálogo injetado. |

## Garantias e pré-requisitos

- Default-deny: desligado, sem identidade, sem autorização, sem aprovação exigida, sem auditoria ou sem idempotência para submissão, não há operação.
- Cada pedido passa por autorização antes da ação; a decisão de autorização é auditada.
- A submissão é envolvida por `idempotencyStore.executeOnce(key, callback)`. O armazenamento real deve garantir atomicidade e durabilidade entre instâncias. Um `Map` de teste não atende produção.
- O Core fixa `environment: TEST` no contrato inicial.
- A resposta da listagem é reconstruída por allowlist; não serializa objetos de operação inteiros.
- A ponte não cria rota, não habilita rede externa e não autoriza publicação, pagamentos ou movimentos financeiros reais.

## Pendências para ativação

1. Implementar identidade de sessão confiável no backend e conectar a política de permissões do Core.
2. Implementar aprovação consultada de uma fonte confiável, sem confiar em `approvalId` fornecido pelo cliente.
3. Implementar auditoria persistente, protegida e com retenção.
4. Implementar idempotência atômica persistente e comportamento de recuperação para submissão cujo resultado seja incerto.
5. Implementar serviço HTTP/backend com autenticação, autorização, rate limit, proteção contra replay, validação de origem/CSRF e segredos no servidor.
6. Conectar consulta de operações ao registro real do Core, validando escopo por operador.
7. Validar tudo em staging, incluindo testes de concorrência e falhas.
8. Só então discutir habilitação de produção com autorização explícita.

## Testes

`ruan-hub-control-adapter.test.js` cobre modo desligado, identidade confiável, autorização, aprovação, auditoria, idempotência, listagem sanitizada, status e descoberta de capacidades.
