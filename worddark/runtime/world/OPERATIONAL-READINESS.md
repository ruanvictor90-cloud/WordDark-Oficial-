# WordDark — auditoria de integração e prontidão operacional

**Finalidade:** registrar, bloco por bloco, o que existe, o que conversa por contrato, o que ainda está isolado e o que impede o uso operacional. Este documento é uma fotografia de engenharia; não substitui os testes nem declara prontidão de produção.

## Estados usados

- **Implementado em código:** existe módulo e contrato no repositório.
- **Integrado em teste:** há testes automatizados de colaboração entre os módulos, normalmente com dependências simuladas.
- **Pendente de ambiente real:** faltam identidade, permissões, segredos, armazenamento, configuração de provedor, endpoint ou validação no ambiente implantado.
- **Manual por decisão:** o sistema prepara e acompanha, mas uma pessoa confirma a ação externa.

## Matriz bloco por bloco

| Bloco | Estado de código | Integração atual | Bloqueio para operação real |
|---|---|---|---|
| **Ruan privado** | Aplicativo e separação arquitetural definidos | Aplicação pessoal separada do WordDark; vários dados são locais | Persistência/sincronização e segurança real não devem ser presumidas; não compartilhar dados com o mundo automaticamente |
| **Ruan Hub** | UI local, adaptador e runtime de controle com testes | Rascunhos locais continuam locais; runtime de controle foi testado com store Firestore injetável e segue desligado por padrão | Instância Firestore real, sessão/autorização/aprovação reais e transporte backend; pedido local não é execução remota |
| **WordDark Core** | Runtime, contratos, catálogo de capacidades, operações, rodovia e coordenação | CI passou; o caminho comercial integrado usa o Centro de Operações, a Rodovia, a Biblioteca Central e Dark Factory no cenário de teste | Fazer inventário de consumidores para evitar motores paralelos/legados; conectar identidade, aprovação e persistência reais antes de ativar produção |
| **Céu** | Motor de preparação e catálogo de capacidades | Prepara planos e recebe operações por contratos testados | Confirmar cada executor concreto e a passagem de artefatos no caminho usado para entregar um trabalho vendável |
| **Dark Factory** | Setores de conteúdo e renderizadores com testes próprios | Produção de certos artefatos pode ser testada localmente; aprovação e publicação permanecem separadas | Executar bateria completa por tipo de artefato; confirmar armazenamento, revisão, entrega e limites reais do dispositivo/servidor |
| **Terra / comercial** | Motor de demandas, leads, ofertas, propostas e pedidos, com bridges para o Core | CI passou na cadeia demanda → lead → proposta aceita → pedido → Core → Dark Factory em TEST; store Firestore de auditoria/idempotência existe como dependência injetável | Instância e IAM reais, identidade/aprovação, persistência comercial, confirmação do cliente, cobrança, aceite da entrega e registro financeiro ainda exigem validação |
| **Marketing e canais sociais** | Responsabilidades e capacidades documentadas | Podem alimentar a esteira de preparação | Contas, métricas e publicação reais não devem ser inferidas da presença de módulos; manter revisão e envio manuais |
| **Cidade de Compras** | Estrutura separada, indicada como desenvolvimento em `develop` | Não é fonte do Core ativo | Não misturar nem promover para o Core sem revisão, migração explícita e testes |
| **Central de Conexões** | Gateway cliente, contratos, armazenamento OAuth criptografado e controles de capacidade existem | Gateway do navegador agora fica desligado por padrão; gateways server-side têm contratos próprios e testes simulados | Conectar os handlers reais já configurados; validar Firestore/KMS/IAM, identidade, rotação de credenciais, auditoria e comportamento no ambiente implantado. O registro local do navegador não é uma fronteira de confiança; conta persistida não concede capacidade por si só |
| **Publicação YouTube** | Publisher e runtime backend com gate, quota, idempotência e auditoria | O fluxo é testável com dependências simuladas; a publicação permanece manual por padrão | Fonte real de identidade/aprovação, conexão persistida, escopo e capacidade concedida, armazenamento transacional e teste em staging; sem ativação automática |
| **Darknet** | Sistema independente, pipeline de conhecimento e composição server-side | Há testes de integração da pesquisa ao intake e arquivo usando mocks | Conectar os providers reais da Central de Conexões, autenticação/autorização/auditoria duráveis e Firestore/IAM; sem rota HTTP ativa e desligada por padrão |
| **Biblioteca central** | Contratos de intake durável e adapters Firestore | Validação, revisão, idempotência e arquivo têm cobertura de contrato | Instância real de Firestore, índices/permissões/retention, monitoramento e teste concorrente no projeto de nuvem |
| **Segurança e auditoria** | Gates, contratos e testes de negação existem | Os testes demonstram os comportamentos com dependências controladas | Ligar identidade, aprovações, auditoria e idempotência aos serviços reais; não tratar flags ou mocks como controles de produção |
| **Darkbank** | Responsabilidade financeira interna definida na arquitetura | Serve como direção para controle financeiro do mundo | Integrar primeiro um livro-caixa/razão interno com receitas, custos, taxas, horas, reservas, obrigações e reconciliação; não é banco autorizado nem movimenta dinheiro de clientes |
| **Ruan Financeiro** | App pessoal separado do Darkbank | Organização pessoal independente | Não misturar seus registros com caixa do WordDark nem assumir movimentação bancária real |
| **Comercialização** | Plano de operação sem investimento inicial documentado | Oferta piloto, prospecção, aceite, produção e entrega podem começar manualmente | Registrar resultado de cada trabalho e só automatizar etapas repetíveis depois de validar demanda, margem e qualidade |

