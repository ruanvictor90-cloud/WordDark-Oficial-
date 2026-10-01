const assert = require("assert");
const { WordDarkOperationDiagnostics } = require("./operation-diagnostics");
const { WordDarkDiagnosticReport } = require("../contracts/diagnostic");
const { WordDarkLearningEngine } = require("./learning-engine");
const { WordDarkKnowledgeRecord } = require("../contracts/knowledge");

global.WordDarkDiagnosticReport = WordDarkDiagnosticReport;
global.WordDarkKnowledgeRecord = WordDarkKnowledgeRecord;

const operation = {
  operationId: "OP-DIAG-001",
  status: "FAILED",
  toJSON() {
    return { operationId: this.operationId, status: this.status };
  }
};

const events = [
  { operationId: operation.operationId, stage: "IDENTIFIED", data: {} },
  { operationId: operation.operationId, stage: "AUTHORIZED", data: {} },
  { operationId: operation.operationId, stage: "ROUTED", data: { routeId: "ROUTE-001" } },
  { operationId: operation.operationId, stage: "EXECUTING", data: {} },
  { operationId: operation.operationId, stage: "FAILED", data: { reason: "EXECUTOR_TIMEOUT" } }
];

const registry = {
  getEvents(operationId) {
    return events.filter(event => event.operationId === operationId);
  }
};

let recordedReport = null;
const diagnostics = new WordDarkOperationDiagnostics({
  registry,
  record(report) {
    recordedReport = report;
  }
});

const report = diagnostics.diagnose(operation);

assert.strictEqual(report.status, "FAILED");
assert.strictEqual(report.operationId, operation.operationId);
assert.ok(report.failures.length >= 1);
assert.strictEqual(recordedReport, report);

const learningEngine = new WordDarkLearningEngine();
const learning = learningEngine.fromDiagnostic(report);

assert.ok(learning);
assert.strictEqual(learning.status, WordDarkKnowledgeRecord.STATUS.PROPOSED);
assert.strictEqual(learning.type, WordDarkKnowledgeRecord.TYPES.ERROR_CORRECTION);
assert.strictEqual(learning.metadata.nextAction, "INVESTIGATE_AND_VALIDATE");
assert.ok(learning.evidence.length === 1);

console.log("WordDark diagnostic + learning test: OK");
