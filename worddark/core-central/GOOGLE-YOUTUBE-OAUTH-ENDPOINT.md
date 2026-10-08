# WORDDARK — Google OAuth Connection Endpoint

## Purpose

Secure endpoint required to complete the first real Google/YouTube connection.

## Browser flow

1. Central de Conexões loads Google Identity Services.
2. User authorizes Google/YouTube.
3. Browser receives a short-lived authorization code.
4. Browser sends the code to this backend with `X-Requested-With: XmlHttpRequest`.
5. Backend validates the request and exchanges the code with Google.
6. Backend stores the refresh token securely outside GitHub/Pages.
7. Backend creates/updates the WordDark connection record.
8. Backend returns only the connection state and safe public account metadata to the World.

## Required backend secrets

Never place these in GitHub Pages or public source:

- Google Client Secret
- OAuth refresh tokens
- access tokens
- encryption keys

## Required environment configuration

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_ORIGIN = https://ruanvictor90-cloud.github.io
- WORDDARK_CONNECTION_ORIGIN = https://ruanvictor90-cloud.github.io/WordDark-Oficial-/worddark/runtime/world/core/connections/
- WORDDARK_ALLOWED_ORIGIN = https://ruanvictor90-cloud.github.io/WordDark-Oficial-

## Initial YouTube scopes

- https://www.googleapis.com/auth/youtube.readonly
- https://www.googleapis.com/auth/youtube.upload

Request additional scopes only when an operation actually needs them.

## Security rules

- Validate origin and CSRF protection.
- Never log authorization codes or tokens.
- Never return tokens to the public UI.
- Store refresh tokens in a secret-capable backend store.
- Register every successful connection with provider, service, account identity, capabilities and state.
- A failed external connection must not stop the World.
