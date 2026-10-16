import assert from 'node:assert/strict';
import { safeRuanHref } from './notifications.js';

assert.equal(safeRuanHref('./apps/pessoal/tarefas.html'), './apps/pessoal/tarefas.html');
assert.equal(safeRuanHref('./apps/pessoal/financeiro.html?view=month#summary'), './apps/pessoal/financeiro.html?view=month#summary');
assert.equal(safeRuanHref('./tarefas.html'), './apps/pessoal/tarefas.html', 'Legacy task links must resolve to the actual app page');
assert.equal(safeRuanHref('./financeiro.html'), './apps/pessoal/financeiro.html', 'Legacy finance links must resolve to the actual app page');
assert.equal(safeRuanHref('javascript:alert(1)'), './index.html', 'Script URLs must be rejected');
assert.equal(safeRuanHref('https://example.com/'), './index.html', 'External destinations must be rejected');
assert.equal(safeRuanHref('../hub/index.html'), './index.html', 'Notification destinations must not cross the Ruan boundary');
assert.equal(safeRuanHref('//example.com/path.html'), './index.html', 'Protocol-relative external destinations must be rejected');
console.log('Ruan notification destination tests passed.');
