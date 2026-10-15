# Contrato do backend comercial — versão 0.1

**Estado:** especificação técnica; não é backend implantado nem autoriza operação pública.
**Alvo:** branch `feature/world-alignment-audit-20261014`, PR #116 para `staging`.
**Regra de interface:** não alterar telas existentes. A entrada pública futura pode ser uma integração separada; novas telas internas continuam usando apenas o shell padrão e o diálogo de requisitos.

## 1. Objetivo e limites

Trocar a fila volátil por uma API autenticada e persistente, sem criar um segundo motor comercial. Terra continua sendo a origem de leads/pedidos; WordDark Core decide e registra operações; Céu/Dark Factory executa trabalhos autorizados. A API não pode chamar provedores externos ou despachar operações automaticamente apenas porque recebeu um formulário.

Não tratar GitHub Pages, armazenamento do navegador, uma resposta HTTP 200, uma proposta aceita ou uma entrega como prova de pagamento recebido.

## 2. Fronteiras HTTP propostas

Prefixo versionado: `/api/v1`.

| Método e rota | Acesso | Responsabilidade |
| --- | --- | --- |
| `POST /commercial/intakes` | Público, protegido por limites antiabuso | Receber solicitação mínima e gerar protocolo opaco |
| `GET /commercial/intakes/:id` | Operador autenticado + permissão | Consultar intake e estado |
| `POST /commercial/intakes/:id/qualify` | Operador autenticado + permissão | Qualificar e vincular lead Terra |
| `POST /commercial/proposals` | Operador autenticado + permissão | Criar proposta a partir do catálogo vigente |
| `POST /commercial/proposals/:id/acceptance` | Confirmação explícita e verificável | Registrar aceite; não despacha operação |
| `POST /commercial/orders/:id/dispatch-approvals` | Operador autenticado, aprovação explícita | Registrar aprovação auditável |
| `POST /commercial/orders/:id/dispatch` | Operador autenticado + aprovação + chave idempotente | Solicitar despacho controlado pelo bridge/Core |
| `GET /operator/queue` | Operador autenticado + permissão | Listar fila persistida de execução manual |
| `POST /operator/queue/:id/transitions` | Operador autenticado + permissão | Registrar transição permitida, ator e motivo |
| `GET /health/live` | Sem autenticação; resposta mínima | Confirmar que o processo responde |
| `GET /health/ready` | Sem autenticação; resposta mínima | Retornar apenas pronto/não pronto; nunca expor nomes de serviços, credenciais ou detalhes internos |

Os nomes são contrato proposto, não rotas já existentes. Não publicar nem conectar o frontend antes de implementar e testar o backend.

## 3. Dados e persistência

Preferência arquitetural: Firestore no servidor, com IAM de menor privilégio, transações e regras de retenção. O navegador nunca recebe credenciais de serviço. O servidor deve recusar iniciar em modo de produção quando o armazenamento durável não estiver configurado.

Coleções sugeridas:
- `commercialIntakes`: protocolo, necessidade normalizada, consentimento, origem permitida, timestamps e estado.
- `commercialLeads`: dados de contato mínimos, referência do intake e histórico de qualificação.
- `commercialProposals`: itens do catálogo, escopo, preço/currency, validade, versão e estado.
- `commercialOrders`: proposta aceita, escopo congelado, estado e referências do Core.
- `commercialApprovals`: ator, papel, motivo, objeto aprovado, hash/revisão do objeto e timestamp.
- `commercialExecutionJobs`: ordem, serviço permitido, estado, executor, revisor, prazos e referências de artefatos; sem tokens.
- `commercialAudit`: eventos append-only com ator, ação, objeto, resultado e correlação.
- `commercialIdempotency`: chave, escopo, estado e resultado mínimo; chave única por ação/objeto.

Cada gravação de estado crítico deve ser transacional quando houver múltiplos documentos. Não usar arrays de auditoria em memória como fonte de verdade. Definir TTL apenas para dados temporários; retenção de auditoria e dados de clientes exige política explícita.

## 4. Segurança obrigatória

