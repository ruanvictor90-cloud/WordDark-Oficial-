# WordDark — VAL-001 — Primeiro circuito operacional integrado

Status: **VALIDADO**
Ambiente: **TEST**
Escopo: Operation → Security → Road → Communication → Dark Factory → Response → Registry → Libraries

## Evidência

A interface integrada do Núcleo foi executada e retornou `passed: true` e `status: COMPLETED`.

- Operation: `OP-MUMCUMQS-A4Q7`
- Origin: `world/earth/demo-city`
- Destination: `world/sky/darkfactory`
- Service: `content.produce`
- Executor: `DF-Content-Production-Executor`
- Messages: 2
- Receipts: 2
- Pending messages: 0
- Security decision: `AUTHORIZED`
- Local Library: operation snapshot + lifecycle events
- Central Library: permanent event archive
- Publication integrations requested by the Factory: none

## Circuito validado

```
CITY-DEMO
   ↓
IDENTITY / ACCESS
   ↓
OPERATION
   ↓
ROAD
   ↓
DARK FACTORY
   ↓
EXECUTOR
   ↓
RESPONSE
   ↓
ROAD
   ↓
CITY-DEMO
   ↓
REGISTRY
   ↓
LOCAL / CENTRAL LIBRARIES
```

## Critérios

1. Identidade reconhecida.
2. Acesso autorizado no ambiente TEST.
3. Operação criada e conduzida pelo lifecycle.
4. Pedido transportado pela Rodovia.
5. Dark Factory recebeu e executou o serviço solicitado.
6. Resposta retornou pela Rodovia.
7. Recebimentos foram registrados.
8. Operação terminou em `COMPLETED`.
9. Eventos foram registrados nas bibliotecas.
10. Dark Factory não recebeu responsabilidade de publicação.

Esta validação fecha o circuito estrutural MVP. Ela não representa produção externa, autenticação real, banco persistente ou publicação real.
