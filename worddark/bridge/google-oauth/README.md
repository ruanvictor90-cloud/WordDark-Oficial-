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

**Portão de autorização preparado:** `publication-authorization.js` exige identidade de operador autenticada, autorização específica da operação, aprovação identificável, quota, chave de idempotência e auditoria. Falhas de autenticação, aprovação, quota, auditoria ou registro bloqueiam a operação. O contrato de idempotência depende de um armazenamento durável fornecido pelo backend; nenhum armazenamento em memória é tratado como proteção de produção. O módulo ainda não está ligado ao servidor HTTP.


### Armazenamento de operações de publicação (preparado, ainda não ligado ao servidor)

- `publication-store.js` fornece contratos Firestore para reivindicar chaves de idempotência com transações, finalizar recibos, reservar quota por operador/provedor/conta e gravar eventos de auditoria sem payload ou credenciais.
- A fábrica cloud usa o projeto de serviço e coleções configuráveis por variáveis de ambiente; as permissões IAM do serviço precisam limitar quem pode ler/escrever essas coleções.
- O teste local usa um Firestore falso para verificar o contrato; ele não substitui teste de integração no projeto Google Cloud nem comprova configuração IAM, transações concorrentes reais ou retenção/imutabilidade da auditoria.
- `publication-runtime.js` compõe o portão, o armazenamento durável, a conexão persistida e o adaptador YouTube num único serviço server-side. Ele exige um buffer de mídia confiável, impõe limite de bytes e só chama o publicador após a autorização do backend. O runtime rejeita provedores diferentes de `YOUTUBE` e ações diferentes de `CONTENT_PUBLISH`; antes do upload, também exige que o registro persistido corresponda à conta autorizada, contenha a capacidade canônica `CONTENT_PUBLICATION` e inclua o escopo OAuth `youtube.upload`.
- Testes de composição verificam que operações negadas ou sem conexão não alcançam o adaptador, e que o resultado é registrado após a tentativa.
- Ainda não existe rota HTTP que exponha esse runtime, nem provedores concretos de autenticação/aprovação já ligados a uma identidade real. A publicação permanece indisponível por endpoint e manual por padrão.

### Concessão/revogação de capacidades — serviço backend preparado

- `capability-grant-service.js` administra inicialmente apenas `CONTENT_PUBLICATION` para contas YouTube persistidas; não existe endpoint HTTP e o serviço não é importado pelo servidor público.
- Para conceder ou revogar, exige identidade confiável de operador, permissão específica para a ação, aprovação cujo identificador corresponda à referência solicitada, conta persistida, chave de idempotência e auditoria prévia. A concessão de publicação também exige o escopo OAuth `youtube.upload`.
- `connection-store.js` altera a lista de capacidades por transação Firestore. Uma conexão OAuth recém-salva continua com `capabilities: []`; o escopo OAuth sozinho não concede autorização operacional.
- `capability-grant-service.test.js` cobre concessão, revogação, repetição, escopo ausente, conexão ausente, permissão negada, aprovação inválida e falha de auditoria. São testes simulados; autenticação/aprovação reais, IAM e concorrência no Firestore ainda precisam de validação de ambiente.

**Permanece deliberadamente inativo:** o servidor HTTP não expõe rota de publicação e não importa `publication-runtime.js`. Antes de ligá-lo, precisamos integrar autenticação de operador confiável, aprovação operacional real, autorização de conta/capacidade, limites duráveis e controles de auditoria com as políticas do ambiente implantado. Os bytes do vídeo devem chegar por um caminho confiável do backend; não aceitar URL arbitrária fornecida pelo cliente para evitar SSRF.

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

