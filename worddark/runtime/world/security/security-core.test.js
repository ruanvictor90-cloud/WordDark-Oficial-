const assert=require("assert");
const WordDarkAuthorityPolicy=require("./authority-policy");
const WordDarkAuditLedger=require("./audit-ledger");
const WordDarkIncidentResponse=require("./incident-response");
const WordDarkRecoveryManifest=require("./recovery-manifest");
const WordDarkSecretPolicy=require("./secret-policy");
const WordDarkSecurityCore=require("./security-core");

(function authority(){
  const p=new WordDarkAuthorityPolicy({rootAuthorityId:"RUAN"});
  assert.equal(p.authorize({actorId:"WORLD",actorAuthority:"WORLD",action:"ACCESS_SCOPE",targetId:"RUAN",targetAuthority:"ADM"}).allowed,false);
  assert.equal(p.authorize({actorId:"WORLD",actorAuthority:"WORLD",action:"ELEVATE_AUTHORITY",targetAuthority:"WORLD"}).allowed,false);
  assert.equal(p.authorize({actorId:"RUAN",action:"ELEVATE_AUTHORITY",targetAuthority:"ADM"}).allowed,true);
})();

(function audit(){
  const a=new WordDarkAuditLedger({clock:()=> "2026-10-05T00:00:00.000Z"});
  a.append({actorId:"RUAN",action:"TEST",resourceId:"R1"});
  a.append({actorId:"WORLD",action:"ROUTE",resourceId:"R1"});
  assert.equal(a.verify().valid,true);
  a.entries[1].result="TAMPERED";
  assert.equal(a.verify().valid,false);
})();

(function incident(){
  const a=new WordDarkAuditLedger();
  const ir=new WordDarkIncidentResponse({auditLedger:a});
  const i=ir.create({severity:"HIGH",title:"Teste de segurança"});
  assert.equal(ir.isFrozen(i.incidentId),false);
  ir.transition(i.incidentId,"CONTAINED",{actorId:"RUAN"});
  assert.equal(ir.isFrozen(i.incidentId),true);
  ir.transition(i.incidentId,"RECOVERING",{actorId:"RUAN"});
  ir.transition(i.incidentId,"RESOLVED",{actorId:"RUAN"});
  ir.transition(i.incidentId,"CLOSED",{actorId:"RUAN"});
  assert.equal(ir.isFrozen(i.incidentId),false);
})();

(function recovery(){
  const m=new WordDarkRecoveryManifest();
  assert.equal(m.status().ready,false);
  for(const type of m.required) m.register(type,{verified:true});
  assert.equal(m.status().ready,true);
})();

(function secrets(){
  const s=new WordDarkSecretPolicy();
  assert.equal(s.assertClean("const x='hello';").clean,true);
  assert.equal(s.assertClean("const apiKey='1234567890abcdef';").clean,false);
  assert.equal(s.assertClean("-----BEGIN PRIVATE KEY-----").clean,false);
})();

(function facade(){
  const s=new WordDarkSecurityCore({authority:{rootAuthorityId:"RUAN"}});
  assert.equal(s.authorize({actorId:"WORLD",actorAuthority:"WORLD",action:"ACCESS_SCOPE",targetId:"RUAN",targetAuthority:"ADM"}).allowed,false);
  assert.equal(s.getHealth().status,"HEALTHY");
})();

console.log("WordDark security core tests: OK");
