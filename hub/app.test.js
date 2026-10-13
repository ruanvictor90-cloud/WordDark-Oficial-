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
assert.ok(!hub.includes("Informações") && !hub.includes("VISÃO GERAL"), "Hub must not reintroduce a dense information dashboard");
assert.ok(!hub.includes("PORTÃO DE ENTRADA") && !hub.includes("O mundo começa"), "Hub must not show a welcome hero");
assert.ok(!hub.includes("info-widget") && !hub.includes("info-grid") && !hub.includes("<footer"), "Hub must not show information widgets or a footer");
assert.ok(hub.includes('class="topbar"') && hub.includes('class="launch-dock"'), "Hub must keep its header and official app launch dock");
assert.ok(css.includes("--bg:#09070f") && css.includes("--accent:#c49aff"), "Hub must preserve its original dark-purple identity");
assert.ok(css.includes(".brand-mark") && css.includes(".launch-dock") && !css.includes("#54c8ff"), "Header and bottom app launch must use the original purple identity, not blue");
assert.ok(sw.includes("worddark-hub-v8"), "Hub cache must refresh for the quick request bar and Teste app");
assert.ok(hub.includes("app.css?v=20261013-4") && hub.includes("app.js?v=20261013-4"), "Hub must request fresh versioned assets");
assert.ok(hub.includes("id=\"quick-request-form\"") && hub.includes("id=\"quick-request-input\""), "Hub must expose a quick request bar below the header");
assert.ok(hub.includes("class=\"test-app-tile\"") && hub.includes(">Teste</span>"), "Hub must expose the logo-and-name Teste app tile");
assert.ok(css.includes(".quick-request-bar") && css.includes(".test-app-tile"), "Hub quick request and Teste app must have dedicated styling");
assert.ok(script.includes("worddark.hub.quick-request.v1") && script.includes("area=management&fromHub=1"), "Quick requests must enter WordDark Central Operations");
assert.ok(sw.includes("event.request.mode===\"navigate\""), "Hub navigation should prefer the latest published HTML");
assert.ok(script.includes('worddark.hub.notices.v1') && script.includes('createdAt'), 'Hub must receive and order world notifications');
assert.doesNotThrow(() => new vm.Script(script), "Hub script must be valid JavaScript");
assert.doesNotThrow(() => new vm.Script(sw), "Hub service worker must be valid JavaScript");
assert.ok(!script.includes('$("notice-open")'), "Notice behavior must not depend on a removed information-section button");
assert.equal((worldEntry.match(/aria-label="Abrir (?:WordDark|Céu|Terra)"/g) || []).length, 3, "Official entry page must keep exactly three accessible logo-only areas: WordDark, Céu and Terra");

console.log("WordDark Hub empty purple home tests passed.");
