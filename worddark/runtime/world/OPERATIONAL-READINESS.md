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
| **Ruan Hub** | UI local, adaptador e runtime de controle com testes | Pedido pode ser preparado localmente; contrato backend está isolado e desligado por padrão | Sessão autenticada real, autorização, aprovação, auditoria durável, idempotência durável/atômica e transporte backend; pedidos locais não são execução remota |
| **WordDark Core** | Runtime, contratos, catálogo de capacidades, operações, rodovia e coordenação | Há testes de operação integrada e fronteiras | Fazer inventário de consumidores para evitar motores paralelos/legados; verificar composição única usada pelo caminho real de operação |
| **Céu** | Motor de preparação e catálogo de capacidades | Prepara planos e recebe operações por contratos testados | Confirmar cada executor concreto e a passagem de artefatos no caminho usado para entregar um trabalho vendável |
| **Dark Factory** | Setores de conteúdo e renderizadores com testes próprios | Produção de certos artefatos pode ser testada localmente; aprovação e publicação permanecem separadas | Executar bateria completa por tipo de artefato; confirmar armazenamento, revisão, entrega e limites reais do dispositivo/servidor |
| **Terra / comercial** | Motor de leads, ofertas, propostas e pedidos | Fluxo de dados pode ser exercitado localmente | Persistência multiusuário, aprovação de proposta, confirmação do cliente, cobrança e estado de entrega ainda precisam de integração operacional validada |
| **Marketing e canais sociais** | Responsabilidades e capacidades documentadas | Podem alimentar a esteira de preparação | Contas, métricas e publicação reais não devem ser inferidas da presença de módulos; manter revisão e envio manuais |
| **Cidade de Compras** | Estrutura separada, indicada como desenvolvimento em `develop` | Não é fonte do Core ativo | Não misturar nem promover para o Core sem revisão, migração explícita e testes |
| **Central de Conexões** | Gateway, contratos, armazenamento OAuth criptografado e controles de capacidade existem | Testes exercitam registro, autorização e adapters simulados | Conectar os handlers reais já configurados; validar Firestore/KMS/IAM, identidade, rotação de credenciais, auditoria e comportamento no ambiente implantado. Registro de conta não concede capacidade por si só |
| **Publicação YouTube** | Publisher e runtime backend com gate, quota, idempotência e auditoria | O fluxo é testável com dependências simuladas; a publicação permanece manual por padrão | Fonte real de identidade/aprovação, conexão persistida, escopo e capacidade concedida, armazenamento transacional e teste em staging; sem ativação automática |
| **Darknet** | Sistema independente, pipeline de conhecimento e composição server-side | Há testes de integração da pesquisa ao intake e arquivo usando mocks | Conectar os providers reais da Central de Conexões, autenticação/autorização/auditoria duráveis e Firestore/IAM; sem rota HTTP ativa e desligada por padrão |
| **Biblioteca central** | Contratos de intake durável e adapters Firestore | Validação, revisão, idempotência e arquivo têm cobertura de contrato | Instância real de Firestore, índices/permissões/retention, monitoramento e teste concorrente no projeto de nuvem |
| **Segurança e auditoria** | Gates, contratos e testes de negação existem | Os testes demonstram os comportamentos com dependências controladas | Ligar identidade, aprovações, auditoria e idempotência aos serviços reais; não tratar flags ou mocks como controles de produção |
| **Darkbank** | Responsabilidade financeira interna definida na arquitetura | Serve como direção para controle financeiro do mundo | Integrar primeiro um livro-caixa/razão interno com receitas, custos, taxas, horas, reservas, obrigações e reconciliação; não é banco autorizado nem movimenta dinheiro de clientes |
| **Ruan Financeiro** | App pessoal separado do Darkbank | Organização pessoal independente | Não misturar seus registros com caixa do WordDark nem assumir movimentação bancária real |
| **Comercialização** | Plano de operação sem investimento inicial documentado | Oferta piloto, prospecção, aceite, produção e entrega podem começar manualmente | Registrar resultado de cada trabalho e só automatizar etapas repetíveis depois de validar demanda, margem e qualidade |

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
