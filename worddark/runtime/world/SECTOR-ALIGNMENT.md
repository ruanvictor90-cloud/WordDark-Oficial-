> **Hierarquia de documentação:** a fonte canônica de responsabilidade e limites é [ARCHITECTURE-CONSOLIDATION.md](./ARCHITECTURE-CONSOLIDATION.md), seguida por [CURRENT-VERSION-SCOPE.md](./CURRENT-VERSION-SCOPE.md). Este arquivo é o inventário técnico detalhado dos setores. Se um texto histórico divergir da arquitetura canônica, prevalece a arquitetura canônica. O Hub é o painel superior pertencente ao Ruan; o Banco/Darkbank é a instituição financeira do mundo. Nenhuma seção aqui autoriza criar novas telas ou ativar integrações reais.

# WordDark — alinhamento bruto dos setores

**Objetivo:** consolidar responsabilidades e fronteiras antes de ampliar funcionalidades. Este documento não cria interfaces e não declara um módulo pronto para produção apenas porque seu arquivo existe.

## Contrato canônico de publicação

O catálogo `worddark/runtime/world/core/capability-catalog.js` define `CONTENT_PUBLICATION` como capacidade do Core. `CONTENT_PUBLISH` é uma ação de transporte, não um nome alternativo da capacidade. A Central de Conexões deve preservar essa distinção: `action=CONTENT_PUBLISH` mapeia para `capability=CONTENT_PUBLICATION`. A conexão OAuth recém-salva permanece sem capacidades concedidas até existir um fluxo de concessão confiável; o escopo OAuth `youtube.upload` sozinho não concede permissão operacional. **Estado desta consolidação:** o gateway, o portão e o runtime de publicação já distinguem ação de transporte e capacidade canônica, com testes automatizados. O serviço backend de concessão/revogação de `CONTENT_PUBLICATION` agora valida identidade de operador, permissão específica, aprovação identificável, conta persistida, escopo OAuth de upload, idempotência e auditoria antes de alterar a conexão. O serviço ainda usa dependências injetadas e não está ligado a uma identidade/aprovação real nem exposto por HTTP; portanto, nenhuma capacidade é concedida automaticamente e a publicação continua manual por padrão.

## 1. Regra de autoridade

| Camada | Papel | Pode fazer | Não pode assumir |
|---|---|---|---|
| WordDark | Coordenar o mundo | Receber pedidos, classificar, priorizar, autorizar, encaminhar, auditar e acompanhar | Produção especializada pertencente ao Céu; necessidades pertencentes à Terra |
| Céu | Executar capacidades | Produzir, processar, validar e devolver resultados | Autoridade global, propriedade dos canais ou decisão comercial da Terra |
| Terra | Originar e organizar necessidades externas | Registrar entidades, clientes, pedidos, canais, lojas e entregas | Infraestrutura compartilhada do Céu ou autoridade de segurança do WordDark |
| Central de Conexões | Infraestrutura compartilhada do WordDark | Guardar autorização de provedor no backend, expor capacidades limitadas e executar integrações autorizadas | Ser um aplicativo de marketing duplicado em cada setor |
| Ruan | Sistema privado separado | Operações pessoais e apps privados | Ser administrado pelo WordDark ou compartilhar dados automaticamente |

## 2. Fonte de verdade no código

- **Core operacional ativo:** `worddark/runtime/world/core/`.
- **Runtime único:** `world-runtime.js`; operação, registro, coordenação, segurança e conexões são serviços desse núcleo.
- **Dark Factory:** `worddark/runtime/world/sky/darkfactory/`; pertence ao Céu e produz resultados rastreáveis.
- **Terra:** `worddark/runtime/world/earth/`; origina necessidades e organiza operações externas/comerciais.
- **Bibliotecas:** `worddark/runtime/world/library/`; preservam conhecimento e artefatos, não decidem operações.
- **Segurança global:** contratos ativos do Core são a autoridade; módulos específicos de segurança precisam ser integrados ao Core antes de serem considerados proteção efetiva.
- **Google OAuth bridge:** `worddark/bridge/google-oauth/`; serviço backend separado da interface pública.
- **Legado:** `worddark/core-central/` é material de auditoria, não runtime alternativo.
- **Cidade de Compras:** `worddark/runtime/world/cidade-compras/` contém estrutura de comércio e fluxo Terra→Céu; seu README declara desenvolvimento em `develop`. Não promover nem ativar automaticamente como Core.
- **Ruan Hub / inventário de módulos:** manter o visual atual e usar o inventário para triagem, não como runtime ou autoridade.

