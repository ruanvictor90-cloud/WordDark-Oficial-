const crypto = require("crypto");
const usage = require("./world-usage-telemetry");

const acceptedTypes = new Set([
  "request","intent","information","event","document",
  "command","result","receipt","diagnostic"
]);

function id(prefix) {
  return prefix + "_" + crypto.randomUUID();
}

function receive(input) {
  if (!input || !input.type || !acceptedTypes.has(input.type)) {
    throw new Error("WORLD_INPUT_REJECTED: tipo de informação não aceito");
  }
  if (!input.source) {
    throw new Error("WORLD_INPUT_REJECTED: origem obrigatória");
  }
  if (!input.purpose) {
    throw new Error("WORLD_INPUT_REJECTED: finalidade obrigatória");
  }

  const item = {
    id: input.id || id("info"),
    type: input.type,
    source: input.source,
    destination: input.destination || "worddark.central",
    purpose: input.purpose,
    createdAt: input.createdAt || new Date().toISOString(),
    accessPolicy: input.accessPolicy || "world.default",
    operationId: input.operationId || null,
    payload: input.payload ?? null
  };

  usage.record({
    eventType: "information.receive",
    sector: "worddark",
    module: "central",
    capability: "receive.information",
    operationId: item.operationId,
    sourceType: item.source
  });

  return item;
}

function request(input) {
  return receive({ ...input, type: input.type || "request", purpose: input.purpose || "world-operation" });
}

module.exports = { receive, request };
