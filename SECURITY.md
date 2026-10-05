# WordDark — Security Baseline

## Authority

- ADM/Ruan is the highest authority.
- WordDark cannot administer or elevate its own authority.
- GitHub/GitHub Pages is an implementation and interface layer, not the authority vault.

## Non-negotiable rules

1. Never commit passwords, API keys, OAuth client secrets, refresh tokens or private certificates.
2. Frontend code must assume it is public.
3. Production credentials stay outside GitHub Pages.
4. Real external publication requires explicit authorization and an authenticated connector.
5. TEST and PROD must remain separated.
6. Destructive actions require explicit authorization.
7. Temporary files must not be the only copy of important intellectual property.
8. Important assets require provenance, version and evidence.
9. Third-party assets require rights status before reuse.
10. A backup must exist outside the primary working copy.

## Protection layers

### GitHub

- Protect main against direct unreviewed changes.
- Develop in develop.
- Integrate through staging.
- Use pull requests for production changes.
- Enable 2FA/passkeys and strong recovery methods on the owner account.
- Review collaborators, OAuth applications and deploy keys regularly.

### Runtime

- Separate TEST and PROD.
- Keep tokens in memory or secure backend storage, never in source.
- Validate authorization before routing to real external systems.
- Log operation identity, result and reentry without logging secrets.

### External connections

- OAuth authorization is delegated to the provider.
- Backend exchanges are required for providers that require secrets.
- Disconnect must invalidate runtime credentials and local metadata.
- Every external account must have an owner and identity record.

### Intellectual property

For important assets, preserve creation date, creator and declared owner, source, version, evidence, hash when applicable, license or authorization, external identity, and official registration status.

## Recovery

The minimum recovery set is:
1. repository backup;
2. library/IP export;
3. external-account recovery methods;
4. domain recovery;
5. legal/registration evidence;
6. documented restore procedure.

Security is not a single feature. It is the combination of authority, access control, secrets management, backups, evidence, legal protection and recovery.
