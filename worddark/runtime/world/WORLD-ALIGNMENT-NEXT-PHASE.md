# Alinhamento do mundo inteiro — próxima fase

**Data:** 14/10/2026  
**Base de trabalho:** branch `feature/darknet-foundation`, associada à PR #104.  
**Estado:** plano de alinhamento + módulo inicial de livro-caixa; não significa merge, publicação ou operação comercial automática.

## Regra central

Não reconstruir o mundo nem criar um segundo motor comercial. Consolidar a integração existente, proteger as fronteiras entre sistemas e completar o menor caminho confiável até a primeira venda real. A existência de arquivos não prova que a interface ativa os chama, que os dados persistem ou que uma operação externa foi concluída.

## Mapa de responsabilidades

| Sistema/setor | Responsabilidade canônica | Integração permitida nesta fase | Limite |
|---|---|---|---|
| Ruan | Aplicativo pessoal privado, separado do mundo | Link explícito para o Hub; Entretenimento permanece app pessoal independente | WordDark não administra dados pessoais; sem Área ADM na tela inicial |
| Entretenimento (Ruan) | Biblioteca e reprodução de mídia dentro da própria tela | Player incorporado para vídeos/playlists autorizados, como fontes oficiais do YouTube | Não hospeda cópias, não contorna direitos, nem promete todo anime disponível; dependência de embed, região e disponibilidade |
| Ruan Hub | Painel superior de acompanhamento do mundo, pertencente logicamente ao Ruan | Rascunhos locais e, futuramente, contratos autenticados para pedidos/status | Rascunho local não é pedido recebido; Hub não vira um segundo Core |
| WordDark Core | Autoridade de coordenação, autorização, roteamento, auditoria e catálogo de capacidades | Interfaces internas e adaptadores controlados | Não confia em identidade fornecida pelo navegador; não executa sem autorização |
| Terra | Entidades, necessidades, captação, qualificação comercial, propostas e pedidos | Intake controlado para o pipeline comercial | Não envia propostas nem promete serviço automaticamente |
| Céu | Execução de capacidades e produção de entregáveis | Encaminhamento futuro de pedidos aceitos para operações aprovadas | Não decide sozinho preço, contrato ou compromisso comercial |
| Dark Factory | Produção de conteúdo e soluções dentro do Céu | Usar apenas etapas verificadas para o serviço vendido | Não declarar exportação/publicação como real sem testar o caminho completo |
| Central de Conexões | Fronteira de credenciais, adapters, permissões e serviços externos | Adapters injetados, começando em TEST | OAuth não concede capacidade por si; sem segredos no browser |
| Darknet | Sistema independente de navegação/conexões e aquisição de conhecimento | Bridges in-process desligadas por padrão; conteúdo proposto passa por revisão | Não é app dentro do Ruan, não guarda tokens de provedores e não deve abrir transporte externo automaticamente |
| WordDark / Financeiro interno (Darkbank) | Registros internos de contratos, recebimentos, custos e tesouraria | Livro-caixa manual de teste e relatórios | Não é banco autorizado, não recebe dinheiro de cliente nem movimenta fundos |
| Shadow / darkEye | App separado do Ruan; darkEye é conceito de sobreposição/contexto experimental | Preservar a separação; desenvolvimento próprio no fluxo do Ruan | Não duplicar Shadow em outros apps e não acoplar à captação comercial sem contrato |

## Fluxo comercial canônico

`Terra capta → qualifica → proposta individual → aceite explícito → pedido → execução no Céu → revisão → entrega → faturamento/registro → recebimento conferido → despesas → saldo real`

- Valores de proposta, contrato, fatura, recebimento e lucro são conceitos distintos.
- Não marcar recebimento com base apenas em proposta aceita ou fatura emitida.
- O módulo `earth/commercial-ledger.js` registra eventos manuais com IDs únicos e trilha de auditoria em memória; não confirma transações bancárias nem substitui armazenamento durável.
- Cofre não recebe transferência automática. Somente um operador pode decidir sobre recursos efetivamente recebidos, descontados os custos e reservas.
- Primeiro validar venda avulsa; planos recorrentes, investidores, subsídios e automação são trilhas separadas.

