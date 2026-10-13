/**
 * Darknet Foundation v0.1 — local-only search and message preparation engine.
 * No network calls, no world runtime imports, no active connectors.
 */
export const DARKNET_VERSION = "0.1.0-foundation";
export const CONNECTION_MODE = "isolated";
export const CONNECTORS = Object.freeze([
  { id: "world-runtime", label: "World runtime", status: "disabled", reason: "Aguardando alinhamento geral e autorização explícita." },
  { id: "private-bridge", label: "Ruan ↔ Hub", status: "disabled", reason: "Ponte reservada para etapa posterior." },
  { id: "external-web", label: "Web externa", status: "disabled", reason: "Pesquisa externa não habilitada nesta versão." }
]);
export const CATALOG = Object.freeze([
  { id: "ruan-home", title: "Ruan", kind: "Aplicativo", description: "Central privada de operação pessoal e desenvolvimento.", scope: "ruan", tags: ["central", "aplicativos", "pessoal"] },
  { id: "hub", title: "Hub", kind: "Central", description: "Ponto de entrada e ferramentas operacionais da central.", scope: "hub", tags: ["central", "pedidos", "operações"] },
  { id: "darknet", title: "Darknet", kind: "Sistema", description: "Busca, catálogo, diretório de serviços e preparação de mensagens.", scope: "both", tags: ["pesquisa", "busca", "rede", "diretório"] },
  { id: "shadow", title: "Shadow / darkEye", kind: "Aplicativo", description: "Área separada de pesquisa e navegação em desenvolvimento.", scope: "ruan", tags: ["navegador", "pesquisa", "shadow"] },
  { id: "world-runtime", title: "Mundo digital", kind: "Sistema futuro", description: "Destino futuro de conexão; permanece isolado nesta versão.", scope: "future", tags: ["mundo", "setores", "conexões"] },
  { id: "execution-area", title: "Área de execução", kind: "Área futura", description: "Área de execução prevista para conexão futura.", scope: "future", tags: ["execução", "produção"] },
  { id: "request-area", title: "Área de demandas", kind: "Área futura", description: "Área de demandas e entidades prevista para conexão futura.", scope: "future", tags: ["demandas", "entidades"] }
]);
const safe = value => String(value ?? "").trim();
const parse = (raw, fallback) => { try { const value = JSON.parse(raw); return value ?? fallback; } catch { return fallback; } };
export function searchCatalog(query, scope = "both") {
  const terms = safe(query).toLocaleLowerCase("pt-BR").split(/\s+/).filter(Boolean);
  return CATALOG.filter(item => (scope === "both" || item.scope === scope || item.scope === "both") &&
    (!terms.length || terms.every(term => [item.title, item.kind, item.description, ...item.tags].join(" ").toLocaleLowerCase("pt-BR").includes(term))))
    .map(item => ({ ...item, score: terms.reduce((score, term) => score + ([item.title, ...item.tags].join(" ").toLocaleLowerCase("pt-BR").includes(term) ? 2 : 0), 0) }))
    .sort((a,b) => b.score-a.score || a.title.localeCompare(b.title, "pt-BR"));
}
export function createEnvelope({ from, to = "unassigned", subject, body, type = "information" }) {
  const title = safe(subject), message = safe(body);
  if (!title || !message) throw new Error("Informe o assunto e a mensagem.");
  return Object.freeze({
    id: "DNET-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,7).toUpperCase(),
    version: 1, createdAt: new Date().toISOString(), from: safe(from) || "unknown",
    to: safe(to) || "unassigned", type: safe(type) || "information", subject: title,
    body: message, status: "draft", transport: "local-only", dispatchedAt: null
  });
}
export function createLocalStore(storage = globalThis.localStorage, namespace = "ruan") {
  const key = "darknet." + safe(namespace || "ruan") + ".v1";
  const read = () => {
    if (!storage) return { inbox: [], outbox: [] };
    const value = parse(storage.getItem(key), {});
    return { inbox: Array.isArray(value.inbox) ? value.inbox : [], outbox: Array.isArray(value.outbox) ? value.outbox : [] };
  };
  const write = value => { if (!storage) throw new Error("Armazenamento local indisponível."); storage.setItem(key, JSON.stringify(value)); };
  return Object.freeze({
    list: () => read(),
    saveDraft: envelope => { const state = read(); state.outbox.unshift({ ...envelope, status: "draft", transport: "local-only" }); write(state); return envelope.id; },
    receiveLocal: envelope => { const state = read(); state.inbox.unshift({ ...envelope, status: "received-local", transport: "local-only" }); write(state); return envelope.id; },
    deleteDraft: id => { const state = read(); state.outbox = state.outbox.filter(item => item.id !== id); write(state); },
    clear: () => write({ inbox: [], outbox: [] })
  });
}
export function getSystemStatus() {
  return { version: DARKNET_VERSION, mode: CONNECTION_MODE, search: "ready", directory: "local-catalog", inbox: "local-only", outbox: "draft-only", connectors: CONNECTORS.map(item => ({ ...item })) };
}
