import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("./primeira-venda.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(script, "A tela comercial precisa ter um script inline.");
assert.match(html, /worddark\.commercial\.firstSale\.v1/, "A tela deve usar uma chave local versionada.");
assert.match(html, /LOCAL_ONLY/, "O backup deve identificar os dados como locais.");
assert.match(html, /receiptConfirmed/, "O registro deve separar valor recebido de recebimento confirmado.");
assert.match(html, /Exportar backup/, "A tela deve permitir exportar os registros.");
assert.doesNotThrow(() => new Function(script[1]), "O JavaScript da tela comercial deve ser sintaticamente válido.");
console.log("Primeira venda: estrutura e sintaxe da tela verificadas.");
