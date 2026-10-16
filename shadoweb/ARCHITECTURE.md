# Shadoweb — arquitetura independente

## Objetivo do produto

Shadoweb é um aplicativo convencional de navegação que evolui para um mundo conectado de aplicativos e serviços. Deve ser personalizável por perfil, permitir integrações por contratos claros e manter cada conector limitado às permissões necessárias. O desenvolvimento permanece isolado em `shadoweb/` e na branch própria até haver uma decisão explícita de integração.

## Linguagem e responsabilidades

- **Shadoweb:** produto principal, experiência de navegação e ponto de entrada do usuário.
- **Browser / Address:** pesquisa, endereços HTTPS, favoritos, histórico e atalhos. Nesta versão, a abertura de páginas é delegada ao navegador do sistema.
- **World:** catálogo de aplicativos e serviços; o estado “conectado” só pode ser exibido quando houver uma verificação real.
- **Connect:** registro e estado dos conectores aprovados.
- **Gate:** verifica permissões explícitas e escopos antes de executar ações.
- **Bridge / API Gateway:** valida o contrato, verifica a ação permitida, encaminha para um executor registrado, aplica timeout e padroniza o retorno.
- **Plugin Manager:** importa e valida manifestos declarativos; não executa código de terceiros.\n- **Consumer Registry / SDK:** registra aplicativos consumidores, declara capacidades e concede/revoga permissões por app, conector e escopo; a SDK local solicita somente ações já declaradas e autorizadas.
- **Knowledge:** notas e biblioteca local, com pesquisa e importação/exportação.
- **darkEye:** camada contextual independente, atualmente demonstrativa. Leitura de páginas e sobreposição nativa são capacidades futuras sujeitas a implementação e permissão próprias.
- **Audit:** trilha local de requisições, permissões, resultados e alterações relevantes.
- **Native / APK:** empacotamento Android independente, com capacidades nativas avaliadas separadamente.

## Regras de integração

1. Nenhum aplicativo é considerado conectado apenas por estar listado no World.
2. Todo pedido passa pelo Bridge e usa um identificador de conector e uma ação declarada.
3. Um conector deve estar registrado e habilitado e possuir a permissão correspondente.
4. Plugins importados não podem definir endpoints arbitrários nem registrar executores por conta própria.
5. Credenciais e segredos não devem ser incluídos no frontend, no APK ou no armazenamento local comum.
6. Integrações futuras devem usar contratos versionados, autenticação no servidor, autorização por usuário/aplicativo, quotas, limites de requisição e revogação.
7. Shadoweb não acessa dados privados do darkHub, WordDark, Céu ou Terra sem uma integração explícita, autenticada e autorizada.
8. A evolução do darkEye não deve ser confundida com uma capacidade já disponível: páginas web comuns não conseguem sobrepor outros aplicativos nem inspecionar seu conteúdo.

## Estado implementado

- Interface responsiva e navegação por seções.
- Pesquisa e abertura HTTPS, favoritos, histórico, atalhos e preferências locais.
- Catálogo inicial de mundo conectado e conectores.\n- Registro local de apps consumidores, SDK de integração e permissões por aplicativo, além das permissões por conector.
- Bridge local com validação, lista de ações, permissões por escopo, timeout e auditoria.
- Biblioteca local e importação de manifestos declarativos.
- PWA e workflows independentes de teste e APK Android de depuração.

## Não implementado ainda

- Motor de navegador completo embutido e isolamento real de sessões.
- Login de servidor, sincronização entre dispositivos e auditoria remota.
- API HTTP pública, credenciais de desenvolvedor, quotas e gestão remota de aplicações.\n- Registro/autorizações de apps consumidores em servidor: o registro atual é local e não constitui fronteira de segurança contra código executado na mesma origem.
- Integrações reais autenticadas com darkHub/WordDark/Céu/Terra.
- Execução segura de plugins de terceiros.
- Leitura contextual automática de páginas e sobreposição nativa darkEye.
- Assinatura e distribuição de APK de produção.

## Etapas para a versão pública

1. Revisar comportamento no Android e nos navegadores móveis.
2. Fechar testes de navegação, armazenamento, permissões, timeout, importação/exportação e modo offline.
3. Definir e implementar a arquitetura de servidor antes de ativar endpoints HTTP públicos.
4. Realizar revisão de segurança e privacidade, inclusive retenção e exclusão de dados.
5. Implementar autenticação, autorização, limites de uso, revogação e monitoramento.
6. Validar o APK em dispositivos reais; assinar a versão de produção somente após os critérios de lançamento.

## Segurança da versão atual

A navegação aceita HTTPS e recusa esquemas perigosos e destinos locais/privados conhecidos. A CSP limita recursos externos; o service worker guarda somente recursos GET do próprio aplicativo. Favoritos, histórico, permissões e auditoria locais não constituem armazenamento inviolável. O perfil visual altera preferências de apresentação, não isola cookies nem sessões.
