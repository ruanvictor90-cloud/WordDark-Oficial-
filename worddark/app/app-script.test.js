import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const sw = readFileSync(new URL("./sw.js", import.meta.url), "utf8");
function swCacheVersionForTest(source){return /worddark-app-v1-\d+/.test(source) && !source.includes("world-cosmos.svg") && !source.includes("world-sky.svg") && !source.includes("world-earth.svg");}
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
assert.ok(scripts.length > 0, "WordDark app must contain its client script");
const source = scripts.at(-1)[1];
assert.ok(source.includes("function workbench()"), "Content workbench must be registered");
assert.ok(source.includes("function publishHubNotice(title,message,level='important')"), 'Important world events must be published to the Hub');
assert.ok(html.includes('#screen.clean-launcher{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important'), 'Area launchers must use app tiles directly on the page');
assert.ok(html.includes('#screen.clean-launcher{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important'), 'Area app launcher must use square three-column app buttons');
assert.ok(html.includes('flex-direction:column!important') && html.includes('text-align:center!important'), 'App buttons must stack icon above its label, not look like a horizontal list');
assert.ok(html.includes('left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important'), 'WordDark logo must remain centered at the top');
assert.ok(source.includes("data-save-review"), "Review controls must be present");
assert.ok(!html.includes('id="hubQuickRequestForm"') && !html.includes('id="hubQuickRequest"'), "Quick request bar must exist only in the Hub, not on WordDark world pages");
assert.ok(!html.includes('class="hub-test-app"') && !html.includes('id="hubTestApp"'), "Hub Teste shortcut must not be pinned on every world page");
assert.ok(!source.includes("quickRequestForm") && source.includes("worddark.hub.quick-request.v1"), "WordDark must receive Hub requests through the existing handoff key without embedding the quick request bar");
assert.ok(source.includes("['test','Teste']") && source.includes("['central','Central']"), "Central and Teste must be available as compact WordDark home apps");
assert.ok(!source.includes("function createLaunchMission()"), "The launch mission generator must be removed from the factory");
assert.ok(!source.includes("data-create-launch-mission") && !html.includes("MISSÃO DE ESTREIA · WORDDARK OFICIAL"), "The launch mission card must be absent from the factory");
assert.ok(source.includes("function exportJobPackage(id)"), "Work packages must be exportable for manual handoff");
assert.ok(source.includes("function dispatchRequest(id)"), "Content requests must dispatch into the Dark Factory");









