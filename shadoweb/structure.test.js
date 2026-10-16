import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = name => readFileSync(new URL("./"+name, import.meta.url), "utf8");
const html=read("index.html"), app=read("app.js"), css=read("shadoweb.css"), sw=read("sw.js");
const apiContract=JSON.parse(read("api-contract.json")), pluginSchema=JSON.parse(read("plugin-manifest.schema.json"));
test("Shadoweb exposes the conventional browser and connected-world modules",()=>{
  for(const id of ["home","favorites","history","connections","world","knowledge","plugins","audit"]) assert.match(html,new RegExp('id="view-'+id+'"'));
  assert.match(html,/darkEye/); assert.match(html,/MUNDO CONECTADO/); assert.match(html,/type="module" src="\.\/app\.js"/);
});
test("Shadoweb source is ecosystem-named and has no old personal app labels",()=>{
  assert.doesNotMatch(html+app,/Ruan|ruan|ruan-logo|personal-store|sovereign-core/i);
  assert.doesNotMatch(app,/\.\.\/ruan\//i);
});
test("browser blocks dangerous schemes and source avoids unsafe HTML execution",()=>{
  assert.match(app,/javascript\|data\|file\|intent\|blob/);
  assert.doesNotMatch(app,/\.innerHTML\s*=|\beval\s*\(|new Function\s*\(/);
  assert.match(html,/Content-Security-Policy/);
  assert.match(sw,/cache\.addAll/);
});
test("service worker caches only local same-origin GET requests",()=>{
  assert.match(sw,/request\.method!=="GET"/);
  assert.match(sw,/url\.origin!==self\.location\.origin/);
});

test("machine-readable API and plugin contracts are versioned and not falsely public",()=>{
  assert.equal(apiContract.contractVersion,"1.0.0");
  assert.equal(apiContract.httpServerActive,false);
  assert.equal(pluginSchema.properties.schemaVersion.const,"1.0.0");
  assert.equal(pluginSchema.additionalProperties,false);
});
