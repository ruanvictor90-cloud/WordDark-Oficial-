import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../../../../${path}`, import.meta.url), 'utf8');
const root = read('README.md');
const architecture = read('worddark/runtime/world/ARCHITECTURE-CONSOLIDATION.md');
const scope = read('worddark/runtime/world/CURRENT-VERSION-SCOPE.md');
const ruan = read('ruan/README.md');
const ruanHome = read('ruan/index.html');
const hub = read('hub/index.html');
const hubCentral = read('hub/central.html');
const hubScript = read('hub/app.js');
const hubManifest = read('hub/manifest.webmanifest');
const hubWorker = read('hub/sw.js');
const hubTests = read('hub/app.test.js');
const world = read('worddark/runtime/world/README.md');
const worldApp = read('worddark/app/index.html');
const darknet = read('darknet/README.md');

assert.ok(root.includes('ARCHITECTURE-CONSOLIDATION.md'), 'Repository README must point to the canonical architecture');
assert.ok(architecture.includes('Ruan — aplicativo pessoal') && architecture.includes('Hub — painel superior pertencente ao Ruan'));
assert.ok(architecture.includes('Banco — instituição financeira do WordDark') && architecture.includes('interface/app atualmente identificada como Darkbank'));
assert.ok(architecture.includes('não é administrado pelo WordDark') && architecture.includes('o Hub não cria um segundo Core'));
assert.ok(scope.includes('Banco (interface atual Darkbank)') && scope.includes('ponte com o Core permanece desativada'));
assert.ok(ruan.includes('aplicativo pessoal') && ruan.includes('proprietário lógico do Hub'));
assert.ok(ruanHome.includes('../hub/index.html'), 'Ruan must retain the explicit Hub launcher');
assert.ok(!ruanHome.includes('apps/darknet'), 'Ruan must not own the legacy Darknet app');
assert.ok(hub.includes('<title>Ruan Hub</title>') && hub.includes('../ruan/index.html'));
assert.ok(hub.includes('Painel superior de gestão do mundo') && hub.includes('../worddark/app/index.html'));
assert.ok(hubCentral.includes('ruan.hub.quick-requests.v1') && hubCentral.includes('worddark.hub.quick-requests.v1'));
assert.ok(hubScript.includes('ruan.hub.notices.v1') && hubScript.includes('worddark.hub.notices.v1'));
assert.ok(hubManifest.includes('"name": "Ruan Hub"'));
assert.ok(hubWorker.includes('ruan-hub-v14') && !hubWorker.includes('../ruan/apps/darknet/'));
assert.ok(hubTests.includes('Ruan Hub') && hubTests.includes('migrateHubStorage'));
assert.ok(world.includes('ARCHITECTURE-CONSOLIDATION.md') && world.includes('CURRENT-VERSION-SCOPE.md'));
assert.ok(worldApp.includes('Darkbank'), 'WordDark interface must retain the current Banco/Darkbank app entry');
assert.ok(darknet.includes('sistema independente') && darknet.includes('Ruan'), 'Darknet documentation must preserve the independent Ruan boundary');

console.log('Architecture alignment tests passed.');
