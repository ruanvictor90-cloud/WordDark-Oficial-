# Mapa da arquitetura — Ruan, Hub e WordDark

Este mapa representa a arquitetura pretendida e distingue as ligações implementadas das que ainda estão fechadas. **Uma linha no mapa não significa que a conexão esteja ativa em produção.**

## Mapa lógico

```mermaid
flowchart TB
    USER["Operador"]
    subgraph PERSONAL["Aplicativo pessoal"]
      RUAN["Ruan<br/>dados e apps pessoais"]
      HUB["Ruan Hub<br/>painel superior de gestão"]
      PERSONALFIN["Financeiro pessoal"]
      TASKS["Tarefas e listas"]
      SHADOW["Shadow / DarkEye experimental"]
      RUAN --> HUB
      RUAN --> PERSONALFIN
      RUAN --> TASKS
      RUAN --> SHADOW
    end
    USER --> RUAN
    HUB -. "contrato preparado<br/>adaptador desligado" .-> AUTH["Identidade + autorização<br/>aprovação + auditoria + idempotência"]
    AUTH -. "quando habilitado com backend confiável" .-> CORE["WordDark Core<br/>coordenação e fonte de verdade"]
    subgraph WORLD["WordDark — mundo operacional"]
      CORE --> OPS["Central de Operações / Rodovia"]
      CORE --> CONN["Central de Conexões"]
      OPS --> SKY["Céu<br/>execução de capacidades"]
      OPS --> EARTH["Terra<br/>empresas e necessidades"]
      SKY --> FACTORY["Dark Factory e capacidades"]
      CONN --> PROVIDERS["APIs e provedores externos"]
      BANK["Banco / Darkbank<br/>instituição financeira interna"] --- CORE
      BANK --> TREASURY["Controles, tesouraria,<br/>Cofre e investimentos"]
    end
    DARKNET["Darknet independente"] -. "ponte in-process desligada" .-> CORE
    PERSONALFIN -. "sem acesso automático / sem fundos compartilhados" .- BANK
```

## Propriedade e responsabilidade

| Parte | Responsabilidade | Estado de integração |
|---|---|---|
| Ruan | Aplicativo pessoal, dados e navegação privada | Independente; armazenamento principalmente local |
| Ruan Hub | Pedidos, avisos, verificações e acompanhamento superior do mundo | Painel existe; pedidos locais não chegam ao Core |
| WordDark Core | Identidade, autorização, coordenação, roteamento e auditoria | Runtime e contratos existem; falta serviço confiável de controle do Hub |
| Central de Operações / Rodovia | Receber e encaminhar operações | Módulos de runtime e testes existem |
| Céu | Executar capacidades e serviços | Estrutura de execução existe; integração varia por capacidade |
| Terra | Representar empresas, canais, clientes e necessidades externas | Estrutura existe; cobertura operacional ainda parcial |
| Central de Conexões | Guardar e usar credenciais/adaptadores externos sob controle | Gateway e módulos OAuth existem; configuração/segurança de produção pendente |
| Banco / Darkbank | Instituição financeira interna do WordDark | Responsabilidade definida; não é banco real operacional |
| Darknet | Sistema independente de acesso e preparação de solicitações | Ponte in-process existe, desligada por padrão |
| Shadow / DarkEye | Ferramentas pessoais experimentais | Não faz parte do WordDark nem da Darknet |

## Fluxo de um pedido — alvo

1. O operador descreve a necessidade no Ruan Hub.
2. O Hub envia um envelope com ID idempotente por uma sessão autenticada.
3. O Core valida a identidade confiável, a permissão para a ação e a aprovação exigida.
4. O Core registra a decisão na auditoria persistente.
5. O adaptador de controle encaminha o pedido à Central de Operações em ambiente TEST até que haja validação de produção.
6. O Core retorna um identificador e um estado real; o Hub consulta esse estado e apresenta o resultado.
7. A execução especializada ocorre no Céu, a entidade/necessidade pode pertencer à Terra, e o resultado retorna à operação original.

## Implementação feita nesta etapa

