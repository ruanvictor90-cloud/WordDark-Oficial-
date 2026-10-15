# Auditoria do mundo e da Central de Conexões — 15/10/2026

**Branch:** `feature/central-connections-new-interface-audit-20261015`  
**Base:** `staging` — `0046cd97209d3c3b45debfd540c3f2b868cc0f83`.  
**Escopo:** inventário da árvore do repositório (794 entradas), revisão de documentos canônicos de arquitetura/prontidão, revisão focada do caminho comercial e das conexões, e renovação da tela Central de Conexões. Este é um relatório de arquitetura e caminhos críticos; não afirma revisão manual linha a linha de todos os arquivos.

## 1. Resultado executivo

- No commit-base de staging, CI principal e baseline de segurança passaram.
- A interface renovada e este relatório precisam passar pela CI própria da branch antes de integrar.
- Produção permanece bloqueada. Código, mocks e testes não provam que um serviço esteja implantado ou autorizado.
- O frontend é estático (GitHub Pages); não substitui API autenticada, fila compartilhada ou armazenamento durável.
- A operação comercial manual pode começar separadamente, desde que pedido, escopo, autorização, entrega e dinheiro recebido sejam registrados como fatos distintos.

## 2. Arquitetura canônica preservada

- **Ruan:** app pessoal privado; sem compartilhamento automático de dados com WordDark.
- **Ruan Hub:** painel superior de acompanhamento; rascunho local não é operação remota.
- **Darknet:** sistema independente de navegação, descoberta e preparação de solicitações; não é parte do Ruan e não tem autoridade própria.
- **WordDark Core:** políticas, autorização, auditoria, estado e roteamento.
- **Central de Conexões:** fronteira governada para provedores, credenciais, capacidades e adapters.
- **Terra:** necessidades, clientes, entidades, canais, leads, propostas e pedidos.
- **Céu:** execução de capacidades especializadas.
- **Dark Factory:** produção pertencente ao Céu; não é dona de clientes nem publica diretamente.
- **Biblioteca:** conhecimento e artefatos com origem/versão/revisão; não autoriza nem executa.
- **Dark Channels / Marketing:** operação de conteúdo e canais; publicar é ação separada, aprovada e rastreável.
- **Darkbank:** controle financeiro interno do WordDark; não é banco licenciado nem movimenta dinheiro sem integração autorizada.
- **Financeiro pessoal do Ruan:** separado do caixa WordDark.
- **Shadow / darkEye:** ferramentas pessoais experimentais isoladas.
- **Cidade de Compras:** domínio separado; não migrar para o Core sem revisão explícita.

Engrenagem canônica: **Terra identifica → WordDark valida e coordena → Céu executa → WordDark registra → resultado retorna à origem → financeiro registra apenas fatos comprovados.**

## 3. Auditoria módulo por módulo

