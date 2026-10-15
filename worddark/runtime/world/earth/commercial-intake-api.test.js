import test from "node:test";
import assert from "node:assert/strict";
import { createCommercialIntakeApi } from "./commercial-intake-api.js";

const base = {
  method: "POST",
  path: "/api/v1/commercial/intakes",
  headers: { origin: "https://example.test", "content-type": "application/json", "idempotency-key": "intake-test-key-001" },
  body: {
    contactName: "Cliente Teste",
    contactMethod: "cliente@example.test",
    need: "Preciso de conteúdo para redes sociais.",
    category: "conteudo",
    consent: true
  },
  clientFingerprint: "test-client"
};
function makeApi(overrides = {}) {
  const saved = [];
  const audited = [];
  const limiterCalls = [];
  const api = createCommercialIntakeApi({
    store: { async createIntakeOnce({ intake, auditEvent }) { saved.push(intake); audited.push(auditEvent); return { intake, created: true }; } },
    rateLimiter: { async consume(value) { limiterCalls.push(value); return { allowed: true }; } },
    allowedOrigins: ["https://example.test"],
    now: () => "2026-10-15T12:00:00.000Z",
    idFactory: (() => { let n = 0; return () => "test-id-" + (++n); })(),
    ...overrides
  });
  return { api, saved, audited, limiterCalls };
}

test("rejects missing durable store, audit and limiter dependencies", () => {
  assert.throws(() => createCommercialIntakeApi(), /TRANSACTIONAL_STORE_REQUIRED/);
  assert.throws(() => createCommercialIntakeApi({
    store: { createIntakeOnce() {} }
  }), /RATE_LIMITER_REQUIRED/);
});

test("stores a minimal valid intake and audits before success", async () => {
  const { api, saved, audited, limiterCalls } = makeApi();
  const result = await api(base);
  assert.equal(result.status, 201);
  assert.equal(result.body.status, "INTAKE_RECEIVED");
  assert.equal(saved.length, 1);
  assert.equal(audited.length, 1);
  assert.equal(saved[0].status, "RECEIVED");
  assert.equal(saved[0].contactName, "Cliente Teste");
  assert.equal("authorization" in saved[0], false);
  assert.equal(limiterCalls.length, 1);
});

test("rejects unknown origins without touching storage", async () => {
  const { api, saved } = makeApi();
  const result = await api({ ...base, headers: { ...base.headers, origin: "https://evil.test" } });
  assert.equal(result.status, 403);
  assert.equal(saved.length, 0);
});

test("rejects missing consent and malformed input", async () => {
  const { api, saved } = makeApi();
  const noConsent = await api({ ...base, body: { ...base.body, consent: false } });
  assert.equal(noConsent.status, 400);
  const malformed = await api({ ...base, rawBody: "{" });
  assert.equal(malformed.status, 400);
  assert.equal(saved.length, 0);
});

test("rejects oversized payload and non-JSON content", async () => {
  const { api } = makeApi({ maxBodyBytes: 20 });
  const large = await api({ ...base, rawBody: "x".repeat(21) });
  assert.equal(large.status, 413);
  const other = await api({ ...base, headers: { ...base.headers, "content-type": "text/plain" } });
  assert.equal(other.status, 415);
});

test("rate limits before persistence", async () => {
  const { api, saved } = makeApi({
    rateLimiter: { async consume() { return { allowed: false }; } }
  });
  const result = await api(base);
  assert.equal(result.status, 429);
  assert.equal(saved.length, 0);
});

test("does not claim success if storage or audit is unavailable", async () => {
  const storageFailure = makeApi({ store: { async createIntakeOnce() { throw Error("offline"); } } });
  assert.equal((await storageFailure.api(base)).status, 503);
  assert.equal(storageFailure.audited.length, 0);
  const unconfirmed = makeApi({ store: { async createIntakeOnce() { return null; } } });
  assert.equal((await unconfirmed.api(base)).status, 503);
});

test("returns generic not-found and method responses", async () => {
  const { api } = makeApi();
  assert.equal((await api({ ...base, path: "/not-a-route" })).status, 404);
  assert.equal((await api({ ...base, method: "GET" })).status, 404);
});

test("returns conflict when an idempotency key is reused with different data", async () => {
  const { api, saved } = makeApi({
    store: { async createIntakeOnce() {
      const error = new Error("conflict");
      error.code = "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD";
      throw error;
    } }
  });
  const result = await api(base);
  assert.equal(result.status, 409);
  assert.equal(result.body.error.code, "IDEMPOTENCY_KEY_CONFLICT");
  assert.equal(saved.length, 0);
});