- Criado `core/connections/ruan-hub-control-adapter.js` e documentado em [`RUAN-HUB-CONTROL.md`](./core/connections/RUAN-HUB-CONTROL.md): contrato de entrada do Hub com default-deny, identidade confiável separada do pedido, autorização, aprovação, auditoria, idempotência injetada e ambiente fixado em TEST.
- Criados testes para modo desligado, identidade ausente, autorização negada, aprovação ausente, falha de auditoria, ausência de idempotência, descoberta de capacidades, consulta de estado e submissão sem duplicação.
- Hub agora rotula novos pedidos como `RASCUNHO_LOCAL` / `LOCAL_ONLY`; a tela não afirma que foram recebidos pelo WordDark.
- Não foi criado endpoint HTTP nem foi conectada uma sessão de operador real. O adaptador permanece desligado por padrão.

## O que falta para ativar a integração real

1. Identidade de operador autenticada no backend (não um ID fornecido pelo navegador).
2. Política de permissões e aprovações ligada à fonte de identidade do Core.
3. Auditoria persistente, protegida contra alteração e com retenção definida.
4. Armazenamento idempotente atômico e durável; o mapa/in-memory store dos testes não é suficiente.
5. Serviço backend autenticado para submeter pedidos e consultar operações, com limites de entrada, proteção contra replay, CORS/CSRF conforme o modelo de sessão, rate limit e gestão de segredos.
6. Consulta de estado/resultado baseada em IDs reais do registro do Core; não inferir “em execução” de armazenamento local.
7. Testes de integração com backend real em ambiente de staging, incluindo falhas, concorrência, permissões e recuperação.
8. Só depois, revisão de segurança e autorização explícita para ativação fora de TEST.

## Limites que permanecem

- Nenhuma publicação externa, movimentação financeira, pagamento ou investimento real foi ativado.
- Não compartilhar dados ou fundos pessoais do Ruan com o WordDark.
- Não tratar mocks, testes locais, telas ou registros locais como evidência de operação em produção.


## Camada de conhecimento recebido pela Darknet

```mermaid
flowchart LR
    API["APIs externas / fontes"] --> CC["Central de Conexões<br/>adapter + credenciais"]
    CC --> DN["Darknet<br/>pipeline de aquisição"]
    DN --> AUTH["Identidade + autorização<br/>auditoria"]
    AUTH --> INTAKE["WordDark Knowledge Adapter"]
    INTAKE --> PENDING["Registro pendente<br/>RECEIVED_PENDING_REVIEW"]
    PENDING --> REVIEW["Validação / revisão"]
    REVIEW --> LIB["Biblioteca local ou central<br/>conforme política"]
    LIB --> SKY["Céu / capacidades"]
```

O pipeline está implementado como contrato de integração e usa adaptadores de provedores injetados. `darknet/darknet-central-connection-provider.js` encaminha pesquisas ao gateway da Central de Conexões usando uma conta e capacidade já autorizadas, sem expor credenciais à Darknet. Ele não ativa por si só uma API externa. A entrada WordDark também permanece desligada por padrão, exige identidade confiável e recebe conteúdo como pendente de revisão. A infraestrutura de persistência durável e idempotência agora tem adapters Firestore; ainda faltam conectar os adapters reais já disponíveis ao gateway, injetar identidade/autorização/auditoria reais, configurar IAM e validar a cadeia completa em staging.


## Preparação operacional de conhecimento

A composição de produção fica em `darknet/darknet-knowledge-runtime.js`. Ela pode receber a instância Firestore já criada no backend e construir os adapters duráveis usando as coleções `worddarkKnowledgeIntake` e `worddarkCentralLibrary`. O arquivo canônico recebe apenas registros de conhecimento validados e usa ID determinístico para evitar duplicação em novas tentativas.

O runtime também protege revisão, listagem de pendências e busca validada: cada chamada precisa passar por `authenticateService`; leituras exigem autorização e auditoria próprias; revisão exige aprovação. Um objeto enviado pelo navegador com `authenticated: true` não constitui identidade confiável.

**Ainda não é uma ativação oficial.** Falta ligar a identidade/autorização/auditoria reais, registrar os adapters externos reais no gateway com conta e capacidade `KNOWLEDGE_RESEARCH`, configurar IAM/regras das coleções no projeto real e passar por uma execução controlada em staging. Não ativar com callbacks permissivos de teste.
