# darkHub — arquitetura fechada para a primeira versão APK

## Responsabilidade
darkHub é o aplicativo central privado de criação, organização, testes e acompanhamento do ecossistema. Esta pasta representa o app darkHub. O antigo diretório `hub/` contém a implementação histórica da interface chamada WordDark Hub; ela não deve ser tratada como o APK principal do WordDark.

## Regra WordDark Hub
WordDark Hub permanece como **módulo interno do darkHub**. O APK WordDark será um aplicativo separado, desenvolvido em outra etapa. A ligação entre eles será futura, por contrato versionado, autenticação, autorização e sincronização explícita. Não embutir credenciais nem declarar conexão ativa antes de existir backend e teste de ponta a ponta.

## Escopo atual: finalizar darkHub
A etapa atual trabalha somente no darkHub: estrutura de criação, workspace, validação local, preparação de versões, painel e Rodovia. O WordDark Hub será trabalhado depois que esta etapa for concluída; Shadoweb permanece fora do escopo de implementação atual. Não iniciar a compilação ou geração de APK sem solicitação explícita.

## Camadas
- `app.js`: apresentação e navegação.
- `engine/runtime.js`: motor local de apps, alterações, releases, conexões futuras e backup.
- `manifest.webmanifest`, `sw.js`, `icon.svg`: experiência instalável e cache do shell.
- Persistência atual: armazenamento local versionado (`darkhub.runtime.v1`); não é sincronização multi-dispositivo.
- `engine/runtime.test.js`: testes de contrato e fluxo.

## Fluxo de alteração
Criar → Em revisão → Validado → Finalizar versão → Preparado para teste. Finalização é bloqueada até a alteração estar validada. Gerar um registro de release não significa que o APK foi compilado, assinado ou publicado.

## Empacotamento Android
A pasta é uma base web instalável e preparada para um invólucro Android. Para produzir um APK nativo distribuível, o próximo passo técnico é configurar Capacitor (ou um wrapper Android equivalente), definir applicationId, SDK e assinatura, executar build e instalar/testar no aparelho. Não versionar chaves de assinatura, tokens ou segredos no repositório. GitHub Pages/PWA por si só não gera um APK Android nativo.

## Limites de segurança
- Os dados atuais são locais ao dispositivo/perfil do navegador.
- O backup JSON exportado pode conter metadados internos; deve ser guardado com cuidado.
- Sem backend autenticado, conexões externas ficam como planejadas/desativadas.
- Releases são registros locais; não substituem testes, compilação, assinatura nem distribuição.

## Shadow — assistente e gestor do ecossistema
- `engine/shadow.js` é a camada de controle do Shadow; não é, por si só, um modelo de linguagem.
- A primeira implementação funciona sem custo: recebe solicitações localmente, registra estado e, após aprovação explícita, transforma o pedido em tarefa na fila do orquestrador.
- Nenhuma solicitação aprovada executa código, chama serviços externos, altera arquivos ou publica releases automaticamente.
- Limites iniciais: rede e APIs pagas desativadas, execução autônoma desativada, aprovação humana obrigatória e estado guardado no armazenamento local.
- O contrato permite conectar futuramente um adaptador de IA gratuito ou pago sem reescrever a interface nem a fila. Credenciais devem ficar em backend/secret store seguro; nunca no JavaScript distribuído ao cliente.
- Antes de ativar ferramentas reais, cada conector precisará de permissões específicas, validação de entradas, registro de auditoria, limite de escopo e testes. Publicação e ações destrutivas exigirão confirmação separada.
- Shadow fica acessível pelo menu e não ocupa uma terceira ação principal na tela inicial. A implementação atual é uma base de planejamento local, não um assistente de IA conectado.