assert.ok(source.includes("data-dispatch-request"), "Eligible requests must expose the dispatch action");
assert.ok(source.includes("requestId:r.id"), "Dispatched jobs must retain the source request ID");
assert.ok(source.includes("Solicitação de origem: '+(j.requestId||'Trabalho criado diretamente')"), "Delivery packages must preserve request provenance");
assert.ok(source.includes("linked.status=status==='Entregue'?'Concluída'"), "A delivered local job must update its source request");
assert.ok(source.includes("delete linked.linkedJobId"), "Cancelling a factory job must allow the request to be re-dispatched");
assert.ok(source.includes("data-export-job"), "Export controls must be present in the queue/editor");
assert.ok(source.includes("URL.createObjectURL(blob)"), "Export must create a downloadable package");
assert.ok(source.includes("Direitos de uso conferidos"), "Export package must include rights-review status");
assert.ok(source.includes("KEYS.contentJobs"), "Content jobs must use their own local storage key");
assert.ok(source.includes("function exportWorldBackup()"), "The app must support exporting a complete local backup");
assert.ok(source.includes("function restoreWorldBackupFile(file)"), "The app must support restoring a selected backup");
assert.ok(source.includes("formatVersion:1"), "Backups must carry an explicit format version");
assert.ok(source.includes("payload.app!=='WordDark'"), "Restore must reject files from another app");
assert.ok(source.includes("payload.formatVersion!==1"), "Restore must reject unsupported backup versions");
assert.ok(source.includes("file.size>5*1024*1024"), "Restore must reject oversized files");
assert.ok(source.includes("Array.isArray(payload.collections[name])"), "Restore must validate every required collection before writing");
assert.ok(source.includes("Isso substituirá as coleções locais atuais"), "Restore must warn before replacing local data");
assert.ok(source.includes("localStorage.setItem(key,JSON.stringify(payload.collections[name]))"), "Restore must write validated collections to their existing local keys");
assert.ok(source.includes("Falha ao restaurar. Foi tentada a recuperação dos dados anteriores."), "Restore must attempt rollback after storage errors");
assert.ok(source.includes("data-export-backup"), "The library must expose a backup export action");
assert.ok(source.includes('id="importBackupFile"'), "The library must expose a backup restore file picker");
assert.ok(source.includes("function businessStore(kind)"), "Commercial submodules must have distinct screens");
assert.ok(source.includes("function businessStore(kind)"), "Archived commercial module code must remain available for existing data compatibility");
assert.ok(!source.includes("commerce:()=>businessStore"), "Retired commercial company must not be an active route");
assert.ok(!html.includes('data-page="commerce"'), "Retired commercial company must not appear in the active navigation");
assert.ok(source.includes("function marketing()"), "Marketing must have a distinct screen");
assert.ok(source.includes("['workbench','Dark Factory'"), "Sky must list its own production apps");
assert.ok(source.includes("['finance','Financeiro'") && source.includes("finance:'darkbank'"), "Financeiro must live inside Darkbank, not on the WordDark home");
assert.ok(!source.includes('id="contentForm"') && !source.includes('id="ledgerForm"') && !source.includes('id="transferForm"') && !source.includes('id="noteForm"'), "Manual work creation, finance movement and operational note forms must be removed from sector screens");
assert.ok(source.includes("Entrada pelo Hub") && source.includes("Fila de trabalhos"), "Dark Factory must receive work through the Hub and focus on its queue");
assert.ok(source.includes("librarySearch") && source.includes("data-export-backup"), "Library must be archive-first with search and backup tools");
assert.ok(source.includes("['social','Empresa social'") && source.includes("['channels','Empresa comercial'"), "Terra must keep both social and commercial companies as separate apps");
assert.ok(source.includes("function social()") && source.includes("social:'Empresa social'"), "Empresa social must have its own screen and route");
assert.ok(source.includes("clean-app-name") && !source.includes("operation-app-copy"), "World app tiles must show only icon and name");
assert.ok(!source.includes("navigationStack") && source.includes("worddarkPreviousPage:page") && source.includes("history.back()") && source.includes("window.addEventListener('popstate',event=>"), "Back must follow the browser's actual previous in-app page without a stale parallel stack");
assert.ok(source.includes("KEYS.catalog") && source.includes("KEYS.suppliers") && source.includes("KEYS.orders") && source.includes("KEYS.customers"), "Commercial modules must persist separate record collections");
assert.ok(source.includes("data-cancel-request"), "Queued operations must support cancellation");
assert.ok(source.includes("data-delete-request"), "Queued operations must support deletion");
assert.ok(source.includes("data-cancel-job"), "Content jobs must support cancellation");
assert.ok(source.includes("data-delete-job"), "Content jobs must support deletion");
assert.ok(source.includes("item.status='Cancelada'"), "Cancellation must preserve an explicit cancelled state");
assert.ok(source.includes("requests=requests.filter(x=>x.id!==b.dataset.deleteRequest)"), "Deletion must remove the selected local operation");
assert.ok(source.includes("contentJobs=contentJobs.filter(x=>x.id!==b.dataset.deleteJob)"), "Deletion must remove the selected local content job");
assert.doesNotThrow(() => new vm.Script(source), "Inline app script must be valid JavaScript syntax");
assert.ok(source.includes("O que vamos resolver hoje?"), "Home must use a simple request-first launcher");
assert.ok(source.includes("function updateWorldQuestions()"), "The request flow must ask clarifying questions proactively");
assert.ok(source.includes("Ajustes internos (opcional)"), "Advanced routing controls must stay tucked away by default");
assert.ok(html.includes("/* Ruan interface foundation:"), "WordDark must share the Ruan app's restrained visual foundation");
assert.ok(html.includes("radial-gradient(ellipse at 50% -20%"), "World sections must have a deliberate neutral fallback until the correct reference artwork is available");
assert.ok(!html.includes('url("./assets/world-cosmos.svg")') && !html.includes('url("./assets/world-sky.svg")') && !html.includes('url("./assets/world-earth.svg")'), "Placeholder scene illustrations must not be presented as the user's original reference backgrounds");
assert.ok(source.includes("document.body.dataset.page=page"), "Navigation must select the correct section background");
assert.ok(source.includes("function cleanLauncher(area)") && source.includes("clean-app-grid operation-app-grid") && source.includes("clean-app-name"), "Every world section must use a flat launcher with only each app logo and name");
assert.ok(source.includes("function test()") && source.includes("function runWorldCheck()") && source.includes("data-run-test"), "Teste app must provide one-click world and individual sector checks");
assert.ok(source.includes("Tudo OK") && source.includes("Falha"), "Teste app must return a clear pass/fail result");
assert.ok(!source.includes("operation-metrics top-metrics"), "Sector launchers must stay minimal without dashboard metrics");
const cleanLauncherStart=source.indexOf("function cleanLauncher(area)");
const cleanLauncherEnd=source.indexOf("function render()",cleanLauncherStart);
const cleanLauncherSource=source.slice(cleanLauncherStart,cleanLauncherEnd);
assert.ok(!cleanLauncherSource.includes("operation-primary") && !cleanLauncherSource.includes("view.description") && !cleanLauncherSource.includes("view.cta"), "Sector launchers must omit redundant descriptions and shortcut CTA buttons");
assert.ok(source.includes("worddark.hub.quick-request.v1") && source.includes("Pedido encaminhado pelo WordDark Hub."), "Quick Hub requests must prefill the central request form");
assert.ok(source.includes("'central','ordersHub','requestSocial'") && source.includes("'connections','automation'") && source.includes("'capture','store','catalog','commerceOrders'"), "Direct routes must include the new central and commercial apps");
assert.ok(source.includes("overview:{") && source.includes("clean-app-name") && source.includes("['central','Central']") && source.includes("['test','Teste']"), "WordDark launcher must include the logo-and-name Central and Teste apps");
const launcherStart=source.indexOf("function cleanLauncher(area)");
const launcherEnd=source.indexOf("function render()",launcherStart);
const launcher=source.slice(launcherStart,launcherEnd);
const skyConfig=launcher.slice(launcher.indexOf("sky:{"),launcher.indexOf("earth:{"));
const earthConfig=launcher.slice(launcher.indexOf("earth:{"),launcher.indexOf("};",launcher.indexOf("earth:{")));
const overviewConfig=launcher.slice(launcher.indexOf("overview:{"),launcher.indexOf("sky:{"));
assert.ok(!overviewConfig.includes("channels"), "Commercial company must belong to Terra, not WordDark");
assert.ok(earthConfig.includes("['channels','Empresa comercial'") && earthConfig.includes("['social','Empresa social'"), "Terra must show both Empresa social and Empresa comercial");
assert.ok(overviewConfig.includes("['test','Teste']") && overviewConfig.includes("['central','Central']"), "Central and Teste must be available on the WordDark home only");
assert.ok(!skyConfig.includes("['test','Teste") && !earthConfig.includes("['test','Teste"), "Teste app must not duplicate on each sector page");
assert.ok(!skyConfig.includes("management") && !skyConfig.includes("library"), "Sky must not expose WordDark apps as shortcuts");
assert.ok(!earthConfig.includes("management") && !earthConfig.includes("library"), "Terra must not expose WordDark apps as shortcuts");
assert.ok(source.includes("const pageParents={") && source.includes("workbench:'sky'") && source.includes("finance:'darkbank'") && source.includes("central:'overview'") && source.includes("ordersHub:'central'") && source.includes("connections:'central'") && source.includes("capture:'channels'") && source.includes("store:'channels'") && source.includes("receivedOrders:'commerceOrders'"), "Each app must have a correct parent-sector fallback");
assert.ok(source.includes("function appLauncher(kind)") && source.includes("function darkbank()") && source.includes("function investments()") && source.includes("function myinvestments()") && source.includes("function opportunities()"), "Darkbank must contain Financeiro and Investimentos, with both investment sectors nested under Investimentos");
assert.ok(source.includes("['darkbank','Darkbank'") && source.includes("<span class=\"clean-app-name\">'+label+'</span>"), "Darkbank must appear in Céu and use the compact icon-and-name launcher");
assert.ok(source.includes("window.addEventListener('popstate',event=>"), "Browser back gestures must follow the in-app navigation history");
assert.ok(swCacheVersionForTest(sw) === true, "Visual changes must be paired with the service worker cache version update");