## Integração Terra → Core → Céu (código atual)

O fluxo comercial agora possui uma ponte controlada de pedido aceito para o Core, com payload de produção explícito para a Dark Factory. A cobertura integrada exercita a criação de lead, qualificação, proposta, aceite, abertura do pedido, autorização do operador, despacho idempotente, roteamento pela Rodovia, execução no executor de conteúdo, retorno do resultado e entrada do pedido em revisão humana.

- Teste: `worddark/runtime/world/earth/commercial-world.integration.test.js`.
- Incluído na suíte `npm test` e no comando `npm run commercial:integration:test`.
- A ponte continua desligada por padrão no uso normal, exige aprovação identificável e executa em `TEST`.
- A conclusão técnica do Core não equivale à entrega ao cliente: o pedido fica em `REVIEW` para validação humana.
- O teste usa identidade, autorização, auditoria, idempotência e infraestrutura de operação simuladas; não comprova configuração real, persistência durável ou prontidão de produção.
- O resultado do CI para o novo head precisa ser confirmado antes de considerar esta integração validada.

## Contrato mínimo de uma operação vendável

Uma entrega só deve ser tratada como operacional quando o caminho abaixo estiver completo, mesmo que algumas etapas sejam manuais:

1. **Entrada:** registrar necessidade, origem, cliente, escopo, prazo e restrições.
2. **Qualificação:** confirmar que o pedido é viável e que a capacidade necessária existe.
3. **Proposta:** definir entregáveis, preço, prazo, revisões e exclusões; obter aceite humano antes de assumir compromisso.
4. **Autorização:** registrar quem aprovou a execução e o que foi autorizado.
5. **Execução:** encaminhar ao setor responsável; preservar IDs, arquivos, versão e estado.
6. **Revisão:** verificar qualidade, direitos de uso e conformidade com o escopo.
7. **Entrega:** enviar ao cliente manualmente e registrar confirmação; não declarar publicação externa sem recibo do provedor.
8. **Fechamento financeiro:** registrar valor recebido, custos diretos, taxas, tributos conhecidos/estimados, horas, retrabalho e saldo disponível.
9. **Aprendizado:** só promover conhecimento revisado à Biblioteca Central; nunca promover automaticamente conteúdo externo sem revisão e direitos adequados.

