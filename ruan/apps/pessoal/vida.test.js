import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { COLLECTIONS } from "../../engine/personal-core.js";

const root = new URL("../../../", import.meta.url);
const read = path => readFileSync(new URL(path, root), "utf8");
const html = read("ruan/apps/pessoal/vida.html");
const script = read("ruan/apps/pessoal/vida.js");
const launcher = read("ruan/apps/pessoal/index.html");
const sw = read("ruan/sw.js");

for (const id of ["life-form", "life-list", "life-search", "export-backup", "import-backup", "summary-tasks", "summary-goals", "summary-documents", "summary-wellbeing"]) {
  assert.ok(html.includes('id="' + id + '"'), "Vida HTML precisa conter " + id);
}
assert.ok(launcher.includes('href="./vida.html"'), "O launcher Pessoal deve abrir Vida.");
assert.ok(sw.includes("'./apps/pessoal/vida.html'"), "Service worker deve armazenar Vida HTML.");
assert.ok(sw.includes("'./apps/pessoal/vida.js'"), "Service worker deve armazenar Vida JS.");
assert.ok(sw.includes("'./apps/pessoal/vida.css'"), "Service worker deve armazenar Vida CSS.");
assert.ok(sw.includes("ruan-central-v25"), "O cache precisa mudar para publicar os novos arquivos.");
assert.ok(html.includes('data-filter="documents"'), "Vida deve permitir filtrar documentos.");
assert.ok(html.includes('data-filter="wellbeingLogs"'), "Vida deve permitir filtrar registros de bem-estar.");
assert.ok(script.includes('$("life-search").addEventListener("input",render)'), "A busca deve atualizar a lista enquanto o usuário digita.");
assert.ok(script.includes('$("summary-documents").textContent=(s.documents||[]).length'), "O resumo deve contar documentos.");
assert.ok(script.includes('$("summary-wellbeing").textContent=(s.wellbeingLogs||[]).length'), "O resumo deve contar registros de bem-estar.");
assert.ok(script.includes('Editar categoria:'), "Os registros devem permitir editar a categoria.");
assert.ok(script.includes('Editar data ou prazo'), "Os registros devem permitir editar data ou prazo.");
assert.ok(script.includes('Use a data no formato AAAA-MM-DD.'), "A edição deve explicar o formato de data esperado.");

const match = script.match(/const collections=\[([^\]]+)\]/);
assert.ok(match, "Vida deve declarar explicitamente as coleções usadas.");
const used = [...match[1].matchAll(/"([^"]+)"/g)].map(item => item[1]);
for (const collection of used) assert.ok(COLLECTIONS.includes(collection), "Coleção não suportada: " + collection);
const syntax = spawnSync(process.execPath, ["--check", new URL("./vida.js", import.meta.url).pathname], { encoding: "utf8" });
assert.equal(syntax.status, 0, syntax.stderr || "Falha de sintaxe em vida.js");

console.log("Ruan Vida integration tests passed.");