Se duas implementações fizerem a mesma função, não unir por semelhança de nome. Primeiro definir o contrato canônico, verificar consumidores e testes, migrar dependências explicitamente e só então marcar a implementação anterior como legado.

## 3. Apps — contrato bruto

### WordDark / coordenação
- **Entrada:** pedido, evento ou resultado vindo de uma unidade autorizada.
- **Saída:** operação classificada, decisão, encaminhamento, estado e registro de auditoria.
- **Dependências:** Core, políticas de acesso, registro operacional, rodovia/roteamento e conexões quando necessário.
- **Interface futura:** fila global, detalhe da operação, aprovações, alertas, pesquisa e histórico.

### Céu / catálogo de capacidades
- **Entrada:** operação encaminhada com contexto, permissão e contrato de serviço.
- **Saída:** resultado validado, artefatos, falha estruturada e referência de origem.
- **Dependências:** registro de serviços, executores, validação, Core e biblioteca quando aplicável.
- **Interface futura:** catálogo de capacidades, estado dos executores, fila e resultados.

### Terra / entidades e necessidades
- **Entrada:** solicitação de cliente, entidade, canal, empresa ou operação comercial.
- **Saída:** pedido validado, contexto da entidade, destino pretendido e estado de atendimento.
- **Dependências:** registros da Terra e contratos do Core para encaminhamento.
- **Interface futura:** entidades, pedidos, histórico, anexos e confirmação real das entregas.

### Dark Factory / produção
- **Entrada:** requerimento autorizado de produção, parâmetros e arquivos de referência.
- **Saída:** artefato versionado, validação, metadados e estado de produção.
- **Dependências:** registro de serviços, executores de texto/imagem/áudio/vídeo, validadores e armazenamento.
- **Interface futura:** criação, opções por tipo de serviço, progresso, biblioteca de resultados, revisão e aprovação.
- **Fronteira:** não administra canais nem publica. A distribuição é uma operação separada.

### Central Social — três apps distintos
- **Gestor de redes sociais:** contas/canais, calendário, fila manual, estado e recibos externos.
- **Gestor de marketing digital:** objetivos, campanhas, orçamento, criativos e métricas com origem comprovada.
- **Gestor de projetos:** tarefas, responsáveis, prazos, custos, dependências e entregas.
- **Dependências compartilhadas:** Core, biblioteca, Dark Factory e Central de Conexões quando uma integração for necessária.
- **Interface futura:** cada app tem seu próprio espaço; não duplicar o Core nem fingir que contas, anúncios, métricas ou publicações estão conectados.

### Empresa social / Terra
- **Entrada:** entidade/cliente, canal, objetivo e necessidade operacional.
- **Saída:** contexto de canal e pedido encaminhado.
- **Interface futura:** perfil de cliente, canais, solicitações, histórico e estado de entrega.
- **Regra:** SucoCast, SucoGeek, SucoComed e SucoFactor são canais/entidades externas de teste/operação, não setores internos do WordDark.

### Empresa comercial / Cidade de Compras
- **Entrada:** intenção de compra, catálogo, fornecedor e dados necessários do pedido.
- **Saída:** pedido agrupado por fornecedor, estado, comunicação e resultado confirmado.
- **Interface futura:** catálogo, fornecedores, pedidos, etapas logísticas, comprovantes e ocorrências.
- **Regra:** descoberta externa não valida fornecedor; encaminhar pedido não equivale a comprar, pagar ou entregar.

### Central de Conexões / infraestrutura
- **Entrada:** provedor, conta, autorização OAuth, ação e capacidade solicitada.
- **Saída:** metadados da conexão, capacidades permitidas e recibo de execução.
- **Dependências:** identidade autenticada, armazenamento criptografado, políticas, gateway, quotas, idempotência e auditoria.
- **Interface futura:** provedores, contas, permissões, conexão/desconexão, diagnóstico e histórico sem tokens.
- **Regra:** segredos ficam no backend. Conta persistida não significa capacidade ativa.

### Biblioteca / conhecimento
- **Entrada:** artefato, evento selecionado ou conhecimento validado.
- **Saída:** registro pesquisável, versionado e relacionado à operação de origem.
- **Interface futura:** pesquisa, metadados, versões, permissões, relações e histórico.
- **Regra:** Biblioteca Local é memória de trabalho; Biblioteca Central preserva conhecimento validado; nenhuma biblioteca decide nem executa operações.

