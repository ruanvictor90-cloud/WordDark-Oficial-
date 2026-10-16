# Shadoweb — navegador e mundo conectado

Shadoweb é um aplicativo independente e personalizável. Combina uma experiência convencional de navegação com uma camada organizada para descobrir e conectar aplicativos, serviços e ferramentas. A primeira versão prioriza uso local e controle do usuário; a arquitetura prevê crescimento para múltiplos perfis e integrações externas.

## Vocabulário oficial

- **Shadoweb:** aplicativo e ambiente de navegação.
- **Mundo conectado (World):** catálogo de aplicativos e serviços, mostrando estados reais de integração.
- **Conector (Connect):** adaptador registrado que executa uma capacidade específica.
- **Gate:** autorização por conector, usuário e escopo.
- **Bridge:** porta de comunicação que valida pedidos e encaminha apenas ações permitidas.
- **Plugin Manager:** catálogo e gestão de extensões declarativas.
- **Knowledge:** biblioteca pessoal local.
- **darkEye:** camada contextual da Shadoweb, com recursos que serão ampliados conforme as capacidades da plataforma.
- **Audit:** registro de eventos e decisões de segurança.

Os nomes dos módulos são estáveis na arquitetura. A interface voltada ao usuário deve usar português claro, reservando os nomes técnicos para contextos de configuração e desenvolvimento.

## Recursos disponíveis nesta versão

- Pesquisa web por mecanismo escolhido e abertura de endereços HTTPS.
- Favoritos, histórico, atalhos e perfis de apresentação guardados localmente.
- Catálogo inicial de sistemas e conectores.
- Permissões por escopo, validação de requisições, lista de ações permitidas, timeout e auditoria local.
- Pesquisa na biblioteca local e importação/exportação de notas.
- Importação de manifestos de plugins em formato declarativo.
- Aplicação web instalável (PWA), shell offline e configuração para gerar APK Android de depuração.

## Conectores e integração

- **Pesquisa web:** abre o mecanismo selecionado pelo usuário.
- **Wikipedia:** pesquisa pública de leitura; começa desativada e exige ativação e permissão.
- **Biblioteca local:** pesquisa notas guardadas no dispositivo.
- **darkHub, WordDark, Céu e Terra:** aparecem como integrações planejadas/pendentes até haver endpoints reais, autenticados e testados. A presença no catálogo não significa conexão ativa.

## Limites importantes

- A navegação desta versão entrega páginas HTTPS ao navegador do sistema; ainda não é um motor de navegador completo embutido.
- Os dados ficam no dispositivo e não são sincronizados entre aparelhos.
- O armazenamento local não é um cofre seguro e a auditoria local pode ser alterada por quem controla o dispositivo.
- darkEye ainda é demonstrativo: não lê automaticamente páginas externas nem se sobrepõe a outros aplicativos.
- Plugins importados são manifestos, não código executável.
- A ponte de API funciona dentro do aplicativo; **não existe servidor HTTP público ativo** nesta versão.
- APK de depuração não é uma versão de produção assinada.

## Contratos e segurança

- [Arquitetura](./ARCHITECTURE.md)
- [Contrato da API e dos conectores](./API-CONTRACT.md)
- [Esquema de manifesto de plugin](./plugin-manifest.schema.json)
- [Base de segurança](./SECURITY-BASELINE.md)

## Validação local

Abra a pasta por um servidor HTTP local (não diretamente por `file://`). Para executar os testes:

```sh
node --test shadoweb/app.test.js shadoweb/structure.test.js
```

Os workflows desta branch validam o código e produzem um APK de depuração; não publicam nem integram automaticamente a Shadoweb ao aplicativo principal.
