const assert = require("assert");
const { WordDarkIPRegistry } = require("./ip-registry");

const registry = new WordDarkIPRegistry();

registry.register({
  ipId: "IP-WORDDARK-OFFICIAL",
  name: "WordDark",
  type: "BRAND_IDENTITY",
  scope: "INTERNAL",
  ownerId: "WORDDARK-ADM",
  rightsStatus: "PENDING_REVIEW"
});

registry.addExternalIdentity("IP-WORDDARK-OFFICIAL", {
  platform: "YOUTUBE",
  identifier: "@worddarkoficial",
  status: "CONNECTED"
});

registry.addExternalRegistration("IP-WORDDARK-OFFICIAL", {
  authority: "INPI",
  status: "PENDING",
  reference: null
});

registry.addHash("IP-WORDDARK-OFFICIAL", {
  algorithm: "SHA-256",
  value: "test-hash"
});

registry.addEvidence("IP-WORDDARK-OFFICIAL", {
  kind: "PROJECT_RECORD",
  source: "WordDark",
  recordedAt: "2026-10-04"
});

const record = registry.get("IP-WORDDARK-OFFICIAL");
assert.equal(record.scope, "INTERNAL");
assert.equal(record.externalIdentities.length, 1);
assert.equal(record.externalRegistrations.length, 1);
assert.equal(record.hashes.length, 1);
assert.equal(record.evidence.length, 1);

assert.equal(registry.list({ scope: "INTERNAL" }).length, 1);
assert.equal(registry.list({ scope: "EXTERNAL" }).length, 0);

console.log("IP registry external/internal test: OK");
