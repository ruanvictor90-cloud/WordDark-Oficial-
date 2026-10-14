# Central de Conexões — camada de fronteira

A Central de Conexões foi alinhada ao princípio estrutural do WordDark:

**o Mundo recebe conhecimento operacional; não recebe a porta de entrada.**

## Separação

`Área externa / provedor`
→ `Gateway de Conexão`
→ `Boundary sanitizada`
→ `Mundo WordDark`
→ `Rodovia / Central / Setor executor`

Credenciais, client secrets, refresh tokens, códigos OAuth e dados brutos de autenticação pertencem à fronteira segura. O Mundo recebe somente eventos e informações normalizadas necessárias à operação.

## Provedores preparados

Google/YouTube/Drive, Meta/Instagram/Facebook, TikTok, GitHub, OpenAI, Email, Storage e Analytics possuem registro arquitetural. Isso prepara a expansão sem criar dependências artificiais entre setores.

## Regra

Nenhum setor deve importar ou ler client secret, refresh token ou código OAuth.

Setores usam capacidades: leitura, criação, atualização, publicação, mídia, análise etc.

## Estado

A camada é funcional como registro, política, fronteira e ponte. A autorização real de cada provedor deve ser concluída pelo Gateway seguro, nunca pelo GitHub Pages.

O Gateway deve usar Secret Manager quando executado no Google Cloud. O Cloud Run recomenda Secret Manager para informações sensíveis e não o código-fonte/variáveis comuns. 
