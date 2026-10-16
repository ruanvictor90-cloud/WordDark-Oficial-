const DEFAULT_PROJECTS = [
  { id: "darkhub", name: "darkHub", description: "Hub central e área de desenvolvimento.", logo: "./app-icon.svg?v=20261016.2", href: "./index.html", status: "Em desenvolvimento", protected: true, createdAt: "2026-10-16T00:00:00.000Z", updatedAt: "2026-10-16T00:00:00.000Z" }
];
const STORAGE_KEY = "darkhub.development.projects.v1";
const STATUSES = ["Planejado", "Em desenvolvimento", "Em revisão", "Em finalização", "Integrado", "Pausado"];
function cleanText(value, field, max = 180) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(field + " é obrigatório.");
  return value.trim().slice(0, max);
}
function safeUrl(value, field, allowEmpty = false) {
  if (typeof value !== "string" || !value.trim()) {
    if (allowEmpty) return "";
    throw new TypeError(field + " é obrigatório.");
  }
  const url = value.trim();
  if (/^(javascript|vbscript|file|data):/i.test(url)) throw new TypeError(field + " não aceita esse tipo de endereço.");
  if (/^(https?:\/\/|\.\.?\/|\/)/i.test(url)) return url;
  throw new TypeError(field + " precisa ser um link http(s) ou caminho relativo.");
}
const clone = value => JSON.parse(JSON.stringify(value));
export function createDarkHubEngine({ storage = globalThis.localStorage, now = () => new Date().toISOString(), idFactory = () => globalThis.crypto?.randomUUID?.() ?? ("project-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9)), eventTarget = globalThis.window } = {}) {
  let memory = null;
  function read() {
    try {
      const raw = storage?.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULT_PROJECTS);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return clone(DEFAULT_PROJECTS);
      const clean = parsed.filter(item => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.href === "string");
      const existing = new Set(clean.map(item => item.id));
      return [...clone(DEFAULT_PROJECTS).filter(item => !existing.has(item.id)), ...clean];
    } catch { return memory ? clone(memory) : clone(DEFAULT_PROJECTS); }
  }
  function write(projects) {
    const next = clone(projects); memory = next;
    try { storage?.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    try {
      if (eventTarget?.dispatchEvent && typeof globalThis.CustomEvent === "function") eventTarget.dispatchEvent(new CustomEvent("darkhub:projects-changed", { detail: { count: next.length } }));
    } catch {}
    return clone(next);
  }
  function listProjects() {
    return read().sort((a, b) => {
      if (a.protected !== b.protected) return a.protected ? -1 : 1;
      return String(a.name).localeCompare(String(b.name), "pt-BR");
    });
  }
  function getProject(id) { return listProjects().find(project => project.id === id) || null; }
  function createProject(input = {}) {
    const name = cleanText(input.name, "Nome do projeto");
    const href = safeUrl(input.href, "Endereço do projeto");
    const logo = safeUrl(input.logo || "", "Logo", true);
    const projects = read(), id = String(idFactory());
    if (projects.some(project => project.id === id)) throw new Error("Identificador de projeto duplicado.");
    const timestamp = now();
    const project = { id, name, description: typeof input.description === "string" ? input.description.trim().slice(0, 500) : "", logo, href, status: STATUSES.includes(input.status) ? input.status : "Em desenvolvimento", protected: false, createdAt: timestamp, updatedAt: timestamp };
    write([...projects, project]); return clone(project);
  }
  function updateProject(id, patch = {}) {
    const projects = read(), index = projects.findIndex(project => project.id === id);
    if (index < 0) throw new Error("Projeto não encontrado.");
    const next = { ...projects[index] };
    if (patch.name !== undefined) next.name = cleanText(patch.name, "Nome do projeto");
    if (patch.description !== undefined) next.description = String(patch.description).trim().slice(0, 500);
    if (patch.href !== undefined) next.href = safeUrl(patch.href, "Endereço do projeto");
    if (patch.logo !== undefined) next.logo = safeUrl(patch.logo, "Logo", true);
    if (patch.status !== undefined) {
      if (!STATUSES.includes(patch.status)) throw new TypeError("Status de projeto inválido.");
      next.status = patch.status;
    }
    next.updatedAt = now(); projects[index] = next; write(projects); return clone(next);
  }
  function deleteProject(id) {
    const projects = read(), target = projects.find(project => project.id === id);
    if (!target) return false;
    if (target.protected) throw new Error("Este projeto-base não pode ser removido.");
    write(projects.filter(project => project.id !== id)); return true;
  }
  function exportProjects() { return { schema: "darkhub-projects-v1", exportedAt: now(), projects: listProjects() }; }
  function importProjects(payload) {
    if (!payload || payload.schema !== "darkhub-projects-v1" || !Array.isArray(payload.projects)) throw new TypeError("Arquivo de projetos inválido.");
    const normalized = [];
    for (const item of payload.projects) {
      normalized.push({
        id: String(item.id || idFactory()), name: cleanText(item.name, "Nome do projeto"),
        description: typeof item.description === "string" ? item.description.slice(0, 500) : "",
        logo: safeUrl(item.logo || "", "Logo", true), href: safeUrl(item.href, "Endereço do projeto"),
        status: STATUSES.includes(item.status) ? item.status : "Em desenvolvimento",
        protected: DEFAULT_PROJECTS.some(base => base.id === item.id),
        createdAt: item.createdAt || now(), updatedAt: now()
      });
    }
    const byId = new Map(normalized.map(item => [item.id, item]));
    for (const base of DEFAULT_PROJECTS) if (!byId.has(base.id)) byId.set(base.id, clone(base));
    write([...byId.values()]); return listProjects();
  }
  return Object.freeze({ storageKey: STORAGE_KEY, statuses: [...STATUSES], listProjects, getProject, createProject, updateProject, deleteProject, exportProjects, importProjects });
}
export { DEFAULT_PROJECTS, STORAGE_KEY as DARKHUB_PROJECT_STORAGE_KEY };
