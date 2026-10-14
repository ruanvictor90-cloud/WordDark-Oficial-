import assert from 'node:assert/strict';
import { normalizeDestination, safeLabel } from './darkeye-core.js';
assert.equal(normalizeDestination('https://example.com'), 'https://example.com/');
assert.equal(normalizeDestination('example.com'), 'https://example.com');
assert.equal(normalizeDestination('gatos pretos'), 'https://duckduckgo.com/?q=gatos%20pretos');
assert.throws(() => normalizeDestination('javascript:alert(1)'), /não é permitido/);
assert.throws(() => normalizeDestination('file:///etc/passwd'), /não é permitido/);
assert.equal(safeLabel('https://www.example.com/path'), 'example.com/path');
console.log('DarkEye core tests passed.');
