# WordDark — Google / YouTube OAuth Bridge

Primeiro backend real da Central de Conexões.

## O que ele já faz

- recebe o authorization code do Google;
- troca o código por tokens no servidor;
- consulta o canal YouTube autenticado;
- devolve somente dados públicos/operacionais do canal;
- nunca devolve access_token ou refresh_token ao navegador;
- rejeita origens diferentes da origem autorizada.

## Interface da Central de Conexões

A interface agora envia o código de autorização de uso único para `codeEndpoint` em `worddark/runtime/world/core/connections/connection-config.js`, usando `X-Requested-With`. O endpoint permanece vazio por padrão até que o backend real esteja implantado e tenha um URL HTTPS confirmado. Não aponte a interface para um serviço desconhecido.

O bridge ainda responde com `persistence: PENDING`: ele confirma a autorização e consulta metadados do canal, mas não grava tokens nem registra uma conexão durável. A interface, portanto, não deve marcar a conexão como ativa até que a persistência segura e o registro central estejam implementados.

## Ainda pendente antes de produção

A persistência segura da conexão ainda não está ativa. Os tokens existem somente durante a requisição e não são gravados.

A próxima camada deve usar armazenamento de segredos/estado apropriado (por exemplo, Secret Manager + banco seguro) e registrar a conexão no registro central.

## Deploy sugerido

Cloud Run é o alvo do bridge. O GitHub Pages continua sendo somente a interface pública.

Variáveis:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- WORDDARK_ALLOWED_ORIGIN

