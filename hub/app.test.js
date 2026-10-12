import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("./", import.meta.url);
const read = path => readFileSync(new URL(path, root), "utf8");
const hub = read("index.html");
const css = read("app.css");
const script = read("app.js");
const sw = read("sw.js");
const worldEntry = read("../index.html");

assert.ok(hub.includes('href="../ruan/index.html"'), "Hub must provide a return link to Ruan Central");
assert.ok(hub.includes('href="../index.html"'), "Hub must keep its separate launch link to the official WordDark app");
assert.ok(hub.includes('id="notice-toggle"') && hub.includes('id="notice-panel"'), "Hub must keep its local notices panel");
assert.ok(!hub.includes("Informações") && !hub.includes("VISÃO GERAL"), "Hub home must stay empty below the header");
assert.ok(!hub.includes("PORTÃO DE ENTRADA") && !hub.includes("O mundo começa"), "Hub must not show a welcome hero");
assert.ok(!hub.includes("info-widget") && !hub.includes("info-grid") && !hub.includes("<footer"), "Hub must not show information widgets or a footer");
assert.ok(hub.includes('class="topbar"') && hub.includes('class="launch-dock"'), "Hub must keep only the header and bottom app launch on its home");
assert.ok(css.includes("--bg:#09070f") && css.includes("--accent:#c49aff"), "Hub must preserve its original dark-purple identity");
assert.ok(css.includes(".brand-mark") && css.includes(".launch-dock") && !css.includes("#54c8ff"), "Header and bottom app launch must use the original purple identity, not blue");
assert.ok(sw.includes("worddark-hub-v7"), "Hub cache must refresh for the restored design");
assert.ok(hub.includes("app.css?v=20261012-3") && hub.includes("app.js?v=20261012-3"), "Hub must request fresh versioned assets");
assert.ok(sw.includes("event.request.mode===\"navigate\""), "Hub navigation should prefer the latest published HTML");
assert.ok(script.includes('worddark.hub.notices.v1') && script.includes('createdAt'), 'Hub must receive and order world notifications');
assert.doesNotThrow(() => new vm.Script(script), "Hub script must be valid JavaScript");
assert.doesNotThrow(() => new vm.Script(sw), "Hub service worker must be valid JavaScript");
assert.ok(!script.includes('$("notice-open")'), "Notice behavior must not depend on a removed information-section button");
assert.equal((worldEntry.match(/aria-label="Abrir (?:WordDark|Céu|Terra)"/g) || []).length, 3, "Official entry page must keep exactly three accessible logo-only areas: WordDark, Céu and Terra");

console.log("WordDark Hub empty purple home tests passed.");
