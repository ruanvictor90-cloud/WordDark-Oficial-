import assert from "node:assert/strict";
import { createDarkHubEngine, DARKHUB_PROJECT_STORAGE_KEY } from "./darkhub-engine.js";

function createStorage() {
  const data = new Map();
  return {
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: key => data.delete(key)
  };
}
let serial = 0;
const storage = createStorage();
const engine = createDarkHubEngine({ storage, now: () => "2026-10-16T00:00:00.000Z", idFactory: () => "custom-" + (++serial), eventTarget: null });

assert.equal(engine.storageKey, DARKHUB_PROJECT_STORAGE_KEY);
assert.deepEqual(engine.listProjects().map(project => project.id), ["darkhub", "worddark-hub"]);
assert.equal(engine.getProject("darkhub").protected, true);

const created = engine.createProject({ name: "Projeto de teste", href: "./teste/index.html", logo: "./teste/logo.svg", description: "Registro de teste", status: "Planejado" });
assert.equal(created.name, "Projeto de teste");
assert.equal(engine.getProject(created.id).status, "Planejado");
assert.equal(engine.updateProject(created.id, { status: "Em revisão" }).status, "Em revisão");
assert.throws(() => engine.updateProject(created.id, { status: "inventado" }), /Status de projeto inválido/);
assert.throws(() => engine.createProject({ name: "Link inseguro", href: "javascript:alert(1)" }), /não aceita/);
assert.throws(() => engine.deleteProject("darkhub"), /não pode ser removido/);
assert.equal(engine.deleteProject(created.id), true);
assert.equal(engine.getProject(created.id), null);

const exported = engine.exportProjects();
assert.equal(exported.schema, "darkhub-projects-v1");
const restored = createDarkHubEngine({ storage: createStorage(), now: () => "2026-10-16T00:00:00.000Z", idFactory: () => "restored" });
restored.importProjects(exported);
assert.ok(restored.getProject("darkhub"));
assert.ok(restored.getProject("worddark-hub"));
assert.throws(() => restored.importProjects({ projects: [] }), /inválido/);
assert.ok(storage.getItem(DARKHUB_PROJECT_STORAGE_KEY));
console.log("darkHub engine tests passed.");
