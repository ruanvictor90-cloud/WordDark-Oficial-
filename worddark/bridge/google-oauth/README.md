# WordDark — Google / YouTube OAuth Bridge

Primeiro backend real da Central de Conexões.

## O que ele já faz

- recebe o authorization code do Google;
- troca o código por tokens no servidor;
- consulta o canal YouTube autenticado;
- devolve somente dados públicos/operacionais do canal;
- nunca devolve access_token ou refresh_token ao navegador;
- rejeita origens diferentes da origem autorizada.

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

