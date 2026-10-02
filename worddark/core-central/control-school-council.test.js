import assert from "node:assert/strict";
import { createWordDarkWorld } from "../main.js";

const world=createWordDarkWorld();

// Conselho: observa recorrência e pode propor realocação de setor.
world.council.addMember({id:"COUNCIL-001",name:"Conselheiro Operacional"});
const review=world.council.reviewWorld({
  recurringUsage:[{itemId:"CONTENT-001",usedSector:"DF-EDITOR",expectedSector:"DF-VALIDATION",evidence:"uso recorrente"}],
  worldSignals:[{subject:"TENDENCIA-001",requiresAttention:true,reason:"sinal recorrente"}]
});
assert.equal(review.findings.length,2);
assert.equal(world.council.decide(review.findings[0].id,"RECLASSIFY",{targetSector:"DF-VALIDATION"}).decision,"RECLASSIFY");

// Escola: aprende com setor/mundo e prepara conteúdo, mas não publica sozinha.
const analysis=world.school.analyzeLocalKnowledge("DF-KNOWLEDGE",{records:[{id:"KNOW-1",reusable:true,worldFit:"HIGH"}],worldSignals:[{relevant:true,subject:"TREND"}]});
assert.equal(analysis.sectorId,"DF-KNOWLEDGE");
const learned=world.school.learnFromWorld({subject:"TREND",reason:"acontecimento relevante"});
assert.equal(learned.source,"WORLD_EVENT");

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
