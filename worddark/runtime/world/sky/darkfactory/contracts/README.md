# Contracts

Os Contracts definem o idioma comum entre as unidades do WordDark, a Rodovia e a Dark Factory.

Eles não executam tarefas. Eles definem **como uma informação deve ser apresentada, transportada e devolvida**.

## Contratos-base

### 1. Identity

Representa a identidade de uma unidade.

Campos conceituais:

- identityId
- type
- name
- parentId
- status
- version

Exemplo:

```text
identityId: JUICE-SUCAST
type: STATE
name: SucoCast
parentId: JUICE-COUNTRY
status: ACTIVE
version: 1
```

Identidade responde **quem é a unidade**.

Ela não concede permissão.

---

### 2. Request

Representa uma solicitação de trabalho.

Campos-base:

- requestId
- requester
- origin
- destination
- task
- taskType
- permission
- status
- createdAt

O Request informa **o que está sendo solicitado**.

---

### 3. Message

Representa o envelope usado para transportar uma informação pela Rodovia.

Campos-base:

- protocol
- messageId
- requestId
- origin
- destination
- type
- createdAt
- payload

O Message informa **como a informação está sendo transportada**.

---

### 4. Response

Representa a resposta devolvida ao solicitante.

Campos-base:

- protocol
- messageId
- responseTo
- requestId
- origin
- destination
- type
- status
- result
- createdAt

O Response informa **o que aconteceu com a solicitação**.

---

### 5. Result

Representa o resultado produzido pelo processamento.

Estados possíveis no modelo inicial:

- PROCESSADO
- FALHA
- REJEITADO
- INTERROMPIDO
- PENDENTE

O Result informa **qual foi o resultado da execução**.

---

### 6. Route

Representa o caminho autorizado de uma comunicação.

Campos conceituais:

- routeId
- origin
- destination
- service
- status
- createdAt

A Route informa **por onde a informação pode passar**.

Ela não substitui a autorização.

---

## Relação entre contratos

```text
IDENTITY
   │
   ▼
REQUEST
   │
   ▼
MESSAGE
   │
   ▼
ROUTE
   │
   ▼
DARK FACTORY
   │
   ▼
RESULT
   │
   ▼
RESPONSE
```

## Separação de responsabilidades

Identity = quem é?

Request = o que quer?

Message = como está sendo transportado?

Route = por onde pode passar?

Security = pode fazer?

Executor = como será processado?

Result = o que aconteceu?

Response = como o resultado volta?

## Regra de evolução

Os contratos devem possuir versão.

Uma alteração futura não deve quebrar automaticamente unidades que ainda utilizam uma versão anterior.

Antes de implementar novos contratos em código, a estrutura conceitual deve permanecer estável.

## Estado atual

Os contratos estão definidos conceitualmente.

O núcleo DF-0.3 já possui Request, Message/Envelope, Response e Result de forma parcial.

A próxima etapa de implementação deverá transformar os contratos estáveis em estruturas reutilizáveis, começando por Identity e Route.
