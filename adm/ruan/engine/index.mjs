import { randomUUID } from "node:crypto";
import { RuanMemory } from "./memory.mjs";
import { ACCESS_POLICY, LAYERS, assertOutboundApproval, canRuanInitiate, rejectInbound } from "./access-policy.mjs";
export const ENGINE_VERSION = "0.1.0";
const STATUSES = new Set(["open", "in_progress", "done", "cancelled"]);
const now = () => new Date().toISOString();
function requiredText(value, field) { if (typeof value !== "string" || !value.trim()) throw new Error("RUAN_INVALID_" + field.toUpperCase()); return value.trim(); }
/** Personal operations core only: no UI, server listener, external credentials, or AI. */
export class RuanEngine {
  #memory; #worldAdapter;
  constructor({ memory = new RuanMemory(), worldAdapter = null } = {}) { this.#memory = memory; this.#worldAdapter = worldAdapter; this.identity = Object.freeze({ id: "ADM-RUAN", layer: LAYERS.RUAN, sovereignty: "owner-controlled" }); }
  getStatus() { return { engine: "Ruan Central Operations Engine", version: ENGINE_VERSION, state: "ready", appCreated: false, shadowEnabled: false, inboundConnections: "blocked", outboundWorldBridge: this.#worldAdapter ? "adapter-injected-but-approval-required" : "not-configured", memory: "volatile-process-memory", policyVersion: ACCESS_POLICY.version }; }
  getPolicy() { return { ...ACCESS_POLICY }; }
  createTask(input = {}) { const title = requiredText(input.title, "task_title"); const task = { id: "ruan_task_" + randomUUID(), title, description: typeof input.description === "string" ? input.description.trim() : "", category: typeof input.category === "string" && input.category.trim() ? input.category.trim() : "general", priority: ["low", "normal", "high", "urgent"].includes(input.priority) ? input.priority : "normal", status: "open", dueAt: input.dueAt || null, createdAt: now(), updatedAt: now() }; this.#memory.addTask(task); this.#event("task.created", { taskId: task.id, category: task.category }); return task; }
  listTasks({ status } = {}) { if (status && !STATUSES.has(status)) throw new Error("RUAN_INVALID_TASK_STATUS"); const tasks = this.#memory.getTasks(); return status ? tasks.filter(task => task.status === status) : tasks; }
  updateTaskStatus(id, status) { requiredText(id, "task_id"); if (!STATUSES.has(status)) throw new Error("RUAN_INVALID_TASK_STATUS"); const task = this.#memory.updateTask(id, { status }); this.#event("task.status_changed", { taskId: id, status }); return task; }
  createNote(input = {}) { const title = requiredText(input.title, "note_title"); const note = { id: "ruan_note_" + randomUUID(), title, content: typeof input.content === "string" ? input.content : "", tags: Array.isArray(input.tags) ? input.tags.filter(tag => typeof tag === "string").map(tag => tag.trim()).filter(Boolean) : [], createdAt: now() }; this.#memory.addNote(note); this.#event("note.created", { noteId: note.id }); return note; }
  listNotes() { return this.#memory.getNotes(); }
  async requestWordDark(input = {}, { approved = false } = {}) { assertOutboundApproval(approved); if (!canRuanInitiate(LAYERS.WORDDARK)) throw new Error("RUAN_OUTBOUND_ROUTE_BLOCKED"); if (!this.#worldAdapter || typeof this.#worldAdapter.request !== "function") throw new Error("RUAN_WORLD_ADAPTER_NOT_CONFIGURED"); const request = Object.freeze({ requestId: "ruan_request_" + randomUUID(), source: LAYERS.RUAN, destination: LAYERS.WORDDARK, purpose: requiredText(input.purpose, "request_purpose"), requestType: typeof input.requestType === "string" ? input.requestType : "assistance", payload: input.payload ?? null, createdAt: now(), returnAuthority: "RUAN_ONLY", mayReadRuanRoot: false, mayAdministerRuan: false }); this.#event("world.request_submitted", { requestId: request.requestId, purpose: request.purpose }); return this.#worldAdapter.request(request); }
  receiveFromWordDark(message) { rejectInbound(message?.source || LAYERS.WORDDARK); }
  exportLocalSnapshot() { return this.#memory.snapshot(); }
  #event(type, details = {}) { this.#memory.record({ id: "ruan_event_" + randomUUID(), type, at: now(), actor: LAYERS.RUAN, details }); }
}
export { ACCESS_POLICY };
export default RuanEngine;