| Módulo | Estado observado | Bloqueio para operação real |
|---|---|---|
| Ruan | App pessoal, boundary tests e apps separados | Teste no Android, revisão de persistência/sincronização e segurança; manter isolamento. |
| Ruan Hub | UI local, adapter/runtime de controle e testes | Backend, sessão, aprovação, transporte e store durável reais. |
| Darknet | Core, gateway, engine, plugins, políticas, monitor e pipeline de conhecimento com testes | Providers reais, auth server-side, auditoria persistente e transporte implantado; permanece desligada por padrão. |
| WordDark Core | Contratos, catálogo de capacidades, registro, políticas e roteamento | Identificar consumidores ativos/legados; conectar identidade, aprovação e persistência reais. |
| Central de Conexões | Contracts, gateway, registry, adapters, OAuth bridge preparado e testes | Configurar backend real, consolidar fonte de verdade, validar capacidade e revogação. |
| Terra/comercial | Intake, leads, propostas, pedidos e bridge com integração simulada | HTTPS/API implantada, CORS, rate limit distribuído, auth, Firestore/IAM, aceite verificável e conciliação financeira. |
| Comercial → Core | Bridge com idempotência, aprovação e reconciliação; integração em TEST | Teste real com store durável, concorrência e referência rastreável de cada operação. |
| Céu | Catálogo de capacidades e roteamento | Validar executores, fila persistente, cancelamento, timeout, retry seguro e retorno. |
| Dark Factory | Setores de conteúdo, testes e fila manual documentada | Testes ponta a ponta por serviço, armazenamento de materiais, revisão e entrega. |
| Biblioteca | Contratos de artefatos/conhecimento e adapters | Firestore/IAM/índices/retention reais, proveniência e testes concorrentes. |
| Dark Channels | Camada de canais e bridge social | Autorização por conta, fila de publicação, recibos e gestão de falhas; sem publicação automática. |
| Marketing | Estrutura de campanhas/canais documentada | Métricas com fonte, aprovação de orçamento e integrações reais. |
| Financeiro/Darkbank | Papel financeiro definido e separado do Ruan | Razão interno com recebimentos comprovados, custos, taxas, obrigações, reservas e estornos; não alegar conexão bancária. |
| Segurança/governança | Gates, políticas e testes de negação | Identidade real, auditoria append-only protegida, alertas, rotação, least privilege e resposta a incidentes. |
| Jurídico/IP | Catálogo e páginas | Revisão humana, autoria/licenças e evidências de origem. |
| Identidade oficial | Kit de marca e páginas | Consistência entre superfícies; não expor Ruan publicamente. |
| Catálogo/apps | Catálogo e shells de identidade/requisitos | Diferenciar apps existentes, parciais, especificações e operacionais; preservar interfaces atuais. |
| Cidade de Compras | Projeto separado com contratos próprios | Manter isolado; migração explícita antes de ligar ao Core. |
| CI/Pages/infraestrutura | Workflows de teste, segurança e deploy estático | Verificar cada PR e deploy; Pages não fornece backend/API por si só. |

## 4. Auditoria conexão por conexão

| Conexão | Estado do código | Bloqueios antes de liberar |
|---|---|---|
| Google/YouTube OAuth | Fluxo authorization-code e bridge server-side preparados; store cifra tokens com Cloud KMS; testes de contrato | `codeEndpoint` vazio por padrão. Implantar HTTPS, configurar OAuth redirect/client, Firestore/KMS/IAM, validar refresh token e persistência; integrar registro ao gateway. |
| YouTube Data API/leitura | Adapter e scopes declarados | Testar quota, escopos e conta autorizada real em staging. Adapter não prova conexão. |
| YouTube publicação | Publisher server-side, gate, quota, idempotência e auditoria preparados | Runtime não ligado à rota HTTP operacional. Exigir aprovação específica, store durável, buffer confiável, recibo e teste controlado antes de liberar. |
| Instagram | Construtor OAuth e scopes declarados; backend pendente | OAuth server-side, callback/CSRF, store seguro, conta profissional e permissões/revisão Meta. |
| TikTok | Construtor OAuth e scopes declarados; backend pendente | Backend, permissões de app, callback/CSRF, armazenamento, quota e teste real. |
| Facebook Pages | Construtor OAuth e scopes declarados; backend pendente | Backend, escopos aprovados, conta/página autorizada e teste de API. |
| Darknet ↔ WordDark | Bridges/adapters e testes de modo desligado, validação e negação | Transporte ainda in-process/injetado; auth server-side e auditoria durável reais. Não confiar em `approved` enviado pelo cliente. |
| Darknet ↔ conhecimento/providers | Pipeline, adapters e composição server-side com testes | Providers reais pela Central, proveniência, revisão, persistência e IAM reais. Conteúdo externo é não confiável até revisão. |
| Ruan Hub ↔ WordDark | Runtime e adapter com testes | Sessão, aprovação, store e transporte backend reais. Rascunho local não despacha operação. |
| Terra ↔ Core | Fluxo comercial integrado em TEST | API pública protegida, auth, rate limit, idempotência e auditoria reais. |
| Core ↔ Céu | Bridge de despacho e testes de integração | Fila durável, executor concreto, artefatos, timeout/retry seguros e retorno rastreável. |
| Céu ↔ Dark Factory | Capacidades e fila manual documentadas | Validar executor por tipo, armazenamento, revisão e aceite de entrega. |
| Dark Factory ↔ redes sociais | Bridge social e contratos de publicação | Passar pela Central, autorização, política e recibo; sem tokens no cliente. |
| Core ↔ Biblioteca | Contratos e adapters de persistência | Firestore/IAM/retention reais; concorrência, proveniência e revisão. |
| Core ↔ Darkbank | Relação operacional prevista | Reconciliar pedido, entrega, valor devido e dinheiro recebido. Proposta aceita não é pagamento. |
| Ruan ↔ WordDark | Fronteira explícita, sem compartilhamento padrão | Manter isolado; qualquer troca futura exige contrato, consentimento, escopo mínimo e auditoria. |
| Darknet ↔ Ruan/Shadow/darkEye | Sistemas separados | Sem ponte implícita; darkEye não é autoridade nem canal para segredos. |

