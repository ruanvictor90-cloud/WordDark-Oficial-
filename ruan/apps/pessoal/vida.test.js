import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { COLLECTIONS } from "../../../engine/personal-core.js";

const root = new URL("../../../../", import.meta.url);
const read = path => readFileSync(new URL(path, root), "utf8");
const html = read("ruan/apps/pessoal/vida.html");
const script = read("ruan/apps/pessoal/vida.js");
const launcher = read("ruan/apps/pessoal/index.html");
const sw = read("ruan/sw.js");

for (const id of ["life-form", "life-list", "export-backup", "import-backup", "summary-tasks", "summary-goals"]) {
  assert.ok(html.includes('id="' + id + '"'), "Vida HTML precisa conter " + id);
}
assert.ok(launcher.includes('href="./vida.html"'), "O launcher Pessoal deve abrir Vida.");
assert.ok(sw.includes("'./apps/pessoal/vida.html'"), "Service worker deve armazenar Vida HTML.");
assert.ok(sw.includes("'./apps/pessoal/vida.js'"), "Service worker deve armazenar Vida JS.");
assert.ok(sw.includes("'./apps/pessoal/vida.css'"), "Service worker deve armazenar Vida CSS.");
assert.ok(sw.includes("ruan-central-v20"), "O cache precisa mudar para publicar os novos arquivos.");

const match = script.match(/const collections=\[([^\]]+)\]/);
assert.ok(match, "Vida deve declarar explicitamente as coleções usadas.");
const used = [...match[1].matchAll(/"([^"]+)"/g)].map(item => item[1]);
for (const collection of used) assert.ok(COLLECTIONS.includes(collection), "Coleção não suportada: " + collection);
const syntax = spawnSync(process.execPath, ["--check", new URL("./vida.js", import.meta.url).pathname], { encoding: "utf8" });
assert.equal(syntax.status, 0, syntax.stderr || "Falha de sintaxe em vida.js");

console.log("Ruan Vida integration tests passed.");
