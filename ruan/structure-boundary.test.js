import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const repositoryRoot = path.resolve(root, '..');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}
function insideRuan(absolute) {
  const relative = path.relative(root, absolute);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}
function resolveLocalReference(sourceFile, rawReference) {
  const reference = rawReference.trim();
  if (!reference || reference.startsWith('#') || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference)) return;
  const clean = reference.split(/[?#]/, 1)[0];
  if (!clean) return;
  assert.ok(!clean.startsWith('/'), `Use a relative app path, not a site-root path: ${reference}`);
  if (sourceFile === path.join(root, 'index.html') && reference === '../hub/index.html') return;
  const resolved = path.resolve(path.dirname(sourceFile), decodeURIComponent(clean));
  assert.ok(insideRuan(resolved), `Reference escapes the Ruan app boundary: ${path.relative(repositoryRoot, sourceFile)} -> ${reference}`);
  assert.ok(existsSync(resolved), `Missing local reference: ${path.relative(repositoryRoot, sourceFile)} -> ${reference}`);
}

const files = walk(root);
const htmlFiles = files.filter(file => file.endsWith('.html'));
assert.ok(htmlFiles.includes(path.join(root, 'index.html')), 'Ruan central page must exist');

const centralHtml = readFileSync(path.join(root, 'index.html'), 'utf8');
assert.equal((centralHtml.match(/class="ruan-home-grid"/g) || []).length, 1, 'Ruan central must expose one app grid');
assert.equal((centralHtml.match(/class="ruan-home-app/g) || []).length, 4, 'Ruan central must expose four named app shortcuts');
assert.equal((centralHtml.match(/class="ruan-info-widgets"/g) || []).length, 1, 'Ruan central must contain one summary widget section');
assert.equal((centralHtml.match(/id="finance-widget-value"/g) || []).length, 1, 'Finance widget ID must be unique');
assert.equal((centralHtml.match(/id="tasks-widget-value"/g) || []).length, 1, 'Task widget ID must be unique');
assert.ok(!centralHtml.includes('apps-drawer') && !centralHtml.includes('apps-toggle'), 'The Ruan app drawer is temporarily removed');

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  if (file !== path.join(root, 'index.html')) {
    assert.ok(!html.includes('apps-drawer'), `App drawer leaked into ${path.relative(root, file)}`);
    assert.ok(!html.includes('apps-toggle'), `App drawer toggle leaked into ${path.relative(root, file)}`);
    assert.equal((html.match(/<nav class="area-nav"/g) || []).length, 0, `Individual app pages must not repeat an area navigation row: ${path.relative(root, file)}`);
  }
  for (const match of html.matchAll(/\b(?:href|src|action)\s*=\s*["']([^"']+)["']/gi)) {
    resolveLocalReference(file, match[1]);
  }
}

for (const file of files.filter(file => /\.(?:html|js|css|webmanifest)$/.test(file) && !file.endsWith('.test.js'))) {
  const source = readFileSync(file, 'utf8');
  const permittedHubShortcut = file === path.join(root, 'index.html')
    ? source.replace(/<a class="ruan-home-app hub-launch"[\s\S]*?<\/a>/, '')
    : source;
  assert.ok(!/worddark/i.test(permittedHubShortcut), `Ruan runtime must not depend on another project's naming except the explicit Hub launcher shortcut: ${path.relative(root, file)}`);
  if (file.endsWith('.js')) {
    for (const match of source.matchAll(/\b(?:from\s*|import\s*\()\s*["']([^"']+)["']/g)) {
      resolveLocalReference(file, match[1]);
    }
  }
  if (file.endsWith('.css')) {
    for (const match of source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
      resolveLocalReference(file, match[1]);
    }
  }
}

const manifest = JSON.parse(readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons || []) resolveLocalReference(path.join(root, 'manifest.webmanifest'), icon.src);

const sw = readFileSync(path.join(root, 'sw.js'), 'utf8');
for (const match of sw.matchAll(/["'](\.\/[^"']+)["']/g)) {
  const candidate = match[1];
  if (candidate === './') continue;
  resolveLocalReference(path.join(root, 'sw.js'), candidate);
}

console.log('Ruan structure boundary tests passed.');