## Critérios para liberar um bloco

Um bloco passa para o próximo estágio somente quando:
- os testes unitários e de integração pertinentes passam no commit atual;
- os erros, negações, duplicações e tentativas repetidas têm comportamento definido;
- autorização e auditoria são exercitadas nos caminhos que alteram estado ou chamam provedores;
- o caminho de dados não expõe credenciais ou dados de outros setores;
- os testes com mocks são identificados como simulados;
- a validação no ambiente real é registrada separadamente;
- a ativação externa continua desligada até autorização explícita.

## Ordem de trabalho

1. Endurecer e testar a fronteira da Central de Conexões.
2. Confirmar os contratos canônicos de capacidades e estados.
3. Exercitar a operação interna WordDark → Céu → resultado → origem.
4. Fechar Dark Factory para os tipos de entrega que serão comercializados primeiro.
5. Ligar os adapters reais existentes em ambiente de teste, sem publicar ou executar ações externas automaticamente.
6. Fechar o ciclo de Hub com autenticação, aprovação, consulta e auditoria duráveis.
7. Validar o caminho Darknet → conhecimento pendente → revisão → Biblioteca Central.
8. Consolidar o livro-caixa interno do Darkbank e o relatório de margem por trabalho.
9. Iniciar a oferta piloto manual conforme [COMMERCIAL-BOOTSTRAP.md](../../../COMMERCIAL-BOOTSTRAP.md).

## Limites da auditoria

- Um arquivo existir não prova que esteja no caminho de execução.
- Um teste com mocks prova o contrato testado, não a configuração de serviços externos.
- Uma conta OAuth persistida não significa que a capacidade operacional foi concedida.
- Uma solicitação guardada no navegador não foi recebida pelo Core.
- Preparar conteúdo não é o mesmo que publicar.
- Receita recebida não é lucro.
- Nenhuma alteração neste plano autoriza merge, deploy, publicação, gasto com APIs ou movimentação de dinheiro.


## Integração comercial Terra → WordDark Core (nova verificação)

Foi adicionado `core/commercial-order-operation-bridge.js` para encaminhar um pedido comercial aceito da Terra ao Centro de Operações canônico. O adaptador não cria um motor paralelo: resolve explicitamente a ação, encaminha a operação ao Core, exige operador autenticado, aprovação correspondente, autorização, auditoria e idempotência injetadas.

- Estado inicial: desligado por padrão; o contrato mantém o ambiente em `TEST`.
- A proposta precisa estar aceita e o pedido precisa estar em `ORDER_OPEN`.
- O pedido só avança depois que o Core devolve uma operação rastreável com `operationId`: fica em `PLANNED` quando a operação foi aceita, passa a `IN_PROGRESS` quando o Core informa execução em andamento e chega a `REVIEW` quando a operação interna conclui — sem pular a revisão humana nem declarar entrega ao cliente.
- Repetições do mesmo pedido usam uma chave de idempotência baseada no pedido, evitando um segundo despacho quando o armazenamento idempotente honra o contrato.
- O teste cobre modo desligado, autorização negada, aprovação ausente, rejeição do Core, despacho aceito, sincronização do pedido, ausência de ID de operação e repetição.

**Limite importante:** o teste usa Core, autorização, auditoria e idempotência simulados. Esta é a integração de contrato entre Terra comercial e Core, não a ativação do backend real. Antes de habilitar, é necessário injetar autenticação/aprovação/auditoria persistentes e armazenamento idempotente atômico reais, validar o resultado no ambiente de staging e decidir explicitamente a ativação. Não existe endpoint HTTP novo nem efeito externo ativado por este adaptador.

## Integração Terra: demanda capturada → lead comercial

