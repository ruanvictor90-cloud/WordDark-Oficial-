import assert from "node:assert/strict";
import { createWordDarkWorld } from "../main.js";

const world=createWordDarkWorld();
assert.equal(world.centralControl.id,"CENTRAL-CONTROL");
assert.equal(world.centralControl.school.id,"WORLD-SCHOOL");
assert.equal(world.council.inspectWorldMemory().scope,"WORLD_MEMORY");
world.council.registerLaw({id:"LAW-001",name:"Lei de Direitos e Segurança",rules:["RESPECT_RIGHTS","NO_HARM"]});
world.council.registerTerm({id:"TERM-001",name:"Termos Gerais",text:"Termos do mundo"});
world.council.registerContract({id:"CONTRACT-001",name:"Contrato de Operação",parties:["WORDDARK","SECTOR"]});
const judgment=world.council.judge({subjectId:"CONTENT-001",lawIds:["LAW-001"],contractIds:["CONTRACT-001"],facts:{type:"CONTENT"}});
assert.equal(judgment.scope,"JUDICIARY");

// Conselho: observa recorrência e pode propor realocação de setor.
world.council.addMember({id:"COUNCIL-001",name:"Conselheiro Operacional"});
const review=world.council.reviewWorld({
  recurringUsage:[{itemId:"CONTENT-001",usedSector:"DF-EDITOR",expectedSector:"DF-VALIDATION",evidence:"uso recorrente"}],
  worldSignals:[{subject:"TENDENCIA-001",requiresAttention:true,reason:"sinal recorrente"}]
});
assert.equal(review.findings.length,2);
assert.equal(world.council.decide(review.findings[0].id,"RECLASSIFY",{targetSector:"DF-VALIDATION"}).decision,"RECLASSIFY");

// Escola: aprende com setor/mundo e prepara conteúdo, mas não publica sozinha.
world.sectorLibraries.save("DF-KNOWLEDGE",{id:"KNOW-LOCAL-1",reusable:true,worldFit:"HIGH"});
const analysis=world.school.analyzeLocalKnowledge("DF-KNOWLEDGE",{worldSignals:[{relevant:true,subject:"TREND"}]});
assert.equal(analysis.sectorId,"DF-KNOWLEDGE");
assert.equal(analysis.analyzed.length,1);
const learned=world.school.learnFromWorld({subject:"TREND",reason:"acontecimento relevante"});
assert.equal(learned.source,"WORLD_EVENT");
assert.equal(world.school.externalSources.size,2);
assert.equal(world.school.searchExternal("WORLD-WEB","tendências",{context:{platform:"TEST"}}).success,false);
world.school.registerPlatformGuidelines({platform:"TEST",rules:["RULE-1"],evaluationSignals:["RETENTION","POLICY"]});
assert.equal(world.school.getPlatformGuidelines("TEST").platform,"TEST");

const ready=world.school.prepareContent({title:"Conteúdo pronto",body:"Teste"},{sectorId:"DF-KNOWLEDGE"});
assert.equal(ready.status,"READY_FOR_HUMAN_AUTHORIZATION");
assert.throws(()=>world.school.authorizeForPosting(ready.id),/HUMAN_AUTHORIZATION_REQUIRED/);
const authorized=world.school.authorizeForPosting(ready.id,{authorizedBy:"HUMAN-001"});
assert.equal(authorized.status,"AUTHORIZED_FOR_POSTING");

// Linha de postagem: publicação e agendamento ficam atrás de confirmação humana.
const waiting=world.postingLine.submit({title:"Post autorizado depois"},{source:"SCHOOL"});
assert.equal(waiting.status,"WAITING_HUMAN_AUTHORIZATION");
assert.throws(()=>world.postingLine.authorize(waiting.id,{scheduledAt:"2026-10-01T10:00:00Z"}),/HUMAN_AUTHORIZATION_REQUIRED/);
const scheduled=world.postingLine.authorize(waiting.id,{authorizedBy:"HUMAN-001",scheduledAt:"2026-10-01T10:00:00Z"});
assert.equal(scheduled.status,"SCHEDULED");

// Operação mediana pode voltar para reestruturação; direitos/safety podem voltar para edição.
const registered=world.contentLifecycle.register("OP-CONTENT-001",{contentId:"CONTENT-001"});
assert.equal(registered.outcome,"IN_PROGRESS");
const restructure=world.contentLifecycle.evaluate("OP-CONTENT-001",{metricsOk:false,needsRestructure:true,reason:"métrica abaixo do objetivo"});
assert.equal(restructure.outcome,"NEEDS_RESTRUCTURE");
const revision=world.contentLifecycle.restructure("OP-CONTENT-001",{reason:"melhoria de estrutura"});
assert.equal(revision.revision,1);
const edit=world.contentLifecycle.evaluate("OP-CONTENT-001",{rightsOk:false,reason:"direito precisa revisão"});
assert.equal(edit.outcome,"NEEDS_EDIT");
const redo=world.contentLifecycle.evaluate("OP-CONTENT-001",{unresolved:true,reason:"não foi possível solucionar"});
assert.equal(redo.outcome,"REDO");

console.log("Control + School + Council suite: PASS");

// Conselho consegue consultar memória mundial sem assumir função de execução.
assert.equal(world.council.inspectWorldMemory().scope,"WORLD_MEMORY");
// Conteúdo mediano volta para reestruturação; problema de direitos volta para edição; insolúvel vai para refazer.
const routed=world.contentLifecycle.routeAfterEvaluation("OP-CONTENT-001",{metricsOk:false,reason:"métrica abaixo do objetivo"});
assert.equal(routed.route,"RESTRUCTURE");
const release=world.contentLifecycle.routeAfterEvaluation("OP-CONTENT-001",{rightsOk:true,safetyOk:true,metricsOk:true});
assert.equal(release.route,"WORLD_RELEASE_GATE");

// Resultado parcial = apenas parte dos alvos concluiu; não é o mesmo que resultado mediano.
const partial=world.contentLifecycle.markPartial("OP-CONTENT-001",{completedTargets:["YOUTUBE"],pendingTargets:["INSTAGRAM"],failedTargets:[],reason:"alvos em estados diferentes"});
assert.equal(partial.outcome,"PARTIAL");

// Escola: índice unificado de conhecimento local, memória mundial e conhecimento externo.
world.school.ingestExternalKnowledge("WORLD-WEB",{topic:"TEST",records:[{id:"EXT-1",title:"Tendência externa",platform:"TEST"}]});
assert.equal(world.school.search("Tendência externa",{includeLocal:false,includeCentral:false}).length,1);
// Judiciário do mundo: termos/leis podem apontar não conformidade sem executar a operação.
const legal=world.council.judge({subjectId:"CONTENT-LEGAL-001",lawIds:["LAW-001"],facts:{violations:["NO_HARM"]}});
assert.equal(legal.status,"NON_COMPLIANT");
assert.equal(legal.recommendation,"REQUEST_REVIEW");
console.log("School unified search + Council judicial validation: PASS");
