import assert from "node:assert/strict";
import { createDarkHubBackup, DARKHUB_BACKUP_SCHEMA } from "./backup.js";

const state = name => ({ exportState: () => ({ name, value: 1 }) });
const backup = createDarkHubBackup({
  runtime: state("runtime"),
  orchestrator: state("orchestrator"),
  shadow: state("shadow"),
  workspace: state("workspace"),
  rodovia: state("rodovia"),
  now: () => "2026-10-18T00:00:00.000Z"
});
assert.equal(backup.schema, DARKHUB_BACKUP_SCHEMA);
assert.equal(backup.scope, "local-state-snapshot");
assert.equal(backup.exportedAt, "2026-10-18T00:00:00.000Z");
assert.deepEqual(Object.keys(backup.components), ["darkHub", "orchestrator", "shadow", "workspace", "rodovia"]);
assert.equal(backup.components.workspace.name, "workspace");
assert.ok(backup.limitations.some(note => note.includes("restauração integral")));
assert.throws(() => createDarkHubBackup({ runtime: state("runtime") }), /não oferece exportState/);
console.log("darkHub backup tests passed");
