# darkHub Security Baseline

## Trust boundary
- The web UI is a client, not the root authority.
- The local vault encrypts app records at rest using PBKDF2-SHA-256 and AES-256-GCM.
- No credentials, API secrets, OAuth refresh tokens, signing keys or production tokens belong in this repository or browser storage.
- No external connector is considered connected unless an authenticated, authorized handshake is verified.

## Required before production integrations
1. Authenticated backend identity and per-app authorization scopes.
2. Server-side validation for every request and every destructive action.
3. Token exchange and secret storage on the backend; no secrets shipped in frontend or APK assets.
4. Explicit operator consent for publish, package, connect, export or delete actions.
5. Revocation and disconnect flows that invalidate remote credentials.
6. TEST/STAGING/PRODUCTION separation and audit correlation IDs.
7. Automated dependency, secret, and static-analysis checks.
8. Android Keystore integration and release signing managed outside source control.
9. Backup/restore tests and documented recovery procedure.
10. Security review of data export, import and all cross-app message contracts.

## Local implementation
- Content Security Policy limits scripts and connections to same-origin resources.
- User-entered records are rendered with DOM text APIs, not inserted as executable HTML.
- Generated HTML escapes text fields and carries a restrictive policy.
- AES-GCM records include a fresh random nonce per write; authentication failures prevent opening corrupted ciphertext.
- The passphrase-derived key is held in memory only while unlocked and dropped on lock.
- Idle timeout is five minutes; hiding the tab locks the UI.
- Local failed-attempt throttling is only a deterrent: clearing browser storage resets it.

## Honest security status
This is a local security baseline, not a complete production security system. It does not defend against malware, developer tools, a compromised OS, modified client code, browser extensions with broad access, or offline guessing against weak passphrases. Backend auth, secure native storage and remote audit are future gates, not claims of current capability.
