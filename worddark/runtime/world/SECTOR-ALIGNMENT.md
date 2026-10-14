# WordDark — alinhamento bruto dos setores

**Objetivo:** consolidar responsabilidades e fronteiras antes de ampliar funcionalidades. Este documento não cria interfaces e não declara um módulo pronto para produção apenas porque seu arquivo existe.

## Contrato canônico de publicação

O catálogo `worddark/runtime/world/core/capability-catalog.js` define `CONTENT_PUBLICATION` como capacidade do Core. `CONTENT_PUBLISH` é uma ação de transporte, não um nome alternativo da capacidade. A Central de Conexões deve preservar essa distinção: `action=CONTENT_PUBLISH` mapeia para `capability=CONTENT_PUBLICATION`. A conexão OAuth recém-salva permanece sem capacidades concedidas até existir um fluxo de concessão confiável; o escopo OAuth `youtube.upload` sozinho não concede permissão operacional.

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
- **Hub/CreationDark:** manter o visual atual e usar o inventário para triagem, não como runtime ou autoridade.

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
