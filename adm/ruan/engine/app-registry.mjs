import { randomUUID } from "node:crypto";

const SAFE_ID = /^[a-z0-9][a-z0-9._-]{1,63}$/;
const ALLOWED_CAPABILITIES = new Set([
  "tasks.read", "tasks.write", "notes.read", "notes.write",
  "calendar.read", "calendar.write", "files.read.selected",
  "notifications.send", "world.request",
]);

/**
 * Each app is a separate consumer line. Registration stores only its declared
 * needs; it does not grant access to the Ruan core or its private memory.
 */
export class RuanAppRegistry {
  #apps = new Map();
  #grants = new Map();

  register(manifest) {
    if (!manifest || typeof manifest !== "object") throw new Error("RUAN_APP_MANIFEST_REQUIRED");
    const id = String(manifest.id || "").trim();
    const name = String(manifest.name || "").trim();
    if (!SAFE_ID.test(id)) throw new Error("RUAN_APP_ID_INVALID");
    if (!name) throw new Error("RUAN_APP_NAME_REQUIRED");
    if (this.#apps.has(id)) throw new Error("RUAN_APP_ALREADY_REGISTERED");
    const requested = Array.isArray(manifest.capabilities) ? [...new Set(manifest.capabilities)] : [];
    const unknown = requested.filter(capability => !ALLOWED_CAPABILITIES.has(capability));
    if (unknown.length) throw new Error("RUAN_APP_CAPABILITY_UNKNOWN: " + unknown.join(","));
    const app = Object.freeze({
      id, name, version: String(manifest.version || "0.1.0"),
      description: String(manifest.description || ""),
      requestedCapabilities: Object.freeze(requested),
      status: "registered", createdAt: new Date().toISOString(),
    });
    this.#apps.set(id, app);
    this.#grants.set(id, new Set());
    return this.describe(id);
  }

  authorize(id, capabilities, { approved = false } = {}) {
    if (approved !== true) throw new Error("RUAN_APP_PERMISSION_APPROVAL_REQUIRED");
    const app = this.#requireApp(id);
    if (!Array.isArray(capabilities)) throw new Error("RUAN_APP_CAPABILITIES_REQUIRED");
    const requested = new Set(app.requestedCapabilities);
    const unknown = capabilities.filter(capability => !ALLOWED_CAPABILITIES.has(capability));
    if (unknown.length) throw new Error("RUAN_APP_CAPABILITY_UNKNOWN: " + unknown.join(","));
    const notRequested = capabilities.filter(capability => !requested.has(capability));
    if (notRequested.length) throw new Error("RUAN_APP_PERMISSION_NOT_REQUESTED: " + notRequested.join(","));
    this.#grants.set(id, new Set(capabilities));
    return this.describe(id);
  }

  revoke(id, capabilities = null) {
    this.#requireApp(id);
    if (capabilities === null) this.#grants.set(id, new Set());
    else {
      const current = this.#grants.get(id);
      for (const capability of capabilities) current.delete(capability);
    }
    return this.describe(id);
  }

  describe(id) {
    const app = this.#requireApp(id);
    return { ...app, requestedCapabilities: [...app.requestedCapabilities], grantedCapabilities: [...this.#grants.get(id)] };
  }

  list() { return [...this.#apps.keys()].map(id => this.describe(id)); }

  createContext(id) {
    const app = this.#requireApp(id);
    const granted = new Set(this.#grants.get(id));
    const assertCapability = capability => {
      if (!granted.has(capability)) throw new Error("RUAN_APP_ACCESS_DENIED: " + app.id + " lacks " + capability);
    };
    return Object.freeze({
      app: Object.freeze({ id: app.id, name: app.name, version: app.version }),
      permissions: Object.freeze([...granted]),
      can: capability => granted.has(capability),
      require: assertCapability,
      createRequest: (purpose, payload = null) => {
        assertCapability("world.request");
        if (typeof purpose !== "string" || !purpose.trim()) throw new Error("RUAN_APP_REQUEST_PURPOSE_REQUIRED");
        return Object.freeze({ requestId: "app_req_" + randomUUID(), source: "RUAN_APP:" + app.id, purpose: purpose.trim(), payload, requestedAt: new Date().toISOString() });
      },
    });
  }

  #requireApp(id) {
    const app = this.#apps.get(id);
    if (!app) throw new Error("RUAN_APP_NOT_REGISTERED");
    return app;
  }
}

export const RUAN_APP_CAPABILITIES = Object.freeze([...ALLOWED_CAPABILITIES]);
