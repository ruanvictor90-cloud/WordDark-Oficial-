# WordDark — Templates de comunicação e registro

A partir desta camada, o mundo passa a usar três modelos globais para o circuito de comunicação:

PEDIDO
  ↓
MENSAGEM
  ↓
RODOVIA
  ↓
RECEBIMENTO
  ↓
EXECUÇÃO
  ↓
RESPOSTA
  ↓
RODOVIA
  ↓
RECEBIMENTO
  ↓
REGISTRO

## 1. Pedido — WordDarkRequest

Responsável por declarar o que está sendo solicitado.

Campos principais:
- requestId
- operationId
- requesterId
- originId
- destinationId
- service
- task
- payload
- status
- createdAt

O pedido não autoriza nem executa.

## 2. Recebimento — WordDarkReceipt

Responsável por provar que uma mensagem chegou ao destino.

Campos principais:
- receiptId
- messageId
- requestId
- operationId
- receiverId
- senderId
- routeId
- status
- receivedAt
- metadata

RECEIVED não significa COMPLETED.

## 3. Registro — WordDarkRecord

Responsável por padronizar fatos preservados pelo Registry/Bibliotecas.

Campos principais:
- recordId
- type
- operationId
- sourceId
- status
- data
- createdAt

## 4. Mensagem

WordDarkMessage é o envelope que transporta o pedido ou a resposta.

Tipos iniciais:
- OPERATION_REQUEST
- OPERATION_RESPONSE

Respostas carregam responseTo, permitindo ligar a resposta à mensagem original.

## Regra estrutural

Pedido      = o que foi solicitado
Mensagem    = envelope de transporte
Rodovia     = por onde passa
Recebimento = prova de chegada
Execução    = o serviço realizado
Resposta    = resultado devolvido
Registro    = histórico preservado

## Fluxo atual

TERRA
  │
  │ WordDarkRequest
  ▼
OPERATION ENGINE
  │
  │ WordDarkMessage
  ▼
WORDDARK ROAD
  │
  ▼
DARK FACTORY
  │
  │ OPERATION_RESPONSE
  ▼
WORDDARK ROAD
  │
  ▼
TERRA
  │
  ▼
REGISTRY → BIBLIOTECA LOCAL / CENTRAL

A Dark Factory continua responsável apenas pelo serviço solicitado. A decisão de necessidade e destino permanece em Terra.
