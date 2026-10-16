const STORAGE = Object.freeze({ security: "darkhub.security.v2", vault: "darkhub.vault.v2", throttle: "darkhub.throttle.v2" });
const ITERATIONS = 310000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const toBase64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromBase64 = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
const clone = value => JSON.parse(JSON.stringify(value));
const randomBytes = length => crypto.getRandomValues(new Uint8Array(length));
const validText = (value, max = 1000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const createId = prefix => prefix + "-" + toBase64(randomBytes(12)).replace(/[+/=]/g, "").toLowerCase();
const initialState = () => ({ schema: 2, projects: [], ecosystemAnalyses: [], technicalAnalyses: [], apps: [], audit: [] });

export class DarkHubVault {
  #storage;
  #cryptoKey = null;
  #state = null;
  constructor(storage = globalThis.localStorage) { this.#storage = storage; }
  get isConfigured() { return Boolean(this.#storage?.getItem(STORAGE.security)); }
  get isUnlocked() { return Boolean(this.#cryptoKey && this.#state); }
  async #derive(passphrase, salt) {
    if (!globalThis.crypto?.subtle) throw new Error("Este ambiente não oferece criptografia segura. Abra o darkHub em HTTPS ou em um app nativo compatível.");
    const material = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, material, 512);
    const bytes = new Uint8Array(bits);
    return { key: await crypto.subtle.importKey("raw", bytes.slice(0, 32), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]), verifier: bytes.slice(32) };
  }
  async #seal(state, key) {
    const iv = randomBytes(12);
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(state)));
    this.#storage.setItem(STORAGE.vault, JSON.stringify({ version: 2, iv: toBase64(iv), data: toBase64(encrypted) }));
  }
  async #open(key) {
    const raw = this.#storage.getItem(STORAGE.vault);
    if (!raw) return initialState();
    const record = JSON.parse(raw);
    if (record.version !== 2 || typeof record.iv !== "string" || typeof record.data !== "string") throw new Error("O cofre local está corrompido ou usa uma versão incompatível.");
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(record.iv) }, key, fromBase64(record.data));
    const state = JSON.parse(decoder.decode(plaintext));
    if (!state || state.schema !== 2 || !Array.isArray(state.projects) || !Array.isArray(state.audit)) throw new Error("A estrutura do cofre não passou na validação.");
    return state;
  }
  async setup(passphrase) {
    if (this.isConfigured) throw new Error("O cofre já foi configurado.");
    if (typeof passphrase !== "string" || passphrase.length < 8 || passphrase.length > 128) throw new Error("Use uma frase secreta entre 8 e 128 caracteres.");
    const salt = randomBytes(16), derived = await this.#derive(passphrase, salt);
    this.#storage.setItem(STORAGE.security, JSON.stringify({ version: 2, salt: toBase64(salt), verifier: toBase64(derived.verifier), iterations: ITERATIONS, kdf: "PBKDF2-SHA-256", cipher: "AES-256-GCM" }));
    this.#cryptoKey = derived.key;
    this.#state = initialState();
    await this.#seal(this.#state, this.#cryptoKey);
    this.audit("security.vault_created", "Cofre local criado");
    await this.#seal(this.#state, this.#cryptoKey);
    return true;
  }
  async unlock(passphrase) {
    const configRaw = this.#storage.getItem(STORAGE.security);
    if (!configRaw) throw new Error("Configure uma frase secreta para criar o cofre.");
    const config = JSON.parse(configRaw);
    if (config.version !== 2 || config.kdf !== "PBKDF2-SHA-256") throw new Error("Configuração de segurança incompatível.");
    const derived = await this.#derive(passphrase, fromBase64(config.salt));
    const supplied = derived.verifier, expected = fromBase64(config.verifier);
    if (supplied.length !== expected.length || !supplied.every((value, index) => value === expected[index])) throw new Error("Frase secreta incorreta.");
    this.#state = await this.#open(derived.key);
    this.#cryptoKey = derived.key;
    this.audit("security.vault_unlocked", "Cofre local desbloqueado");
    await this.#seal(this.#state, this.#cryptoKey);
    return true;
  }
  lock() { this.#cryptoKey = null; this.#state = null; }
  getState() { this.#assertUnlocked(); return clone(this.#state); }
  #assertUnlocked() { if (!this.isUnlocked) throw new Error("O cofre está bloqueado."); }
  async #commit(event, detail) {
    this.#assertUnlocked();
    this.audit(event, detail);
    await this.#seal(this.#state, this.#cryptoKey);
  }
  audit(event, detail = "") {
    this.#assertUnlocked();
    this.#state.audit.unshift({ id: createId("evt"), event: validText(event, 80), detail: validText(detail, 240), at: new Date().toISOString() });
    this.#state.audit = this.#state.audit.slice(0, 300);
  }
  async createAnalysis(kind, input) {
    this.#assertUnlocked();
    const technical = kind === "technical";
    const collection = technical ? "technicalAnalyses" : "ecosystemAnalyses";
    const title = validText(input.title, 100), target = validText(input.target, 180), findings = validText(input.findings, 4000);
    if (!title || !target || !findings) throw new Error("Preencha título, escopo e conclusões.");
    const allowed = technical ? ["Rascunho", "Em análise", "Aprovada", "Reprovada", "Bloqueada"] : ["Rascunho", "Em análise", "Validada", "Bloqueada"];
    const item = { id: createId("analysis"), kind: technical ? "technical" : "ecosystem", title, target, findings, category: validText(input.category, 100), severity: validText(input.severity, 60), status: allowed.includes(input.status) ? input.status : "Rascunho", createdAt: new Date().toISOString() };
    this.#state[collection].unshift(item);
    await this.#commit("analysis.created", (technical ? "Técnica: " : "Ecossistema: ") + title);
    return clone(item);
  }
  async createProject(input) {
    this.#assertUnlocked();
    const name = validText(input.name, 100), owner = validText(input.owner, 60);
    if (!name || !owner) throw new Error("Nome do projeto e área responsável são obrigatórios.");
    const allowed = ["Planejado", "Em desenvolvimento", "Em revisão", "Em finalização", "Concluído", "Bloqueado"];
    const item = { id: createId("project"), name, owner, status: allowed.includes(input.status) ? input.status : "Planejado", createdAt: new Date().toISOString() };
    this.#state.projects.unshift(item);
    await this.#commit("project.created", name);
    return clone(item);
  }
  async createApp(input) {
    this.#assertUnlocked();
    const name = validText(input.name, 50), slug = validText(input.slug, 40), description = validText(input.description, 1200);
    if (!name || !description || !/^[a-z][a-z0-9-]{0,39}$/.test(slug)) throw new Error("Confira nome, descrição e identificador interno.");
    if (this.#state.apps.some(app => app.slug === slug)) throw new Error("Esse identificador já existe no catálogo.");
    const app = { id: createId("app"), name, slug, description, type: validText(input.type, 40), platform: validText(input.platform, 80), security: validText(input.security, 100), status: "Especificado", createdAt: new Date().toISOString() };
    this.#state.apps.unshift(app);
    await this.#commit("app.specification_created", name);
    return clone(app);
  }
  async updateStatus(collection, id, status) {
    this.#assertUnlocked();
    const allowedCollections = ["projects", "ecosystemAnalyses", "technicalAnalyses", "apps"];
    if (!allowedCollections.includes(collection)) throw new Error("Coleção inválida.");
    const item = this.#state[collection].find(entry => entry.id === id);
    if (!item) throw new Error("Registro não encontrado.");
    item.status = validText(status, 60);
    await this.#commit("record.status_updated", item.id + " → " + item.status);
  }
  async deleteRecord(collection, id) {
    this.#assertUnlocked();
    if (!["projects", "ecosystemAnalyses", "technicalAnalyses", "apps"].includes(collection)) throw new Error("Coleção inválida.");
    const before = this.#state[collection].length;
    this.#state[collection] = this.#state[collection].filter(entry => entry.id !== id);
    if (before === this.#state[collection].length) throw new Error("Registro não encontrado.");
    await this.#commit("record.deleted", id);
  }
  async exportAppFiles(id) {
    this.#assertUnlocked();
    const app = this.#state.apps.find(entry => entry.id === id);
    if (!app) throw new Error("Aplicativo não encontrado.");
    const manifest = { schemaVersion: 1, id: app.slug, name: app.name, description: app.description, type: app.type, platform: app.platform, securityBaseline: app.security, independent: true, generatedBy: "darkHub App Factory", generatedAt: new Date().toISOString() };
    const css = `:root{color-scheme:dark;--bg:#0a0711;--panel:#15101d;--text:#f7f0ff;--muted:#ad9cbe;--purple:#c8a2ff}*{box-sizing:border-box}body{margin:0;min-height:100vh;padding:28px;background:radial-gradient(ellipse at 50% -15%,#3a2050 0,transparent 42%),var(--bg);color:var(--text);font:15px/1.5 system-ui,sans-serif}main{max-width:760px;margin:10vh auto;padding:28px;border:1px solid #60407b;border-radius:22px;background:var(--panel)}h1{font-size:clamp(28px,7vw,46px);margin:8px 0}p{color:var(--muted);line-height:1.7}main>p:first-child{font-size:10px;letter-spacing:.18em;color:var(--purple);font-weight:800}`;
    const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0a0711"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'"><title>${escapeHtml(app.name)}</title><link rel="stylesheet" href="./app.css"></head>
<body><main><p>APLICATIVO INDEPENDENTE</p><h1>${escapeHtml(app.name)}</h1><p>${escapeHtml(app.description)}</p><p>Base inicial gerada pelo darkHub. Revise permissões, dados e segurança antes de usar em produção.</p></main></body></html>`;
    await this.#commit("app.scaffold_exported", app.name);
    return { manifest, html, css };
  }
  async exportAudit() {
    this.#assertUnlocked();
    const data = { exportedAt: new Date().toISOString(), scope: "local-encrypted-vault", events: clone(this.#state.audit) };
    await this.#commit("audit.exported", "Exportação da trilha local");
    return data;
  }
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char])); }
export const DARKHUB_STORAGE_KEYS = STORAGE;