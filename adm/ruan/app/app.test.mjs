import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const read = name => readFile(resolve(root, name), "utf8");

test("Ruan home stays minimal and links to the separate Organize app", async () => {
  const html = await read("index.html");
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /id="alerts"/);
  assert.match(html, /href="\.\.\/apps\/organize\/index\.html"/);
  assert.doesNotMatch(html, /Fábrica de aplicativos|capability-list|app-form/);
});
test("alert widget reads Organize tasks without opening sectors", async () => {
  const source = await read("app.js");
  assert.match(source, /ruan\.organize\.v1/);
  assert.match(source, /priority === "urgent"/);
  assert.match(source, /task\.dueDate/);
});
test("browser JavaScript parses", async () => {
  const result = spawnSync(process.execPath, ["--check", resolve(root, "app.js")], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
test("PWA manifest is standalone and Portuguese", async () => {
  const manifest = JSON.parse(await read("manifest.webmanifest"));
  assert.equal(manifest.name, "Ruan — Núcleo pessoal");
  assert.equal(manifest.lang, "pt-BR");
  assert.equal(manifest.display, "standalone");
});
