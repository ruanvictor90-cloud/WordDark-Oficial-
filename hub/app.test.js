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

assert.ok(hub.includes('href="../ruan/index.html"'), "Hub must provide a direct return link to Ruan Central");
assert.ok(hub.includes('aria-label="Voltar para Ruan Central"'), "Return link must be accessible");
assert.ok(hub.includes('href="../index.html"'), "Hub must keep its separate launch link to the official WordDark app");
assert.ok(hub.includes('id="notice-toggle"') && hub.includes('id="notice-panel"'), "Hub must keep its local notices panel");
assert.ok(hub.includes('id="notice-open"'), "Hub must offer a clear way to open notices");
assert.ok(!hub.includes('class="info-widget"'), "Céu and Terra must not be duplicated as sector cards inside Hub");
assert.ok(!/aria-label="(?:Céu|Terra)"/.test(hub), "Hub must not present the three world entry options");
assert.ok(css.includes("--bg:#09070f") && css.includes("--accent:#c49aff"), "Hub must keep the shared dark-violet world identity");
assert.ok(css.includes(".ruan-return"), "Return link must have its own responsive style");
assert.ok(script.includes('open.addEventListener("click",showNotices)'), "Notice preview must open the notice panel");
assert.ok(sw.includes('worddark-hub-v3'), "Hub cache version must change when the navigation layout changes");
assert.doesNotThrow(() => new vm.Script(script), "Hub script must be valid JavaScript");
assert.equal((worldEntry.match(/<strong>(?:WordDark|Céu|Terra)<\/strong>/g) || []).length, 3, "The official entry page must contain exactly WordDark, Céu and Terra");
assert.ok(worldEntry.includes("--accent:#c49aff"), "Official entry page must use the world violet accent, not the old green theme");
assert.ok(!worldEntry.includes("#d8ff70"), "Old green accent must be removed from the entry page");

console.log("WordDark Hub integration tests passed.");