assert.ok(html.includes("Navegação corrigida: sem barra lateral e com retorno sempre visível"), "The global sidebar must stay hidden and the return control must remain visible");
assert.ok(html.includes(".app-topbar .back-top{display:grid!important;visibility:visible!important"), "The back button must override older rules that hid it");
assert.ok(html.includes("#screen.clean-launcher{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))"), "Area launchers must remain three columns");

assert.ok(source.includes("function connections()") && source.includes("data-provider") && source.includes("connection-panel"), "Central de conexão must list providers and jump directly to its connection area");
assert.ok(source.includes("function requestSourceView(source)") && source.includes("requestSocial") && source.includes("requestCommercial") && source.includes("requestWorld"), "Pedidos must be separated by demand source");
assert.ok(source.includes("function executionView(source)") && source.includes("executionSocial") && source.includes("executionCommercial"), "Execution must be separated by area");
assert.ok(source.includes("function capture()") && source.includes("data-view-demand") && source.includes("function store()") && source.includes("data-add-cart") && source.includes("checkoutForm"), "Commercial company must include capture cards, storefront, cart and checkout flow");
assert.ok(source.includes('data-go="catalog"') && source.includes("catalog:()=>businessStore('catalog')"), "The storefront must expose a route to manage products without adding a fifth commercial app tile");
assert.ok(source.includes("function orderManagement()") && source.includes("function receivedOrders()") && source.includes("function awaitingOrders()") && source.includes("function supplierPage()"), "Commercial orders and suppliers must have distinct app screens");
assert.ok(source.includes("function automated()") && source.includes("function automate()") && source.includes("function school()") && source.includes("function governancePlaceholder"), "Automation, School and Governance scaffolds must be present");
console.log("worddark app script test: OK");
