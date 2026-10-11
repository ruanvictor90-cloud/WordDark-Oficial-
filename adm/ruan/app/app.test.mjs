import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const read = name => readFile(resolve(root, name), "utf8");

test("Ruan app shell references local assets and is Portuguese mobile-first", async () => {
  const html = await read("index.html");
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /href="\.\/app\.css"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(html, /rel="manifest"/);
  assert.match(html, /id="view-fabrica"/);
  assert.match(html, /id="view-conexoes"/);
});

test("browser application JavaScript parses without syntax errors", () => {
  const result = spawnSync(process.execPath, ["--check", resolve(root, "app.js")], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("PWA manifest declares a standalone Portuguese application", async () => {
  const manifest = JSON.parse(await read("manifest.webmanifest"));
  assert.equal(manifest.name, "Ruan — Central pessoal");
  assert.equal(manifest.lang, "pt-BR");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./index.html");
});

test("new apps start without grants and individual export stays separate", async () => {
  const source = await read("app.js");
  assert.match(source, /grantedCapabilities:\[\]/);
  assert.match(source, /Manifesto individual exportado/);
  assert.match(source, /ruan-app-/);
  assert.match(source, /localStorage\.setItem\(STORE_KEY/);
  assert.match(source, /world\.request/);
  assert.match(source, /not-yet-packaged/);
});

test("interface clearly documents that browser grants are not a security sandbox", async () => {
  const html = await read("index.html");
  const readme = await read("README.md");
  const source = await read("app.js");
  assert.match(source, /ainda sem enforcement de runtime/i);
  assert.match(readme, /não é um sandbox de segurança/i);
  assert.match(readme, /não chama diretamente.*RuanEngine/i);
});