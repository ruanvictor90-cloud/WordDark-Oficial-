# WordDark — Google OAuth Bridge

Backend mínimo para completar a primeira conexão real Google/YouTube.

## Não publicar segredos

Configure por variável de ambiente:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- WORDDARK_ALLOWED_ORIGIN

O servidor nunca devolve access_token ou refresh_token ao navegador.

## Endpoints
- GET /health
- POST /oauth/google/code

## Estado atual

O bridge está preparado para receber o código OAuth. A persistência segura dos tokens e o registro definitivo da conexão ainda precisam ser ligados ao armazenamento de segredos/estado escolhido para produção.

## Deploy

Pode ser executado em Cloud Run ou outro backend HTTPS seguro. Não deve ser hospedado como arquivo estático do GitHub Pages.