Foi criado `core/earth-commercial-intake-adapter.js` para encaminhar uma demanda já capturada pelo motor da Terra ao motor comercial, preservando o identificador de origem e o contexto do negócio. A demanda muda para `LEAD_CREATED` apenas depois que o lead determinístico é localizado/criado; tentativas repetidas não devem gerar leads duplicados.

- Exige operador autenticado, autorização para intake, auditoria e idempotência injetadas.
- A identidade comercial do solicitante é resolvida por função confiável, não inferida de um campo livre do pedido.
- O lead preserva `sourceDemandId` e `businessContext` para rastreabilidade.
- O adapter fica desligado por padrão e não envia propostas, não inicia execução, não cobra e não habilita vendas.
- Testes cobrem modo desligado, autorização negada, identidade ausente, preservação de origem/contexto e repetição idempotente.

**Limite:** os testes usam dependências simuladas. A ligação com identidade, auditoria e idempotência duráveis reais continua pendente; este contrato não deve ser ativado em produção sem backend confiável e staging.


## Verificação integrada Terra → Comercial → WordDark Core

O teste core/terra-commercial-core.integration.test.js exercita a cadeia de contrato: demanda capturada → lead rastreável → qualificação → proposta → aceite → pedido comercial → autorização explícita → despacho ao Centro de Operações → revisão humana. Ele combina os dois adapters de fronteira e usa um Centro de Operações simulado para isolar a integração comercial.

- A origem sourceDemandId e o contexto comercial são preservados.
- O pedido só é despachado após o aceite comercial e uma aprovação interna identificável.
- A conclusão interna do Core move o pedido para REVIEW, sem declarar que o cliente recebeu a entrega.
- A repetição da mesma demanda/pedido não cria lead nem despacho duplicado no cenário de teste.
- Pagamento e execução externa permanecem desativados.

Este teste comprova a colaboração dos contratos entre Terra e Core com dependências simuladas; não é uma prova de identidade, auditoria ou idempotência duráveis reais, nem substitui o teste separado da operação Core → Dark Factory. A integração só deve ser ativada em backend depois da validação de staging.


## Prova integrada Terra → Comercial → Core → Dark Factory

O teste worddark/runtime/world/earth/commercial-world.integration.test.js agora inicia com uma demanda real do motor Terra, converte-a em lead comercial rastreável, qualifica o lead, cria e aceita a proposta, abre o pedido e usa o bridge para encaminhar a operação ao Centro de Operações real do teste, com a Rodovia, o Core, a Biblioteca Central e a Dark Factory configurados no próprio cenário. Os módulos executores de conteúdo, a identidade, a autorização, a auditoria e a idempotência são simulados.

Essa prova inclui a entrada de demanda e o despacho comercial na mesma cadeia de teste. A execução é controlada em TEST e usa identidade, auditoria e idempotência simuladas; não prova que os serviços de identidade, armazenamento ou auditoria da nuvem estejam ligados. O resultado interno concluído ainda deixa o pedido em REVIEW para revisão humana antes da entrega ao cliente.


## Atualização da matriz após CI — 14/10/2026

A última bateria do CI passou para a integração de código Terra → Comercial → Core → Dark Factory e para a bateria de segurança de runtime. A aprovação refere-se ao ambiente de teste e a dependências simuladas de identidade, autorização, auditoria e idempotência. Não equivale a deploy, backend compartilhado ativo, validação de credenciais reais nem autorização para publicação ou cobrança automáticas.

## Endurecimento financeiro do Darkbank — 14/10/2026

A tela financeira continua sendo um registro local de apoio operacional, não um livro contábil persistente de produção. Nesta etapa, foi corrigida uma regra de segurança de cálculo:

