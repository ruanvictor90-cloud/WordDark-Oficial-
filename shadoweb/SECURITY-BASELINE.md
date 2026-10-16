# Shadoweb security baseline

## Active protections
- HTTPS-only navigation; blocks script/data/file/blob/intent schemes and common local-address targets.
- Content Security Policy limits scripts/styles to the app's own files and permits only the public Wikipedia API for network requests.
- API requests use a versioned schema and strict connector/action allowlists.
- Each connector must be enabled and have the required scope granted before Bridge execution.
- Connector calls have an 8-second timeout.
- Imported plugin files are JSON manifests only; no imported JavaScript is evaluated.
- User-generated content is rendered through DOM text properties, not HTML injection.
- Local audit redacts obvious secret-like values and is capped at 300 entries.
- Service worker caches same-origin GET app-shell assets only.

## Important limitations
- Browser local storage is not a secure vault and can be cleared or altered by the device owner or a compromised device.
- No login, cloud sync, remote audit, server-side authorization, third-party credentials or public API server is active.
- The Wikipedia connector is a public read-only endpoint and starts disabled.
- No third-party plugin code is executed.
- The darkEye panel is a local demonstration; it cannot inspect unrelated apps or pages automatically.
- Android debug APKs are unsigned debug builds and must not be distributed as production releases.

## Release gates
- Manual Android review of navigation, permissions, offline behavior, imports/exports and link opening.
- Add server-side auth, permission persistence, rate limits, secret handling, monitoring and remote audit before exposing HTTP API endpoints.
- Security review of each external connector and plugin manifest.
- Production signing, privacy notice, data retention policy and dependency update policy before public release.
