const crypto = require("crypto");

const memory = [];

function id(prefix) {
  return prefix + "_" + crypto.randomUUID();
}

function record(event) {
  const entry = {
    eventId: event.eventId || id("evt"),
    eventType: event.eventType,
    timestamp: event.timestamp || new Date().toISOString(),
    actorScope: event.actorScope || "world",
    sector: event.sector || null,
    module: event.module || null,
    capability: event.capability || null,
    operationId: event.operationId || null,
    connectionId: event.connectionId || null,
    sourceType: event.sourceType || null,
    resultState: event.resultState || null,
    durationMs: event.durationMs ?? null
  };
  memory.push(entry);
  return entry;
}

function list(filter = {}) {
  return memory.filter(item =>
    Object.entries(filter).every(([key, value]) => item[key] === value)
  );
}

function clear() {
  memory.length = 0;
}

module.exports = { record, list, clear };