### Segurança, governança e operações
- **Entrada:** identidade, ação, ambiente, escopo, operação e eventos.
- **Saída:** decisão de acesso, bloqueio, auditoria, diagnóstico ou instrução segura de recuperação.
- **Interface futura:** permissões, aprovações, trilha de auditoria, alertas, parada de emergência e diagnóstico.
- **Regra:** estado em memória é estado em memória; não chamar de backup, auditoria imutável ou recuperação de produção sem persistência e controles implantados.

### Hub / CreationDark
- **Entrada:** navegação, pedido rápido e inventário de módulos.
- **Saída:** encaminhamento ao app correto e informação sobre itens que exigem ação.
- **Interface:** preservar o visual atual. A documentação de requisitos futuros não autoriza criar novas telas nesta fase.
- **Regra:** inventário local não é sincronização, execução nem promoção automática.

### Ruan / apps privados
- **Pessoal:** Financeiro e Tarefas.
- **Shadow/darkEye:** app separado, conceito próprio de navegador/overlay; lógica futura não entra nesta etapa.
- **Regra absoluta:** fora do runtime WordDark; sem dependência inversa e sem exposição de dados pessoais.

## 4. Estado real da publicação YouTube

| Peça | Estado |
|---|---|
| OAuth e persistência criptografada da conexão | Implementação backend existente; requer configuração e validação de infraestrutura real |
| Adaptador YouTube resumível | Implementado como módulo server-side; testes usam mocks |
| Portão de autorização | Implementado com dependências injetadas |
| Store de publicação Firestore | Implementado para idempotência, quotas e auditoria; testes locais usam Firestore falso |
| Runtime de composição | Conecta portão, store, conexão e adaptador; não está exposto por HTTP |
| Autenticação/identidade operacional real | Ainda precisa ser conectada ao provedor de identidade confiável |
| Aprovação operacional real | Ainda precisa ser ligada à fonte canônica de aprovações do WordDark |
| Conexão de capacidade do Core/gateway | Ainda precisa de integração e teste ponta a ponta |
| Endpoint de publicação | **Não existe; não criar/ativar até os bloqueios acima serem concluídos** |
| Publicação automática | **Desativada; manual é o padrão** |

## 5. Contrato comum obrigatório

Todo app precisa definir antes de ganhar uma interface:

1. **Dono funcional** e fronteiras.
2. Entrada validada e origem dos dados.
3. Saída com estado e referência de operação.
4. Serviços/Core que pode chamar.
5. Identidade, permissões e capacidades necessárias.
6. Comportamento TEST sem ações externas.
7. Falhas, repetição segura, idempotência e cancelamento.
8. Dados visíveis versus segredos/dados privados.
9. Testes que comprovam o contrato.
10. Requisitos da interface futura — sem construir a interface agora.

## 6. Ordem bruta de execução

1. **Fechar o contrato de identidade, aprovação e permissão operacional real.**
2. Integrar o runtime de publicação ao gateway e à conexão persistida, ainda sem endpoint público.
3. Fazer testes ponta a ponta com simuladores, incluindo duplicidade, quota, falha de rede e reentrada.
4. Validar armazenamento e permissões no ambiente de nuvem real antes de usar tokens ou publicar.
5. Consolidar Dark Factory como produtora independente de distribuição.
6. Consolidar pedidos Terra, empresa social/comercial e o fluxo de resultados.
7. Consolidar biblioteca, auditoria e recuperação.
8. Só após contratos estáveis, criar as interfaces conforme `APP-INTERFACE-BRIEFS.md`.

**Regra de avanço:** implementação → teste → auditoria → integração controlada. Não pular diretamente de um arquivo criado para uma declaração de prontidão.

## 7. Verificação ponta a ponta da cadeia de conhecimento

O teste `darknet/darknet-knowledge-runtime.integration.test.js` cobre em conjunto:

1. Conta de provedor e capacidade `KNOWLEDGE_RESEARCH` no registro de conexões de teste.
2. Pesquisa passando pelo gateway da Central de Conexões e pelo adaptador de provedor.
3. Normalização da fonte e validação de HTTPS, conteúdo e declaração de direitos.
4. Autenticação de serviço, autorização e auditoria antes da entrada no WordDark.
5. Persistência atômica simulada, deduplicação e estado inicial pendente de revisão.
6. Revisão autenticada, aprovação identificável, promoção para `VALIDATED` e arquivo canônico idempotente.
7. Consulta autorizada e auditada apenas dos registros validados.

