# Shadoweb — Mundo Conectado

Shadoweb é um aplicativo convencional de navegação e acesso a serviços, personalizável por perfil. A primeira versão é local-first e foi feita para uso pessoal antes de ser preparada para outros usuários.

## Módulos

- **Browser / Address:** pesquisa web, abertura de endereços HTTPS, favoritos, histórico, atalhos locais e bloqueio de esquemas perigosos e destinos locais/privados.
- **World:** catálogo inicial de serviços e sistemas do ecossistema, com estados reais de conexão.
- **Connect:** registro dos conectores disponíveis e controles para ativar/desativar.
- **Gate:** permissões explícitas por conector e escopo.
- **Bridge / API Gateway:** contrato versionado, validação de entrada, execução apenas de conectores registrados, timeout e retorno padronizado.
- **Plugin Manager:** importa manifestos declarativos e valida permissões; não executa JavaScript arbitrário.
- **Knowledge:** biblioteca pessoal de notas, pesquisa, importação e exportação local.
- **darkEye:** painel contextual inicial demonstrativo; ainda não lê automaticamente outras páginas nem se sobrepõe a outros apps.
- **Audit:** trilha local de requisições, permissões e alterações.

## Conectores desta fase

- Pesquisa web: abre um mecanismo selecionado pelo usuário.
- Wikipedia: busca pública sem chave de API; começa desativada e exige ativação e permissão.
- Biblioteca local: pesquisa notas do dispositivo.

Conexões a darkHub e WordDark aparecem como pendentes até existirem endpoints reais com autenticação, autorização e contratos verificados. Não há tokens ou segredos no frontend.

## Segurança e limitações

- Endereços aceitos para navegação são HTTPS; esquemas como `javascript:`, `data:` e `file:` são recusados.
- A API interna não aceita endpoints arbitrários vindos de plugins. Plugins são metadados, não código executável.
- Os dados ficam no armazenamento local do navegador/app e não são sincronizados.
- A auditoria local pode ser apagada ou alterada por quem controla o dispositivo; não é log remoto imutável.
- Esta aplicação web não substitui o motor de navegador do Android/Chrome, não gerencia cookies de sites externos e não pode sobrepor outros apps por si só.
- A CSP permite apenas scripts e estilos locais e a chamada à API pública da Wikipedia.
- O service worker armazena o shell local; pesquisas externas exigem internet.

## Contratos de integração

- [Contrato da API](./API-CONTRACT.md) e [manifesto de plugin](./plugin-manifest.schema.json).
- [Baseline de segurança](./SECURITY-BASELINE.md).
- A especificação HTTP é uma preparação versionada; não existe endpoint público ativo nesta fase.

## Executar localmente

Como há módulos ES e service worker, abra a pasta por um servidor HTTP local (não `file://`). Para a validação automatizada:

```sh
node --test shadoweb/app.test.js shadoweb/structure.test.js
```

O workflow de validação é independente e não publica a aplicação. A criação de APK de teste será validada separadamente.
