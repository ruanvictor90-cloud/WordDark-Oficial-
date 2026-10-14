import assert from "node:assert/strict";
import { createInitialState } from "./ruan-core.js";
import { createBill, markBillPaid, setGoalProgress, createQuickCapture, routeQuickCapture, completeTask, getDomainServiceVersion } from "./ruan-domain-services.js";

const now = "2026-10-14T12:00:00.000Z";
const idFactory = prefix => prefix + "_test";
assert.equal(getDomainServiceVersion(), 3);

let state = createInitialState();
let bill = createBill(state, { title: "Internet", amount: 100, dueDate: "2026-10-20", category: "Casa" }, { now, idFactory });
assert.equal(bill.ok, true);
state = bill.state;
assert.equal(state.bills[0].status, "open");
assert.equal(createBill(state, { title: " ", amount: 10 }, { now, idFactory }).code, "title_required");
assert.equal(createBill(state, { title: "Luz", amount: -1 }, { now, idFactory }).code, "invalid_amount");
assert.equal(createBill(state, { title: "Luz", amount: 10, dueDate: "2026-02-30" }, { now, idFactory }).code, "invalid_due_date");

const paid = markBillPaid(state, "bill_test", { now });
assert.equal(paid.ok, true);
assert.equal(paid.state.bills[0].status, "paid");
assert.equal(markBillPaid(paid.state, "bill_test", { now }).unchanged, true);
assert.equal(markBillPaid(state, "missing", { now }).code, "bill_not_found");

state.goals.push({ id: "goal1", title: "Guardar dinheiro", status: "active", progress: 0 });
const progress = setGoalProgress(state, "goal1", 45, { now });
assert.equal(progress.record.progress, 45);
assert.equal(setGoalProgress(progress.state, "goal1", 101, { now }).code, "invalid_progress");
assert.equal(setGoalProgress(state, "missing", 10, { now }).code, "goal_not_found");

const capture = createQuickCapture(state, { text: "Organizar documentos", source: "quickbar" }, { now, idFactory });
assert.equal(capture.ok, true);
assert.equal(capture.record.status, "inbox");
const routed = routeQuickCapture(capture.state, capture.record.id, "task", { now, idFactory });
assert.equal(routed.ok, true);
assert.equal(routed.state.tasks[0].title, "Organizar documentos");
assert.equal(routed.capture.status, "routed");
assert.equal(routeQuickCapture(routed.state, capture.record.id, "task", { now, idFactory }).code, "already_routed");
assert.equal(routeQuickCapture(capture.state, capture.record.id, "unknown", { now, idFactory }).code, "invalid_target");

state.tasks.push({ id: "daily", title: "Beber água", category: "Saúde", priority: "normal", recurrence: "daily", dueDate: "2026-10-14", date: "2026-10-14", done: false });
const completed = completeTask(state, "daily", { now, idFactory: prefix => prefix + "_next" });
assert.equal(completed.ok, true);
assert.equal(completed.record.done, true);
assert.equal(completed.nextTask.dueDate, "2026-10-15");
assert.equal(completeTask(completed.state, "daily", { now }).unchanged, true);
assert.equal(completeTask(state, "missing", { now }).code, "task_not_found");

console.log("Ruan domain services tests passed.");
