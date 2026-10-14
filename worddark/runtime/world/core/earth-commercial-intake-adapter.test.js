import assert from "node:assert/strict";
import { createEarthCommercialIntakeAdapter } from "./earth-commercial-intake-adapter.js";

function makeFixture({ enabled = true, allowed = true, requesterResolved = true } = {}) {
  const demand = {
    demandId: "demand-001", requester: "Cliente exemplo", need: "Pacote de conteúdo",
    category: "content", budget: 100, deadline: "2026-10-20",
    recurrence: "ONE_TIME", businessContext: { product: "item-demo" }, status: "CAPTURED"
  };
  const demands = new Map([[demand.demandId, structuredClone(demand)]]);
  const leads = new Map();
  const auditEvents = [];
  const earthEngine = {
    getDemand(id) { const item = demands.get(id); return item ? structuredClone(item) : null; },
    linkCommercialLead(demandId, leadId, actorId) {
      const item = demands.get(demandId);
      if (!item) throw new Error("DEMAND_NOT_FOUND");
      if (item.status === "LEAD_CREATED" && item.commercialLeadId === leadId) return structuredClone(item);
      if (item.status !== "CAPTURED") throw new Error("INVALID_DEMAND_STATE");
      const next = { ...item, status: "LEAD_CREATED", commercialLeadId: leadId, linkedBy: actorId };
      demands.set(demandId, next);
      return structuredClone(next);
    }
  };
  const commercialEngine = {
    getLead(id) { const item = leads.get(id); return item ? structuredClone(item) : null; },
    createLead(input) {
      if (leads.has(input.leadId)) throw new Error("DUPLICATE_LEAD");
      const lead = { ...structuredClone(input), status: "NEW" };
      leads.set(input.leadId, lead);
      return structuredClone(lead);
    }
  };
  const idempotency = new Map();
  const adapter = createEarthCommercialIntakeAdapter({
    earthEngine, commercialEngine,
    authenticateOperator: async () => ({ authenticated: true, actorId: "operator-1", sessionId: "session-1" }),
    authorizeIntake: async () => ({ allowed }),
    resolveRequester: async () => requesterResolved ? ({ requesterId: "client-001", name: "Cliente exemplo", channel: "MANUAL" }) : null,
    audit: async event => { auditEvents.push(event); },
    idempotencyStore: { async executeOnce(key, handler) {
      if (idempotency.has(key)) return idempotency.get(key);
      const result = await handler();
      idempotency.set(key, result);
      return result;
    } },
    enabled
  });
  return { adapter, earthEngine, commercialEngine, demands, leads, auditEvents };
}

const disabled = makeFixture({ enabled: false });
assert.equal((await disabled.adapter.intake({ requestId: "req-1", demandId: "demand-001" })).status, "EARTH_COMMERCIAL_INTAKE_DISABLED");
assert.equal(disabled.leads.size, 0);

const denied = makeFixture({ allowed: false });
assert.equal((await denied.adapter.intake({ requestId: "req-2", demandId: "demand-001" })).status, "EARTH_COMMERCIAL_INTAKE_DENIED");
assert.equal(denied.leads.size, 0);

const noRequester = makeFixture({ requesterResolved: false });
assert.equal((await noRequester.adapter.intake({ requestId: "req-3", demandId: "demand-001" })).status, "EARTH_REQUESTER_IDENTITY_REQUIRED");
assert.equal(noRequester.leads.size, 0);

const ready = makeFixture();
const request = { requestId: "req-4", demandId: "demand-001" };
const result = await ready.adapter.intake(request);
assert.deepEqual(result, { success: true, status: "LEAD_CREATED", linked: true, demandId: "demand-001", leadId: "lead-demand-001" });
assert.equal(ready.demands.get("demand-001").status, "LEAD_CREATED");
assert.equal(ready.demands.get("demand-001").commercialLeadId, "lead-demand-001");
assert.equal(ready.leads.get("lead-demand-001").sourceDemandId, "demand-001");
assert.equal(ready.leads.get("lead-demand-001").businessContext.product, "item-demo");
assert.equal(ready.leads.get("lead-demand-001").status, "NEW");
assert.ok(ready.auditEvents.some(item => item.event === "EARTH_DEMAND_INTAKE_AUTHORIZED"));
assert.ok(ready.auditEvents.some(item => item.event === "EARTH_DEMAND_LINKED_TO_COMMERCIAL_LEAD"));
const duplicate = await ready.adapter.intake({ ...request, requestId: "req-5" });
assert.deepEqual(duplicate, result);
assert.equal(ready.leads.size, 1, "the same demand must not create multiple leads");
assert.equal(ready.adapter.getStatus().salesEnabled, false);

console.log("earth-commercial-intake-adapter: OK");