**O que essa evidência prova:** os contratos e a composição conseguem trabalhar juntos sob dependências controladas de teste.

**O que ela não prova:** credenciais reais, rede externa, IAM, regras do Firestore real, identidade operacional real, configuração dos handlers de API do usuário ou operação em produção. Esses pontos precisam ser validados em staging com as conexões já configuradas e sem publicar, pagar ou movimentar dinheiro.

## 8. Ordem de fechamento antes da primeira operação comercial

1. Executar a suíte completa em CI no commit atual e resolver todos os bloqueios.
2. Conferir cada setor pelo contrato comum: entrada, autorização, estado, saída, falha, repetição e auditoria.
3. Integrar o Hub ao Core por backend autenticado; manter rascunhos locais identificados como locais até essa etapa.
4. Ligar os handlers das APIs existentes à Central de Conexões, um provedor por vez, começando por pesquisa/leitura sem efeitos externos.
5. Confirmar persistência, identidade, aprovação e auditoria em staging.
6. Fazer um ensaio operacional interno: pedido → classificação → capacidade do Céu → resultado → revisão → biblioteca/histórico.
7. Escolher uma entrega comercial pequena que possa ser feita manualmente, com custo e critérios de aceite registrados.
8. Só automatizar uma etapa após comprovar que ela economiza tempo/custo e mantém aprovação humana onde há impacto externo.

**Critério de conclusão:** integração testada e rastreável, não apenas documentada; qualquer serviço sem evidência permanece marcado como preparado, parcial ou desativado.
## 9. Matriz geral de integração — estado honesto

| Bloco | O que já existe | Estado verificável | Bloqueio para operação real |
|---|---|---|---|
| **Ruan** | App pessoal, Pessoal, Tarefas, Shadow/DarkEye e testes de fronteira | Estrutura e isolamento testados; dados principalmente locais | Não exige integração com WordDark; segurança/sincronização pessoal são etapas próprias |
| **Ruan Hub** | Pedidos locais, adaptador de controle e runtime backend autenticado por dependência injetada | Rascunhos locais; runtime/testes de controle em TEST, desligados por padrão | Identidade real, auditoria/idempotência de nuvem, aprovação canônica e rota de serviço ainda não conectadas |
| **WordDark Core** | Operação, catálogo de capacidades, segurança, coordenação e runtime | Fluxo interno exercitado por testes de integração em TEST | Composição de produção precisa ser ligada a identidade, persistência e fonte de aprovações reais |
| **Central de Operações / Rodovia** | Registro, roteamento, comunicação e retorno de resultados | O ensaio OP-001 cobre ida, execução e retorno com módulos simulados | Falta ligar o fluxo ao Hub autenticado e a fontes externas reais, sem pular autorização |
| **Céu / Dark Factory** | Motores de produção e contratos de renderização de texto, imagem, vídeo e áudio | Módulos e um fluxo de produção de teste existem | A cobertura e a qualidade devem ser verificadas por tipo de entrega; produção não equivale a publicação/distribuição |
| **Terra** | Engines de entidades, necessidades e operações comerciais | Estrutura e testes existem; fluxo comercial ainda parcial | Cliente real, pedido aprovado, aceite, entrega e registro de custo precisam de procedimento operacional |
| **Central de Conexões** | OAuth Google backend, armazenamento criptografado Firestore/KMS, runtime de publicação server-side e gateway backend de pesquisa persistida para a Darknet | Contratos e testes com dependências simuladas; o gateway de pesquisa lê o store persistido e não expõe tokens | Handlers reais de pesquisa, identidade/autorização/auditoria de produção e staging ainda faltam; publicação não está unificada ao gateway persistido e segue manual |
| **Biblioteca / conhecimento** | Registro pendente, revisão, arquivo central e adapters duráveis | Contratos e testes por componente; foi adicionado teste ponta a ponta com gateway e armazenamento de teste | O novo teste integrado ainda precisa ser executado no CI; Firestore/IAM e auditoria reais precisam de validação em staging |
| **Darknet** | Navegação modular, plugins, políticas e ponte de conhecimento | Testes de módulos; transportes e execução de plugins permanecem desligados | Adaptadores reais, autorização backend e transporte controlado ainda não estão ativados |
| **Darkbank** | Conceito e estrutura para controles financeiros internos do mundo | Não deve ser tratado como banco real nem como fluxo de dinheiro ativo | Definir e testar livro-caixa interno, categorias, conciliação, aprovação e relatório; nenhuma custódia ou movimentação externa |
| **Shadow / DarkEye** | App privado separado e núcleo experimental | Testes próprios; sem dependência do WordDark | Evolução independente, sem integrar dados pessoais automaticamente ao mundo |

