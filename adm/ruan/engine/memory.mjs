export class RuanMemory {
  #tasks = new Map(); #notes = new Map(); #events = [];
  addTask(value) { this.#tasks.set(value.id, structuredClone(value)); return structuredClone(value); }
  getTasks() { return [...this.#tasks.values()].map(value => structuredClone(value)); }
  updateTask(id, patch) { const old = this.#tasks.get(id); if (!old) throw new Error("RUAN_TASK_NOT_FOUND"); const next = { ...old, ...patch, id: old.id, updatedAt: new Date().toISOString() }; this.#tasks.set(id, next); return structuredClone(next); }
  addNote(value) { this.#notes.set(value.id, structuredClone(value)); return structuredClone(value); }
  getNotes() { return [...this.#notes.values()].map(value => structuredClone(value)); }
  record(value) { this.#events.push(structuredClone(value)); return structuredClone(value); }
  getEvents() { return this.#events.map(value => structuredClone(value)); }
  snapshot() { return { tasks: this.getTasks(), notes: this.getNotes(), events: this.getEvents() }; }
}