## 5. Múltiplas implementações de conexão — risco a controlar

Foram encontrados estes diretórios relacionados:
- `worddark/runtime/world/core/connections/` — Central canônica do mundo e alvo da nova interface.
- `worddark/core-central/` — contratos/adapters de uma geração anterior.
- `worddark/runtime/world/sky/connections/` — contratos/registro do lado executor.
- `worddark/bridge/google-oauth/` — backend OAuth específico de Google/YouTube.
- `worddark/runtime/world/updates/` — material/versionamento histórico.

Eles podem ter papéis distintos; não devem ser fundidos ou apagados só por parecerem duplicados. Antes de ativar providers, documentar owner de cada registro, fonte de autorização e estado canônico, e garantir que os adapters consultem a mesma fonte confiável.

## 6. Central de Conexões — mudança nesta branch

Foi renovada somente `worddark/runtime/world/core/connections/index.html`:
- identidade escura roxo/preto alinhada ao WordDark;
- responsividade para Android e desktop;
- cards independentes para YouTube/Google, Instagram, TikTok e Facebook;
- estados explícitos de backend pendente;
- status das pontes Darknet↔WordDark, Ruan Hub↔WordDark, Terra↔Core e Core↔Céu;
- fluxo de liberação em quatro etapas: identidade → autorização → persistência → capacidade;
- mantém OAuth code flow do YouTube e a configuração por `connection-config.js`;
- não persiste Client Secret/tokens no navegador;
- não declara conta conectada sem confirmação do backend e não ativa produção.

## 7. Gates de prontidão

**Gate A — automação:** CI e baseline de segurança verdes nesta branch; testes de conexões/OAuth, comercial, Darknet, persistência e fronteiras aprovados.

**Gate B — staging real:** backend HTTPS; identidade de serviço/IAM mínimo; Firestore e KMS reais; segredos em armazenamento seguro; CORS/callbacks/limites; logs sem tokens; teste de conexão e revogação.

**Gate C — operação:** pedido de teste percorre Terra → Core → fila Céu/Dark Factory → revisão humana → entrega → registro financeiro. Idempotência concorrente e falhas seguras comprovadas. Estados da tela vêm do backend.

**Gate D — produção:** aprovação explícita, provider autorizado com capacidades mínimas, publicação inicialmente manual com recibo, rollback, revogação, quotas e conciliação financeira.

## 8. Sequência de execução

1. Rodar CI e segurança da branch atual.
2. Corrigir regressões sem desativar testes nem ampliar escopos.
3. Abrir PR para staging e revisar o diff; manter a produção inalterada até aprovação.
4. Consolidar fonte de verdade/registry da Central sem apagar módulos antigos antes de mapear consumidores.
5. Implantar e validar Google/YouTube em staging como primeiro provider.
6. Validar o fluxo comercial manual e registrar fatos financeiros.
7. Só após evidências dos gates, considerar promoção a `main` e ativação gradual.

**Conclusão:** o projeto tem fundações e contratos para continuar a integração, mas ainda não há evidência suficiente para declarar o mundo inteiro operacional em produção. A tela melhora a operação e a transparência; prontidão real exige backend, identidade, persistência, testes integrados e autorização.
