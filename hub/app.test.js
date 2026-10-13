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
assert.ok(hub.includes('class="central-app-tile"') && hub.includes('href="../worddark/app/index.html?area=central&fromHub=1"'), "Hub must show a large centered Central tile with a stable origin");
assert.ok(hub.includes('class="hub-apps"') && hub.includes('area=ordersHub&fromHub=1') && hub.includes('area=executions&fromHub=1'), "Hub must expose Pedidos and Em execução as its two operational apps");
assert.ok(hub.includes(">Pedidos</span>") && hub.includes(">Em execução</span>"), "Both Hub app tiles must show names below their logos");
assert.ok(!hub.includes("quick-request-form") && !hub.includes("test-app-tile") && !hub.includes("launch-dock"), "Hub must stay minimal without the retired command bar, Teste or extra launch dock");
assert.ok(hub.includes('id="notice-toggle"') && hub.includes('id="notice-panel"'), "Hub must keep its notices");
assert.ok(css.includes(".central-app-tile{width:min(100%,360px);min-height:170px") && css.includes(".hub-apps{display:grid;grid-template-columns:repeat(2"), "Central must be large and the two operational apps must be arranged cleanly");
assert.ok(sw.includes("worddark-hub-v10") && sw.includes("20261013-6"), "Hub cache must refresh to the new interface");
assert.ok(hub.includes("app.css?v=20261013-6") && hub.includes("app.js?v=20261013-6"), "Hub must request fresh CSS and JavaScript");
assert.doesNotThrow(() => new vm.Script(script), "Hub script must parse");
assert.ok((worldEntry.match(/aria-label="Abrir (?:WordDark|Céu|Terra)"/g)||[]).length===3, "World entry must keep exactly three areas");
assert.ok(worldEntry.includes("grid-template-columns:minmax(0,1fr)") && worldEntry.includes("min-height:116px"), "World entry must stack three large area choices vertically");
console.log("WordDark Hub tests passed.");