## Criação e gestão de código — workspace local
- `engine/workspace.js` mantém um workspace por aplicativo cadastrado, separado do catálogo e do orquestrador.
- A área Criação permite criar, abrir, editar, salvar, renomear e excluir arquivos; caminhos são relativos, travessia de diretório e acesso à pasta interna `.git` são bloqueados; arquivos de configuração como `.gitignore` e `.github/workflows` são permitidos.
- Limites locais: até 100 arquivos por projeto, 200 KB por arquivo (medidos em bytes UTF-8), 2 MB por projeto e retenção de até 50 snapshots por projeto.
- Pontos de restauração guardam o conjunto de arquivos e podem ser restaurados. Importação/exportação de projeto usa pacote JSON versionado.
- A prévia HTML roda em iframe sandbox sem acesso à origem do darkHub, com política de conteúdo que bloqueia conexões externas e formulários. Não é um executor geral nem substitui testes automatizados.
- Validação atual é estrutural: limites, caminhos, entrada comum e alertas de arquivos de segredo/testes. Não afirma que o código compila ou funciona.
- "Preparar pacote" salva um ponto de restauração, exporta o projeto e cria um manifesto versionado com app/versão, ID do snapshot, resultado da validação estrutural e lista de arquivos/revisões. Isso melhora a rastreabilidade, mas não publica no GitHub nem cria um APK.
- A exportação geral reúne runtime, orquestrador, Shadow, workspace e estado da Rodovia num JSON local. A restauração integral desse pacote ainda não está disponível; não anunciar o arquivo como backup restaurável até essa função existir.
- O workspace aplica limites por bytes UTF-8, verifica também o tamanho total ao importar projetos e mantém até 50 snapshots por projeto para evitar crescimento local ilimitado.
- Persistência continua local ao navegador/dispositivo. Para colaboração e publicação remota, a próxima etapa será um adaptador versionado para GitHub e CI; tokens de escrita nunca devem ficar no JavaScript do cliente.


## Rodovia — transporte compartilhado do ecossistema

- `engine/rodovia.js` define o envelope de mensagem e a camada de transporte local compartilhada.
- Todo envio usa `messageId`, `requestId`, origem, destino, serviço, payload e data; `routeId` é associado quando uma rota ativa permite o transporte.
- A Rodovia adapta o catálogo da Central para localizar capacidades ativas por identificador/nome; se não encontrar uma capacidade, devolve o requisito para a área de criação sem fingir que existe executor.
- A Rodovia mantém lista explícita de rotas e endpoints, valida o tamanho do payload, bloqueia repetição do mesmo `messageId` e registra eventos de entrega/falha sem copiar o payload para a trilha de auditoria.
- A trilha tem limite configurável e é consultável por `requestId` para rastrear o percurso de uma solicitação e seus resultados.
- A Rodovia mantém um registro local de requerimentos com estados permitidos (`received`, `needs-creation`, `awaiting-approval`, `ready`, `in-transit`, `delivered`, `completed`, `blocked`, `failed`, `cancelled`) e histórico de transições. O registro usa armazenamento local quando disponível e fallback em memória; ainda não é sincronização remota nem uma fila durável entre dispositivos.
- O painel do darkHub permite registrar um requisito, consultar o catálogo local e visualizar seu estado. Encontrar uma capacidade apenas leva o requerimento a `awaiting-approval`; não concede autorização nem executa a operação.
- Um requerimento pode ser associado a um projeto e a um snapshot/versão do workspace. Também pode guardar o resultado da validação estrutural (data, erros e avisos limitados), mantendo trilha entre necessidade, projeto e versão revisada. O vínculo precisa ser informado pela camada responsável; a Rodovia não inventa nem verifica a existência do projeto.
- O manifesto do pacote é um registro de revisão local. Validação estrutural aprovada não significa que os testes automatizados foram executados, que o código compila, nem que uma publicação está autorizada.
- A Rodovia transporta e rastreia; **não concede permissões, não decide regras de negócio e não executa a operação de destino**. O endpoint registrado apenas recebe a mensagem; a decisão de autorizar e a execução permanecem nas camadas responsáveis.
- A implementação atual é transporte **local no processo**, com rotas e eventos em memória. Ainda não é uma fila distribuída, não sincroniza dispositivos e não fornece persistência durável. Uma futura ponte remota deverá usar autenticação, autorização, contratos versionados, limites, retries/ACK e credenciais mantidas fora do cliente.
- Os aplicativos devem depender do contrato da Rodovia, não importar diretamente a implementação interna uns dos outros. O catálogo/Central identifica capacidades e destinos; a Rodovia transporta a mensagem pelo caminho permitido.
- `engine/rodovia.test.js` verifica rotas ativas/suspensas, validação, entrega, falha de endpoint, payload excessivo, duplicidade e rastreabilidade.
