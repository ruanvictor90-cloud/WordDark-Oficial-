import assert from "node:assert/strict";
import { createDurableKnowledgeRepository } from "./durable-knowledge-repository.js";
import { createDurableKnowledgeIntakeRegistry } from "./durable-knowledge-intake-registry.js";

const rows = new Map();
const backend = {
  durable: true, atomic: true, type: "atomic-test-double",
  async insertIfAbsent(id, record) {
    if (rows.has(id)) return { inserted: false, record: rows.get(id) };
    rows.set(id, structuredClone(record)); return { inserted: true, record };
  },
  async get(id) { return rows.has(id) ? structuredClone(rows.get(id)) : null; },
  async compareAndSet(id, expected, next) {
    const current = rows.get(id);
    if (!current || current.status !== expected) return false;
    rows.set(id, structuredClone(next)); return true;
  },
  async listByStatus(status, { limit }) { return [...rows.values()].filter(x => x.status === status).slice(0, limit); },
  async searchValidated(query, { limit }) {
    const q = query.toLowerCase();
    return [...rows.values()].filter(x => x.status === "VALIDATED" && (!q || [x.title,x.summary,x.metadata?.content].join(" ").toLowerCase().includes(q))).slice(0,limit);
  },
  async countByStatus(status) { return [...rows.values()].filter(x => x.status === status).length; }
};
const repository = createDurableKnowledgeRepository({ backend });
assert.equal(repository.getStatus().durable, true);
assert.throws(() => createDurableKnowledgeRepository({ backend: { ...backend, atomic: false } }), /DURABLE_ATOMIC_KNOWLEDGE_BACKEND_REQUIRED/);
let archiveCount = 0, auditCount = 0;
const registry = createDurableKnowledgeIntakeRegistry({
  repository, enabled: true,
  authorizeReview: async () => ({ allowed: true, approvalId: "APPROVAL-1" }),
  audit: async () => { auditCount++; },
  archiveValidated: async candidate => { archiveCount++; assert.equal(candidate.status, "VALIDATED"); return { success: true }; },
  now: () => "2026-10-14T00:00:00.000Z"
});
const record = { contract:"worddark.knowledge-intake",version:1,recordId:"DNET-1",providerId:"provider",source:{sourceId:"source-1",url:"https://example.org/guide",title:"Useful guide"},content:"A durable repeatable procedure.",rights:"PUBLIC",license:null,tags:["guide"],provenance:{},receivedAt:"2026-10-14T00:00:00.000Z" };
assert.equal((await registry.receivePending(record,{actorId:"darknet-service"})).status,"RECEIVED_PENDING_REVIEW");
assert.equal((await registry.receivePending(record,{actorId:"darknet-service"})).status,"DUPLICATE_SKIPPED");
assert.equal((await registry.searchValidated("repeatable")).length,0);
const reviewer = { authenticated:true,actorId:"reviewer",sessionId:"session-1" };
const [one,two] = await Promise.all([
  registry.review("DNET-1",{decision:"VALIDATE",trustedContext:reviewer,reason:"Reviewed source"}),
  registry.review("DNET-1",{decision:"VALIDATE",trustedContext:reviewer,reason:"Concurrent duplicate review"})
]);
assert.equal([one,two].filter(x=>x.status==="KNOWLEDGE_VALIDATED_AND_ARCHIVED").length,1);
assert.equal(archiveCount,1);
assert.equal((await registry.searchValidated("repeatable"))[0].status,"VALIDATED");
assert.equal((await registry.getStatus()).validated,1);
assert.equal(auditCount,3);
console.log("durable-knowledge-intake-registry.test: OK");
