import assert from "node:assert/strict";
import { darknetRequest, clearDarknetClientCache } from "./darknet-client.js";

clearDarknetClientCache();
let calls = 0;
const fetchImpl = async (url, options) => {
  calls++;
  assert.equal(new URL(url).origin, "https://api.jikan.moe");
  assert.equal(options.method, "GET");
  assert.equal(options.credentials, "omit");
  return { ok: true, json: async () => ({ data: [{ mal_id: 1, title: "Teste" }] }) };
};
const first = await darknetRequest({ resource: "seasons/now?limit=24", fetchImpl, now: () => 100 });
const second = await darknetRequest({ resource: "seasons/now?limit=24", fetchImpl, now: () => 110 });
assert.equal(first[0].title, "Teste");
assert.equal(second[0].title, "Teste");
assert.equal(calls, 1, "cache should prevent duplicate public catalog requests");
await assert.rejects(() => darknetRequest({ provider: "unknown", resource: "seasons/now", fetchImpl }));
await assert.rejects(() => darknetRequest({ resource: "https://example.com/steal", fetchImpl }));
await assert.rejects(() => darknetRequest({ resource: "anime?q=x&limit=999", fetchImpl }));
await assert.rejects(() => darknetRequest({ resource: "anime/1/full?token=secret", fetchImpl }));
console.log("Ruan Darknet client bridge tests passed.");