- Um pedido com custo de produto ausente/zero é marcado como `PROVISIONAL_COSTS_INCOMPLETE`.
- O pagamento pode ser registrado após confirmação humana, mas o resultado desse pedido não entra no total de resultado estimado com custos completos.
- Nenhuma parcela desse pedido é destinada ao Cofre enquanto os custos estiverem incompletos.
- O Cofre ignora alocações históricas de eventos marcados com custos incompletos na soma exibida.
- A interface separa **Resultado estimado** de **Resultado provisório** e pede revisão dos custos.
- Mesmo quando os custos estão informados, o resultado continua estimado porque a alíquota tributária é uma estimativa e podem existir custos/obrigações não registrados.

Testes de script e alinhamento arquitetural protegem essas regras. Isso reduz a chance de tratar faturamento ou margem incompleta como dinheiro disponível para reinvestimento, mas não substitui conciliação bancária, contabilidade, persistência de servidor nem apuração fiscal.

## Persistência compartilhada para Hub e pontes operacionais — 14/10/2026

Foi adicionado `core/connections/firestore-operation-control-store.js` como adapter reutilizável para auditoria append-only e idempotência atômica em Firestore. Ele é injetado pelo backend, não inicializa credenciais, não abre rota HTTP e não ativa os consumidores sozinho.

- O Ruan Hub, a ponte de pedido comercial Terra → Core e a ponte demanda Terra → lead agora fornecem fingerprints estáveis ao contrato `executeOnce`; reutilizar a mesma chave com outro conteúdo gera conflito em vez de reaproveitar silenciosamente uma execução diferente.
- Repetições concorrentes encontram `IN_PROGRESS` e não chamam novamente a função de operação. Respostas persistidas são sanitizadas para retirar campos com aparência de segredo.
- Eventos de auditoria aceitam apenas uma allowlist de metadados e não armazenam payloads, tokens ou conteúdo do pedido.
- Se o processo cair depois de reservar a chave, o estado fica bloqueado em `IN_PROGRESS`; não existe recuperação automática porque repetir uma operação de resultado incerto pode duplicar efeitos. A revisão/reconciliação precisa ser explícita.
- `operation-control-integration.test.js` exercita o mesmo store injetado no runtime do Hub e na ponte comercial, verifica repetição sem segundo despacho e confirma que a conclusão do Core para em `REVIEW`.

**O que isso fecha:** existe agora uma implementação Firestore reutilizável para os contratos de auditoria/idempotência que antes precisavam ser fornecidos como doubles nos testes. **O que continua pendente:** conectar uma instância Firestore autorizada no backend real, identidade/sessão e política de aprovação reais, regras IAM/retention/monitoramento e validação de staging. A integração permanece em `TEST`, sem endpoint, publicação ou envio automático.

## Endurecimento da Central de Conexões — 14/10/2026

O gateway carregado pela interface da Dark Factory (connection-gateway.js) agora usa enabled=false por padrão e devolve EXTERNAL_CONNECTION_GATEWAY_DISABLED antes de consultar credenciais ou executar adapters. Seu estado declara explicitamente productionSafe=false e serverGatewayRequiredForProduction=true.

O teste registra um adapter deliberadamente e confirma que ele não é chamado enquanto o gateway está desligado. Os testes funcionais que exercitam o gateway habilitam-no explicitamente com dependências de teste.

Esta alteração evita que a instância client-side/local seja confundida com o limite de segurança de produção. Ela não desliga nem substitui os runtimes server-side próprios de publicação e pesquisa; esses continuam dependendo de autenticação, autorização, auditoria, segredos e persistência reais.

## Validação pendente da última alteração

A estrutura do `package.json`, o registro do loader ESM e as referências entre os novos testes foram conferidos no repositório. Porém, o GitHub não retornou workflow runs nem status checks para o head desta última alteração; por isso, **não declaro que os novos testes executaram ou passaram**. Antes de merge ou ativação, executar `npm run operation-control:test` e a suíte completa `npm test` em um checkout de trabalho/CI e revisar eventuais falhas.
