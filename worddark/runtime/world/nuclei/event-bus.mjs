export class WordDarkEventBus {
  constructor({ maxHistory = 500, clock = () => new Date().toISOString() } = {}) {
    this.maxHistory = Math.max(1, Number(maxHistory) || 500);
    this.clock = clock;
    this.listeners = new Map();
    this.history = [];
    this.listenerErrors = [];
    this.sequence = 0;
  }
  subscribe(type, listener) {
    if (typeof type !== "string" || !type.trim()) throw new TypeError("O tipo do evento é obrigatório.");
    if (typeof listener !== "function") throw new TypeError("O observador do evento deve ser uma função.");
    const set = this.listeners.get(type) || new Set();
    set.add(listener); this.listeners.set(type, set);
    return () => { set.delete(listener); if (set.size === 0) this.listeners.delete(type); };
  }
  publish(type, detail = {}) {
    if (typeof type !== "string" || !type.trim()) throw new TypeError("O tipo do evento é obrigatório.");
    const event = Object.freeze({
      eventId: "EVT-" + (++this.sequence) + "-" + (Date.parse(this.clock()) || 0),
      type, occurredAt: this.clock(),
      detail: structuredClone(detail && typeof detail === "object" ? detail : { value: detail })
    });
    this.history.push(event);
    if (this.history.length > this.maxHistory) this.history.splice(0, this.history.length - this.maxHistory);
    const listeners = [...(this.listeners.get(type) || []), ...(this.listeners.get("*") || [])];
    for (const listener of listeners) {
      try { listener(event); }
      catch (error) { this.listenerErrors.push({ eventId: event.eventId, type, message: String(error?.message || error), occurredAt: this.clock() }); }
    }
    return event;
  }
  list({ type = null, limit = 100 } = {}) {
    const filtered = type ? this.history.filter(event => event.type === type) : this.history;
    return filtered.slice(-Math.max(0, Number(limit) || 0)).map(event => structuredClone(event));
  }
  snapshot() {
    return { retainedEvents: this.history.length, listenerCount: [...this.listeners.values()].reduce((n, set) => n + set.size, 0), listenerErrors: this.listenerErrors.length };
  }
}
