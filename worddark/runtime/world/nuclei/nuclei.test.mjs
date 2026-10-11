import test from "node:test";
import assert from "node:assert/strict";
import { WordDarkEventBus } from "./event-bus.mjs";
import { WordDarkSectorRegistry } from "./sector-registry.mjs";
import { WordDarkApprovalCenter } from "./approval-center.mjs";
import { WordDarkKernel } from "./world-kernel.mjs";
import { INITIAL_SECTORS } from "./world-seed.mjs";

test("sector registry rejects duplicate identities and keeps hidden infrastructure out of app listings", () => {
  const registry = new WordDarkSectorRegistry({ sectors: INITIAL_SECTORS });
  assert.equal(registry.register(INITIAL_SECTORS[0]).reason, "SECTOR_ID_ALREADY_EXISTS");
  assert.ok(registry.list().some(sector => sector.sectorId === "world.approvals"));
  assert.ok(!registry.list().some(sector => sector.sectorId === "world.road"));
  assert.equal(registry.snapshot().hiddenInfrastructure, 2);
});

test("event bus retains events and isolates listener errors", () => {
  const bus = new WordDarkEventBus({ maxHistory: 2 });
  let delivered = 0;
  bus.subscribe("operation.test", () => { delivered += 1; });
  bus.subscribe("operation.test", () => { throw new Error("listener failure"); });
  bus.publish("operation.test", { operationId: "OP-1" });
  bus.publish("operation.test", { operationId: "OP-2" });
  bus.publish("other.event", {});
  assert.equal(delivered, 2);
  assert.equal(bus.list().length, 2);
  assert.equal(bus.snapshot().listenerErrors, 2);
});

test("approval center requires a separate approver and consumes approval only once", () => {
  let id = 0;
  const approvals = new WordDarkApprovalCenter({ idFactory: () => "APR-" + (++id) });
  const requested = approvals.request({ operationId: "OP-1", requesterId: "client-a", sectorId: "world.darkfactory", action: "content.publish", environment: "PROD", scope: "channel-1", reason: "Publicar conteúdo" });
  assert.equal(requested.success, true);
  assert.equal(approvals.decide(requested.approval.approvalId, { decision: "APPROVE", actorId: "client-a" }).reason, "SELF_APPROVAL_BLOCKED");
  assert.equal(approvals.decide(requested.approval.approvalId, { decision: "APPROVE", actorId: "reviewer-b" }).success, true);
  assert.equal(approvals.consume(requested.approval.approvalId, { operationId: "OP-2", action: "content.publish", environment: "PROD", scope: "channel-1" }).reason, "APPROVAL_CONTEXT_MISMATCH");
  assert.equal(approvals.consume(requested.approval.approvalId, { operationId: "OP-1", action: "content.publish", environment: "PROD", scope: "channel-1" }).success, true);
  assert.equal(approvals.consume(requested.approval.approvalId, { operationId: "OP-1", action: "content.publish", environment: "PROD", scope: "channel-1" }).reason, "APPROVAL_NOT_APPROVED");
});

test("kernel blocks production until explicit approval and delegates execution to existing engine", async () => {
  const events = new WordDarkEventBus();
  const sectors = new WordDarkSectorRegistry({ sectors: INITIAL_SECTORS });
  const approvals = new WordDarkApprovalCenter({ idFactory: () => "APR-PROD-1" });
  const dispatched = [];
  const operationEngine = {
    create: source => ({ ...source, status: "CREATED" }),
    run: async operation => { dispatched.push(operation); return { ...operation, status: "COMPLETED" }; }
  };
  const kernel = new WordDarkKernel({ sectorRegistry: sectors, eventBus: events, approvalCenter: approvals, operationEngine });
  const request = { requestId: "REQ-1", operationId: "OP-1", requesterId: "client-a", originId: "world.marketing", targetSectorId: "world.darkfactory", capability: "content.produce", action: "content.publish", environment: "PROD", scope: "channel-1", payload: { brief: "Test" } };
  const waiting = await kernel.submit(request);
  assert.equal(waiting.status, "WAITING_APPROVAL");
  assert.equal(dispatched.length, 0);
  const repeatedWaiting = await kernel.submit(request);
  assert.equal(repeatedWaiting.status, "WAITING_APPROVAL");
  assert.equal(repeatedWaiting.approvalId, waiting.approvalId);
  assert.equal(repeatedWaiting.reused, true);
  approvals.decide(waiting.approvalId, { decision: "APPROVE", actorId: "reviewer-b" });
  const completed = await kernel.submit({ ...request, requestId: "REQ-2", approvalId: waiting.approvalId });
  assert.equal(completed.status, "COMPLETED");
  assert.equal(dispatched.length, 1);
  assert.equal((await kernel.submit({ ...request, requestId: "REQ-3", approvalId: waiting.approvalId })).reason, "OPERATION_IDEMPOTENCY_BLOCKED");
  assert.equal(kernel.snapshot().operationEngineConnected, true);
});

test("kernel rejects inactive sectors and unregistered capabilities", async () => {
  const kernel = new WordDarkKernel({
    sectorRegistry: new WordDarkSectorRegistry({ sectors: INITIAL_SECTORS }),
    eventBus: new WordDarkEventBus(),
    approvalCenter: new WordDarkApprovalCenter(),
    operationEngine: { create: x => x, run: async x => ({ ...x, status: "COMPLETED" }) }
  });
  const base = { requestId: "REQ-X", operationId: "OP-X", requesterId: "tester", originId: "world.marketing", targetSectorId: "world.bank", capability: "finance.record", action: "finance.record", environment: "TEST", scope: "internal", payload: {} };
  assert.equal((await kernel.submit(base)).reason, "TARGET_SECTOR_INACTIVE");
  assert.equal((await kernel.submit({ ...base, targetSectorId: "world.darkfactory", capability: "finance.record" })).reason, "CAPABILITY_NOT_REGISTERED");
});
