# Shadoweb API and connector contract

**Contract version:** 1.0.0  
**Current status:** the in-app Bridge/API Gateway is functional locally. No public HTTP API server is deployed or listening yet.

## Local request shape

The app sends all connector calls through `Bridge.request`:

```json
{
  "connectorId": "wikipedia",
  "action": "search",
  "input": { "query": "Shadoweb" }
}
```

The gateway validates the request, checks that the connector is registered and enabled, checks the explicit permission scope, applies a timeout, executes only the registered handler and records the result in local audit.

## Response shape

```json
{
  "version": "1.0.0",
  "requestId": "generated-by-gateway",
  "ok": true,
  "result": []
}
```

Failures return `ok: false` and a concise `error` message. The gateway does not return raw credentials or stack traces.

## Current connector IDs

| ID | Scope | Status | Purpose |
|---|---|---|---|
| `web-search` | `web.search` | Built in | Opens user-selected web search |
| `wikipedia` | `connector.read` | Disabled by default | Public read-only search |
| `local-knowledge` | `knowledge.read` | Local | Searches the user's local library |

Allowed actions are explicit per connector. An imported plugin cannot register a new handler or provide a URL to fetch.

## Plugin manifest

```json
{
  "schemaVersion": "1.0.0",
  "id": "wiki-helper",
  "name": "Wiki Helper",
  "version": "1.0.0",
  "description": "Busca conhecimento público.",
  "connectorId": "wikipedia",
  "permissions": ["connector.read"]
}
```

Imported manifests remain inactive until the user enables their record. Enabling a manifest does not execute plugin code in this phase.

## Future HTTP API boundary

When Shadoweb is prepared for external developers, the server adapter should expose versioned routes such as `POST /api/v1/requests` and `GET /api/v1/connectors`. These routes are **design targets, not live endpoints**. Before activation, implement and test:

1. server-side authentication and short-lived credentials;
2. per-user and per-app authorization, scopes and quotas;
3. connector allowlists and request schema validation;
4. rate limiting, idempotency and request size limits;
5. secret storage on the server, never in browser/APK source;
6. audit retention and access controls;
7. revocation, abuse reporting, timeout and failure policy;
8. separate development, staging and production deployments.

Never make a frontend-supplied URL into a server-side fetch target. That would create an SSRF risk. External connector implementations must be reviewed and registered server-side.
