const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const page = readFileSync(path.join(__dirname, "index.html"), "utf8");
const scripts = [...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
assert.ok(scripts.length, "Connection page must contain its OAuth controller");
assert.doesNotThrow(() => new vm.Script(scripts.at(-1)[1]), "Connection page controller must be valid JavaScript");
const controller = scripts.at(-1)[1];
assert.ok(controller.includes("async function exchangeCode(code,clientId)"), "OAuth authorization code must be exchanged through the backend");
assert.ok(controller.includes("fetch(cfg.codeEndpoint"), "OAuth controller must use the configured backend endpoint");
assert.ok(controller.includes('"X-Requested-With":"XmlHttpRequest"'), "OAuth request must include the CSRF defense header");
assert.ok(controller.includes("new URLSearchParams({code,client_id:clientId})"), "OAuth request must send the code and public client ID");
assert.ok(controller.includes('result.persistence!=="ACTIVE"'), "The UI must not claim an active connection before persistence is confirmed");
assert.ok(controller.includes("BACKEND NÃO CONFIGURADO"), "The UI must explain when the backend endpoint is missing");
assert.ok(!controller.includes("localStorage.setItem(\"wd.google.accessToken\""), "OAuth tokens must not be persisted in browser storage");

const bridge = readFileSync(path.resolve(__dirname, "../../../../bridge/google-oauth/server.js"), "utf8");
assert.ok(bridge.includes('req.headers["x-requested-with"]!=="XmlHttpRequest"'), "Bridge must validate the custom request header");
assert.ok(bridge.includes('clientId!==CLIENT_ID'), "Bridge must reject authorization codes for a different client ID");
assert.ok(bridge.includes("raw.length>8192"), "Bridge must bound the request body size");
assert.ok(bridge.includes("Google authorization could not be completed."), "Bridge must return a generic authorization failure message");
console.log("YouTube OAuth connection page and bridge contract tests: OK");