### Regra para declarar um bloco concluído

Um bloco só passa de **preparado** para **integrado** quando seu contrato é consumido pelo próximo bloco, os testes de sucesso e falha passam e o estado retornado corresponde à operação real. Só passa para **operacional** quando identidade, autorização, persistência, auditoria e ambiente real foram validados. Uma simulação, uma tela ou um registro CONNECTED local não satisfazem esse critério.

### Próximo caminho de menor risco

1. Executar a suíte atual no commit mais recente e corrigir qualquer falha.
2. Fechar o backend autenticado do Hub → Core e validar consultas/submissões em TEST.
3. Validar a composição server-side da Central de Conexões persistida → provider adapter → Darknet → intake durável, sem expor tokens ao navegador.
4. Validar o ciclo interno pedido → execução → revisão → resultado → biblioteca.
5. Fazer uma entrega comercial manual de baixo custo, registrar tempo/custos/aceite e só então automatizar etapas comprovadamente repetitivas.

## 10. Fechamento da fronteira Darknet → Central de Conexões

Foi adicionado `core/connections/persisted-knowledge-gateway.js` como gateway exclusivo de backend para pesquisa de conhecimento. Diferentemente do gateway legado/local usado em testes de interface, ele lê metadados e tokens pelo `connectionStore` persistido, exige identidade de serviço, autorização e auditoria, permite apenas `SEARCH_KNOWLEDGE` e `FETCH_KNOWLEDGE`, e filtra campos sensíveis da resposta. O pipeline agora encaminha o contexto confiável gerado pelo runtime ao provedor sem colocá-lo no payload de pesquisa.

**Situação:** contrato, teste de isolamento de segredos e teste integrado gateway persistido → intake → revisão → arquivo → busca validada adicionados; ativação continua desligada por padrão. Ainda dependem de configuração de backend: autenticação real, política de autorização, auditoria durável, concessão explícita de `KNOWLEDGE_RESEARCH` à conta persistida, handlers reais dos provedores, IAM/KMS/Firestore e teste em staging. Isso não ativa pesquisas externas nem publicação.


## 11. Composição de controle do Hub → Core

`core/connections/ruan-hub-control-runtime.js` agora compõe o adaptador existente com autenticação de operador feita no backend. O runtime falha fechado se faltarem autenticador, política de autorização, auditoria durável, idempotência durável/atômica, catálogo público ou centro de operações. Mantém o ambiente `TEST`, sem rota HTTP e desligado por padrão. Os testes cobrem identidade ausente, autorização negada, submissão em TEST e filtragem de campos de operação.

A composição não equivale a integração remota ativa: o Hub ainda guarda pedidos localmente até existir backend autenticado e persistência reais.


## 11. Composição server-side da pesquisa de conhecimento

Foi adicionado `darknet/darknet-knowledge-server-composition.js` para fechar o fio entre a conexão persistida e o runtime de conhecimento, sem criar uma segunda central:

- recebe o `connectionStore` server-side já usado pelo OAuth/Firestore;
- monta handlers de pesquisa por `providerId` através do contrato `knowledge-search-adapter`;
- compõe `persisted-knowledge-gateway`, que exige conta persistida, capacidade explícita `KNOWLEDGE_RESEARCH`, identidade confiável, autorização e auditoria;
- entrega somente os resultados normalizados ao pipeline Darknet; credenciais ficam no contexto interno do backend;
- exige o conjunto de persistência, revisão, autorização e arquivo canônico do runtime durável antes de permitir `enabled: true`;
- não devolve o gateway interno, não cria rota HTTP e permanece desativado por padrão.

O teste `darknet/darknet-knowledge-server-composition.test.js` cobre a composição usando dependências simuladas, incluindo rejeição de identidade forjada, leitura da credencial apenas no handler server-side, auditoria e resultado sem token. Isso fecha a composição de código para pesquisa de conhecimento; **não** prova que um handler de API real, IAM, Firestore/KMS, identidade ou política de aprovação do projeto Cloud estejam configurados. Essa confirmação continua sendo um ensaio separado em staging.
