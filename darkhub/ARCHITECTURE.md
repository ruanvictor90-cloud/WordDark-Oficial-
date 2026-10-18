# darkHub — arquitetura fechada para a primeira versão APK

## Responsabilidade
darkHub é o aplicativo central privado de criação, organização, testes e acompanhamento do ecossistema. Esta pasta representa o app darkHub. O antigo diretório `hub/` contém a implementação histórica da interface chamada WordDark Hub; ela não deve ser tratada como o APK principal do WordDark.

## Regra WordDark Hub
WordDark Hub permanece como **módulo interno do darkHub**. O APK WordDark será um aplicativo separado, desenvolvido em outra etapa. A ligação entre eles será futura, por contrato versionado, autenticação, autorização e sincronização explícita. Não embutir credenciais nem declarar conexão ativa antes de existir backend e teste de ponta a ponta.

## Aplicativo prioritário: Shadoweb
Shadoweb é um app independente e o foco atual de desenvolvimento. darkHub registra seu estado e as alterações, mas não absorve seu código, não o executa como se fosse um APK dentro do próprio processo e não deve ser necessário para a navegação básica do Shadoweb.

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
- O botão fino "Abrir Shadow" é a entrada da área do assistente; a interface completa será evoluída sem mudar o contrato de controle.

## Criação e gestão de código — workspace local
- `engine/workspace.js` mantém um workspace por aplicativo cadastrado, separado do catálogo e do orquestrador.
- A área Criação permite criar, abrir, editar, salvar, renomear e excluir arquivos; caminhos são relativos, travessia de diretório e acesso à pasta interna `.git` são bloqueados; arquivos de configuração como `.gitignore` e `.github/workflows` são permitidos.
- Limites locais: até 100 arquivos por projeto, 200 KB por arquivo e 2 MB de texto por pacote validado.
- Pontos de restauração guardam o conjunto de arquivos e podem ser restaurados. Importação/exportação de projeto usa pacote JSON versionado.
- A prévia HTML roda em iframe sandbox sem acesso à origem do darkHub, com política de conteúdo que bloqueia conexões externas e formulários. Não é um executor geral nem substitui testes automatizados.
- Validação atual é estrutural: limites, caminhos, entrada comum e alertas de arquivos de segredo/testes. Não afirma que o código compila ou funciona.
- "Preparar pacote" salva um ponto de restauração e exporta o projeto para revisão; não publica no GitHub nem cria um APK.
- Persistência continua local ao navegador/dispositivo. Para colaboração e publicação remota, a próxima etapa será um adaptador versionado para GitHub e CI; tokens de escrita nunca devem ficar no JavaScript do cliente.
