import test from "node:test";
import assert from "node:assert/strict";
import { normalizeHttps, isLocalHost } from "./address.js";
import { readFileSync } from "node:fs";
const read = name => readFileSync(new URL("./"+name, import.meta.url), "utf8");
const html=read("index.html"), app=read("app.js"), css=read("shadoweb.css"), sw=read("sw.js"), address=read("address.js");
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
  assert.match(address,/javascript\|data\|file\|intent\|blob/);
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

test("navigation accepts HTTPS and blocks local/private targets even with explicit schemes",()=>{
  assert.equal(normalizeHttps("https://example.com"),"https://example.com/");
  assert.equal(normalizeHttps("words to search","google"),"https://www.google.com/search?q=words%20to%20search");
  for(const url of ["https://localhost","https://127.0.0.1/admin","https://192.168.1.1","https://10.0.0.4","https://[::1]","javascript:alert(1)"]) assert.throws(()=>normalizeHttps(url));
  assert.equal(isLocalHost("172.20.0.1"),true);
  assert.equal(isLocalHost("example.com"),false);
});

test("Shadoweb visual identity stays consistent across header, PWA and Android assets",()=>{
  const brand=read("brand-mark.svg"), icon=read("icon.svg"), splash=read("splash.svg"), manifest=JSON.parse(read("manifest.webmanifest"));
  assert.match(html,/src="\.\/brand-mark\.svg"/);
  assert.match(brand,/#d0a8ff/i); assert.match(brand,/#87e2b8/i);
  assert.match(icon,/#0b0711/i); assert.match(icon,/#d0a8ff/i); assert.match(icon,/#87e2b8/i);
  assert.match(splash,/SHADOWEB/); assert.match(splash,/#0b0711/i);
  assert.equal(manifest.name,"Shadoweb");
  assert.equal(manifest.icons[0].src,"./icon.svg");
});
