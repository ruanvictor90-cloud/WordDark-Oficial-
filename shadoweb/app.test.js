import test from "node:test";
import assert from "node:assert/strict";
import { validateRequest, validatePluginManifest } from "./contracts.js";
import { AuditLog } from "./audit.js";
import { Gate } from "./gate.js";
import { Bridge } from "./bridge.js";
import { builtInConnectors, connectorHandlers } from "./connectors.js";
import { PluginManager } from "./plugin-manager.js";
import { Knowledge } from "./knowledge.js";

class MemoryStorage {
  constructor(){this.data=new Map();}
  getItem(k){return this.data.has(k)?this.data.get(k):null;}
  setItem(k,v){this.data.set(k,String(v));}
  removeItem(k){this.data.delete(k);}
}

test("API contract validates IDs and rejects oversized or malformed requests",()=>{
  assert.equal(validateRequest({connectorId:"wikipedia",action:"search",input:{query:"Shadoweb"}}).version,"1.0.0");
  assert.throws(()=>validateRequest({connectorId:"../private",action:"search",input:{}}),/Identificador/);
  assert.throws(()=>validateRequest({connectorId:"wikipedia",action:"search",input:"not-an-object"}),/objeto/);
  assert.throws(()=>validateRequest({connectorId:"wikipedia",action:"search",input:{data:"x".repeat(13000)}}),/limite/);
});

test("plugin manifests are declarative and reject arbitrary connectors",()=>{
  const valid={id:"wiki-helper",name:"Wiki Helper",version:"1.0.0",description:"Busca conteúdo público.",connectorId:"wikipedia",permissions:["connector.read"]};
  assert.equal(validatePluginManifest(valid).enabled,false);
  assert.throws(()=>validatePluginManifest({...valid,connectorId:"https://attacker.example"}),/conector/);
  assert.throws(()=>validatePluginManifest({...valid,permissions:["filesystem.root"]}),/permissões/);
});

test("Gate requires both enabled connector and explicit scoped permission",()=>{
  const storage=new MemoryStorage(), gate=new Gate(storage), connector={id:"wikipedia",enabled:false};
  assert.throws(()=>gate.authorize(connector,"connector.read"),/desativado/);
  connector.enabled=true;
  assert.throws(()=>gate.authorize(connector,"connector.read"),/Permissão/);
  gate.grant("wikipedia",["connector.read"]);
  assert.doesNotThrow(()=>gate.authorize(connector,"connector.read"));
  gate.revoke("wikipedia");
  assert.throws(()=>gate.authorize(connector,"connector.read"),/Permissão/);
});

test("Bridge logs requests, denies missing permissions and executes only registered handlers",async()=>{
  const storage=new MemoryStorage(), audit=new AuditLog(storage), gate=new Gate(storage);
  const connectors=builtInConnectors.map(c=>({...c,enabled:true}));
  const handlers={...connectorHandlers,wikipedia:async()=>[{title:"Test result"}]};
  const bridge=new Bridge({connectors,handlers,gate,audit});
  const denied=await bridge.request({connectorId:"wikipedia",action:"search",input:{query:"hello"}},{scope:"connector.read"});
  assert.equal(denied.ok,false); assert.match(denied.error,/Permissão/);
  gate.grant("wikipedia",["connector.read"]);
  const success=await bridge.request({connectorId:"wikipedia",action:"search",input:{query:"hello"}},{scope:"connector.read"});
  assert.equal(success.ok,true);
  assert.equal(success.result[0].title,"Test result");
  assert.ok(audit.list().some(row=>row.event==="gateway.request"));
  assert.ok(audit.list().some(row=>row.event==="gateway.denied"));
});

test("audit rejects unknown events and redacts obvious secret-like values",()=>{
  const audit=new AuditLog(new MemoryStorage());
  assert.throws(()=>audit.record("unknown.event",{}),/não permitido/);
  const row=audit.record("gateway.error",{reason:"api_key=abc123"});
  assert.match(row.detail.reason,/REDACTED/);
});

test("knowledge notes are validated, searchable and exportable",()=>{
  const storage=new MemoryStorage(), audit=new AuditLog(storage), knowledge=new Knowledge({storage,audit});
  knowledge.save({title:"Projeto Shadoweb",body:"mundo conectado e plugins"});
  assert.equal(knowledge.list().length,1);
  assert.equal(knowledge.list()[0].title,"Projeto Shadoweb");
  assert.equal(knowledge.export().format,"shadoweb-knowledge");
  assert.throws(()=>knowledge.save({title:"",body:"x"}),/obrigatório/);
  knowledge.remove(knowledge.list()[0].id);
  assert.equal(knowledge.list().length,0);
});

test("plugin manager imports inactive manifests and never evaluates code",()=>{
  const storage=new MemoryStorage(), audit=new AuditLog(storage), manager=new PluginManager({storage,audit});
  const plugin=manager.importManifest({id:"wiki-helper",name:"Wiki Helper",version:"1.0",description:"Somente metadados.",connectorId:"wikipedia",permissions:["connector.read"]});
  assert.equal(plugin.enabled,false);
  assert.throws(()=>manager.importManifest({id:"wiki-helper",name:"Duplicado",version:"1",description:"Duplicado",connectorId:"wikipedia",permissions:[]}),/Já existe/);
  assert.equal(manager.setEnabled("wiki-helper",true).enabled,true);
  assert.ok(audit.list().some(row=>row.event==="plugin.imported"));
});
