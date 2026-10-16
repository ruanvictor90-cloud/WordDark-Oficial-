import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("./app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("./app.css", import.meta.url), "utf8");
const core = readFileSync(new URL("./core.js", import.meta.url), "utf8");

test("darkHub has two analysis hubs, app creation and a central dashboard", () => {
  for (const id of ["dashboard", "ecosystem", "technical", "creator", "registry", "security", "activity"]) assert.match(html, new RegExp('data-view="' + id + '"'));
  assert.match(html, /Análise do ecossistema/);
  assert.match(html, /Análise técnica/);
  assert.match(html, /Criador de aplicativos/);
  assert.match(html, /Centro de comando/);
});

test("darkHub source has no former personal-app naming or cross-app legacy imports", () => {
  assert.doesNotMatch(html + app + css + core, /Ruan|ruan|ruan-logo|personal-store|sovereign-core/i);
  assert.doesNotMatch(app, /from\s+["'][^"']*\.\.\//);
});

test("security boundaries are explicit and user records are rendered as text", () => {
  assert.match(html, /Content-Security-Policy/);
  assert.match(core, /PBKDF2-SHA-256/);
  assert.match(core, /AES-GCM/);
  assert.match(app, /textContent/);
  assert.match(app, /clearSensitiveViews/);
  assert.match(app, /vault\.lock\(\)/);
  assert.match(html, /Nenhuma conexão externa está ativa/);
});

test("encrypted backup controls are present and connected to validated vault methods", () => {
  assert.match(html, /id="export-backup"/);
  assert.match(html, /id="restore-backup"/);
  assert.match(html, /id="backup-file"/);
  assert.match(app, /exportEncryptedBackup/);
  assert.match(app, /restoreEncryptedBackup/);
  assert.match(app, /substituirá os dados locais atuais/);
  assert.match(core, /#openEnvelope/);
});
