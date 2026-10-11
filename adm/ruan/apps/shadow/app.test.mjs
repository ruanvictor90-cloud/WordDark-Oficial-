import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
const root=dirname(fileURLToPath(import.meta.url));
const read=async(...parts)=>readFile(resolve(root,...parts),"utf8");
test("Shadow preserves its browser and exposes Dark as an app inside Shadow",async()=>{
 const html=await read("index.html");
 assert.match(html,/Shadow — DarkEye Browser/);
 assert.match(html,/Central de aplicativos/);
 assert.match(html,/href="\.\/dark\/index\.html"/);
 assert.match(html,/>Dark</);
});
test("Dark contains the central structural line and modular catalog",async()=>{
 const html=await read("dark","index.html");
 const js=await read("dark","app.js");
 assert.match(html,/Linha Central/);
 assert.match(html,/Coleta ampla\. Conexões mínimas\./);
 assert.match(html,/Mapa desmontado para triagem/);
 assert.match(html,/Ruan ADM/);
 assert.match(html,/Rodovia/);
 assert.match(html,/Em desenvolvimento/);
 assert.match(js,/Central de Conexões/);
 assert.match(js,/Dark Factory/);
 assert.match(js,/DarkCommerce/);
 assert.match(js,/Ruan ADM permanece fora do controle do WordDark/);
 for(const item of ["Núcleo de Operações","Motor de aprendizagem","Parada de emergência","Adaptadores OAuth e APIs","Dublagem e vozes","Inventário de branches e versões","Caixa de ideias antigas"]){assert.ok(js.includes(item),`missing triage item: ${item}`)}
 assert.ok((js.match(/\{id:/g)||[]).length>=80,"expected a broad, disassembled triage catalog");
 assert.ok((js.match(/statusText:/g)||[]).length>=20,"expected a broad catalog with explicit states");
});
test("Shadow and Dark scripts parse and Shadow manifest remains valid",async()=>{
 for(const file of ["app.js","dark/app.js"]){
  const result=spawnSync(process.execPath,["--check",resolve(root,file)],{encoding:"utf8"});
  assert.equal(result.status,0,result.stderr||result.stdout);
 }
 const manifest=JSON.parse(await read("manifest.webmanifest"));
 assert.equal(manifest.short_name,"Shadow");
 assert.equal(manifest.display,"standalone");
});