1. HTTPS no ambiente implantado; CORS por allowlist exata; não refletir o Origin arbitrariamente.
2. Autenticação verificada no servidor (sessão/OIDC), autorização por ação e papel; nunca confiar em `actorId`, papel, status, preço ou aprovação enviados pelo cliente.
3. Segredos apenas em Secret Manager/variáveis protegidas do runtime. Nunca em HTML, JavaScript servido ao público, logs ou respostas de erro.
4. Limites por IP/sessão e janela de tempo, limite de corpo, validação de tipos/tamanho e proteção contra spam no intake público. Não registrar corpo bruto de formulários.
5. Idempotência atômica para criação e despacho. Repetição deve devolver o resultado já gravado, não criar pedidos ou trabalhos duplicados.
6. Auditoria antes/depois com correlação; redigir e-mail, telefone, tokens e conteúdo sensível de logs.
7. Controle de concorrência para transições; rejeitar saltos de estado e decisões baseadas em versões antigas.
8. Erros com códigos estáveis e mensagens públicas genéricas; detalhes internos somente nos logs protegidos.
9. Política de dados: coletar apenas o necessário, informar finalidade e retenção e fornecer processo de correção/exclusão quando aplicável.
10. Operações externas ficam desativadas por padrão; aprovação, teste e rollback devem existir antes de qualquer ativação.

## 5. Máquina de estados

Intake: `RECEIVED → TRIAGED → QUALIFIED → CONVERTED`, com `REJECTED` ou `SPAM` quando justificado.

Proposta: `DRAFT → SENT → ACCEPTED | DECLINED | EXPIRED`. Aceite deve referenciar exatamente a versão/escopo aceito.

Pedido: `ORDER_OPEN → PLANNED → IN_PROGRESS → REVIEW → COMPLETED`, com cancelamento apenas por transição autorizada. Despacho ao Core é uma etapa separada, rastreada por `operationId`; se o Core aceitar sem retornar ID, marcar reconciliação pendente e não repetir automaticamente.

Execução: `QUEUED → CLAIMED → IN_PROGRESS → REVIEW → DELIVERED`, com `BLOCKED` e `CANCELLED` quando aplicável. Revisão própria deve ser registrada como tal.

Financeiro: separar `EXPECTED`, `INVOICED`, `PAYMENT_PENDING`, `PAYMENT_CONFIRMED`, `COST_RECORDED` e `NET_RESULT_RECONCILED`. Só comprovante verificado por fonte autorizada permite confirmar recebimento; nunca confiar em valor enviado pelo browser.

## 6. Contrato mínimo de resposta

Sucesso na criação pública:
```json
{
  "success": true,
  "status": "INTAKE_RECEIVED",
  "protocol": "opaque-public-id",
  "receivedAt": "ISO-8601"
}
```

Erro:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Confira os dados enviados."
  },
  "requestId": "opaque-correlation-id"
}
```

O protocolo público não é senha nem autorização para consultar dados. Consulta de estado exige autenticação ou um mecanismo de capacidade com alta entropia, escopo e expiração, se essa experiência for aprovada.

## 7. Sequência de implementação e aceite

- [ ] Confirmar ambiente servidor, projeto cloud, região, orçamento e política de dados antes de provisionar recursos pagos.
- [ ] Implementar store Firestore com transações, idempotência e auditoria, usando dependências injetadas e testes com emulador.
- [ ] Implementar API HTTP com autenticação real, autorização por ação, validação, rate limiting e CORS estrito.
- [ ] Ligar o intake ao motor Terra existente sem criar um motor comercial paralelo.
- [ ] Persistir fila manual da Dark Factory e transições; incluir recuperação de trabalhos presos e reconciliação após falha.
- [ ] Testar concorrência, repetição, indisponibilidade de banco, reinício, autorização negada, payload malicioso, limites e redaction.
- [ ] Implantar primeiro em staging com credenciais de teste e sem publicação/despacho externo.
- [ ] Fazer teste ponta a ponta e revisão de segurança; só depois pedir aprovação explícita para promover.
- [ ] Configurar alertas, backup/restore verificado, retenção e procedimento de rollback.

## 8. Critérios de pronto

O backend só pode ser considerado pronto quando dados e fila sobrevivem a reinício, autenticação/autorização são verificadas no servidor, a idempotência funciona sob concorrência, a auditoria é persistente, erros parciais são reconciliáveis e um teste ponta a ponta em staging confirma o fluxo. A presença deste documento ou testes unitários não satisfaz esses critérios.