## Módulos existentes a reconciliar (não duplicar)

- `earth/commercial-engine.js`: catálogo, leads, qualificação, propostas, decisão e pedidos.
- `core/earth-commercial-intake-adapter.js`: ligação controlada entre demanda de Terra e lead comercial.
- `core/commercial-order-operation-bridge.js`: pedido aceito para Core, desativado por padrão e ambiente TEST.
- `core/operation-center.js`: ponto central de submissão/coordenação de operações.
- `core/connections/*`: autorizações, adapters, publicação e controles de conexão.
- `darknet/*`: sistema independente, contratos, gateway, plugins, segurança, monitor e integração de conhecimento.
- `hub/*`: painel superior; rascunhos locais devem permanecer claramente identificados.
- `ruan/apps/entretenimento/index.html` (main atual): player incorporado e catálogo inicial. Preservar esse app ao reconciliar a branch de integração; não substituir por um atalho para outro aplicativo.

## Sequência de trabalho

### P0 — Integridade de integração
1. Resolver o estado de merge da PR #104 antes de publicar.
2. Rodar a suíte completa no HEAD atual; o último relatório da PR não confirma execução completa do HEAD atual.
3. Comparar o Ruan de `main` com os arquivos tocados na branch de integração. Preservar Entretenimento, player, navegação e o comportamento atual de cada app.
4. Garantir que a gaveta de apps aparece apenas na home do Ruan, não duplicada nas telas internas.

### P1 — Primeira venda
1. Escolher um serviço de escopo pequeno que seja possível produzir e revisar manualmente.
2. Registrar lead, necessidade observável, prazo, custo e capacidade disponível.
3. Preparar proposta com escopo, preço, limite de ajustes e prazo.
4. Aguardar aceite explícito antes de iniciar.
5. Entregar, confirmar aceite e registrar recebimento/custos reais.

### P2 — Fechamento financeiro
1. Usar o livro-caixa manual para separar contrato, faturamento, recebimento e despesa.
2. Acrescentar persistência durável e idempotência atômica antes de qualquer uso multiusuário/produção.
3. Ligar o livro-caixa ao pipeline comercial somente após definir autorização e identificadores canônicos.
4. Fazer testes de ponta a ponta e validar a versão publicada.

### P3 — Automação controlada
Somente depois de uma venda real e fluxo repetível: conectar os adapters necessários, conceder capacidades explicitamente, validar identidade/auditoria reais e ativar um recurso por vez. Não habilitar pagamentos, publicação ou envio automático como efeito colateral.

## Critério de pronto para a próxima etapa

- PR #104 sem conflitos, CI completa verde no HEAD e revisão dos limites de segurança.
- Entretenimento permanece no Ruan e seu player só usa fontes licenciadas/autorizadas.
- O ciclo comercial distingue lead, proposta, aceite, pedido, entrega e dinheiro recebido.
- Nenhum módulo declara produção, sincronização, banco ou integração real sem evidência verificável.


## Implementação adicionada nesta branch — primeiro ciclo comercial

- worddark/runtime/world/earth/first-sale-workflow.js coordena pedido aceito, contrato manual, início da execução, entrega, aceite, fatura, recebimentos e despesas.
- worddark/runtime/world/earth/first-sale-workflow.test.js cobre o fluxo completo e bloqueia início sem contrato, contrato duplicado, faturamento antes do aceite da entrega e recebimento acima da fatura.
- O módulo reutiliza o motor comercial e o livro-caixa existentes; não cria um segundo Core nem substitui Terra → Core → Céu.
- O estado permanece IN_MEMORY_ONLY: melhora as regras de fluxo e os testes, mas não declara persistência entre sessões, verificação bancária ou produção.
- O app Entretenimento da versão atual de main é restaurado na home integrada do Ruan e incluído no cache do service worker (ruan-central-v18). O player continua incorporado e limitado a vídeos/playlists disponíveis e autorizados; não hospeda episódios.
- Mudanças restritas à branch de integração: sem alterar main, sem mesclar a PR #104 e sem publicar automaticamente.