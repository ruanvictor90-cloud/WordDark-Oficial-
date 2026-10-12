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
assert.ok(hub.includes('id="info-title">Informações</h1>'), "Hub must present an information heading");
assert.ok(!hub.includes("PORTÃO DE ENTRADA") && !hub.includes("O mundo começa"), "Hub must not show the removed welcome hero");
assert.ok(!hub.includes("PRONTO"), "Informational widgets must not show operational status badges");
assert.equal((hub.match(/class="info-widget(?: [^"]*)?"/g) || []).length, 3, "Hub must have three informational widgets");
assert.ok(hub.includes('<article class="info-widget">') && !hub.includes('<a class="info-widget'), "Information widgets must not act as navigation links");
assert.ok(hub.includes("Entrada principal do mundo") && hub.includes("Setor de soluções e produção") && hub.includes("Setor de necessidades e negócios"), "Widgets must only explain the three world areas");
assert.ok(css.includes("--bg:#07111f") && css.includes("--accent:#54c8ff"), "Hub must match Ruan's dark-blue visual identity");
assert.ok(css.includes(".info-widget") && css.includes(".info-grid"), "Hub information widgets must use the Ruan-style layout");
assert.ok(sw.includes("worddark-hub-v4"), "Hub cache must refresh for the new layout");
assert.doesNotThrow(() => new vm.Script(script), "Hub script must be valid JavaScript");
assert.equal((worldEntry.match(/<strong>(?:WordDark|Céu|Terra)<\/strong>/g) || []).length, 3, "Official entry page must keep exactly WordDark, Céu and Terra");

console.log("WordDark Hub informational widget tests passed.");