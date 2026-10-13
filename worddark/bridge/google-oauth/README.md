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

## Persistência segura preparada

- O bridge só confirma `persistence: PERSISTED` depois de gravar o registro no Firestore.
- O pacote de tokens (incluindo refresh token) é criptografado com Cloud KMS antes de ser armazenado; tokens nunca são devolvidos à página.
- A conexão fica com estado `PERSISTED`, sem capacidades operacionais, até que o registro persistente seja integrado ao gateway central.
- O store de backend agora separa `load()` (somente metadados, sem ciphertext ou tokens) de `loadTokens()` (descriptografia explícita para uso exclusivamente server-side). A interface pública não tem rota para consultar essas credenciais.
- Se o Google não emitir `refresh_token`, a operação para sem declarar a conexão ativa.
- O navegador pede acesso offline e consentimento para permitir a emissão de refresh token.

## Preparação de infraestrutura obrigatória

Variáveis adicionais:
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_KMS_KEY_NAME` — nome completo da chave de criptografia no Cloud KMS
- `WORDDARK_CONNECTION_COLLECTION` — opcional; padrão `worddarkExternalConnections`

A identidade de serviço do Cloud Run precisa de permissões mínimas para gravar no Firestore (por exemplo, `roles/datastore.user`) e criptografar/descriptografar com a chave KMS (por exemplo, `roles/cloudkms.cryptoKeyEncrypterDecrypter`). O banco Firestore e a chave KMS devem existir no projeto antes da implantação. Não coloque segredos no GitHub nem no frontend.

## Adaptador de publicação YouTube preparado

O módulo `youtube-publisher.js` prepara o envio server-side de vídeo pelo fluxo resumível da YouTube Data API:
- renova o access token no servidor usando o refresh token guardado no cofre criptografado;
- exige o escopo `youtube.upload`;
- valida título, descrição, tags, MIME type, bytes e visibilidade;
- inicia a sessão de upload, envia os bytes e retorna somente o identificador/URL do vídeo e o estado final;
- não devolve access token nem refresh token;
- tem teste automatizado com respostas simuladas; nenhum vídeo real é enviado pela suíte.

**Permanece deliberadamente inativo:** o servidor HTTP ainda não expõe rota de publicação e o módulo não é importado por `server.js`. Antes de ligá-lo, o backend precisa autenticar o operador, conferir autorização/aprovação por operação, validar a capacidade da conta, impor limites e idempotência, registrar auditoria e proteger contra repetição de pedidos. Os bytes do vídeo devem chegar por um caminho confiável do backend; não aceitar URL arbitrária fornecida pelo cliente para evitar SSRF.

## Ainda pendente antes de produção

Este código prepara a persistência, mas não cria os recursos de nuvem nem implanta o serviço. Também não integra ainda o registro Firestore ao gateway operacional de publicação. O adaptador server-side de envio foi preparado, mas está desconectado do servidor HTTP até que a autenticação, a autorização e a auditoria da publicação estejam concluídas. Portanto, salvar a autorização não libera postagem automática.

O deploy no Cloud Run depende de projeto faturável, APIs habilitadas, identidade de serviço e segredos configurados.

## Deploy sugerido

Cloud Run é o alvo do bridge. O GitHub Pages continua sendo somente a interface pública.

Variáveis:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- WORDDARK_ALLOWED_ORIGIN

