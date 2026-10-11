import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root=dirname(fileURLToPath(import.meta.url));
const read=name=>readFile(resolve(root,name),"utf8");
test("Organize has a sector launcher and a three-column task board",async()=>{
  const html=await read("index.html");
  for(const sector of ["Entrada","Projetos","Rotina","Ideias"])assert.ok(html.includes('data-sector="'+sector+'"'));
  assert.match(html,/cards-todo/);assert.match(html,/cards-doing/);assert.match(html,/cards-done/);
  assert.match(html,/type="date"/);assert.match(html,/rel="manifest"/);
});
test("Organize stores tasks under a key shared with Ruan",async()=>{
  const js=await read("app.js");assert.match(js,/ruan\.organize\.v1/);
  assert.match(js,/localStorage\.setItem\(KEY/);assert.match(js,/priority==="urgent"/);
});
test("Organize JavaScript parses",async()=>{
  const result=spawnSync(process.execPath,["--check",resolve(root,"app.js")],{encoding:"utf8"});
  assert.equal(result.status,0,result.stderr||result.stdout);
});
