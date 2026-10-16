export const INFORMATION_INBOX_STORAGE_KEY = "darkhub.information.inbox.v1";
const SCHEMA = "darkhub-information-v1";
const clone = value => JSON.parse(JSON.stringify(value));
function cleanText(value, field, maxLength, optional = false) {
  if (value == null && optional) return "";
  if (typeof value !== "string" || (!optional && !value.trim())) throw new TypeError(field + " é obrigatório.");
  return value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, maxLength);
}
function normalize(item, { now, idFactory }) {
  if (!item || typeof item !== "object" || Array.isArray(item)) throw new TypeError("Informação inválida.");
  return {
    id: cleanText(typeof item.id === "string" ? item.id : idFactory(), "Identificador", 120),
    sender: cleanText(item.sender || item.source || "Aplicativo", "Origem", 120),
    category: cleanText(typeof item.category === "string" ? item.category : "Geral", "Categoria", 60, true) || "Geral",
    title: cleanText(item.title, "Título", 180),
    message: cleanText(item.message || item.detail || "", "Mensagem", 5000),
    sourceId: cleanText(typeof item.sourceId === "string" ? item.sourceId : "", "Identificador de origem", 180, true),
    receivedAt: typeof item.receivedAt === "string" && !Number.isNaN(Date.parse(item.receivedAt)) ? item.receivedAt : now(),
    read: item.read === true
  };
}
export function createInformationInbox({ storage = globalThis.localStorage, now = () => new Date().toISOString(), idFactory = () => globalThis.crypto?.randomUUID?.() ?? ("info-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9)), eventTarget = globalThis.window } = {}) {
  let memory = [];
  function list() {
    try {
      const raw = storage?.getItem(INFORMATION_INBOX_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) memory = parsed.filter(item => item && typeof item.id === "string");
    } catch {}
    return clone(memory).sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
  }
  function write(items) {
    memory = clone(items);
    try { storage?.setItem(INFORMATION_INBOX_STORAGE_KEY, JSON.stringify(memory)); } catch {}
    try {
      if (eventTarget?.dispatchEvent && typeof globalThis.CustomEvent === "function") {
        eventTarget.dispatchEvent(new CustomEvent("darkhub:inbox-changed", { detail: { count: memory.length } }));
      }
    } catch {}
    return list();
  }
  function receiveInformation(payload) {
    const item = normalize(payload, { now, idFactory });
    const items = list();
    const duplicate = items.find(existing => existing.id === item.id || (item.sourceId && existing.sender === item.sender && existing.sourceId === item.sourceId));
    if (duplicate) return clone(duplicate);
    write([item, ...items]);
    return clone(item);
  }
  function markRead(id, read = true) {
    const items = list(), index = items.findIndex(item => item.id === id);
    if (index < 0) return null;
    items[index] = { ...items[index], read: read === true };
    write(items);
    return clone(items[index]);
  }
  function deleteInformation(id) {
    const items = list();
    if (!items.some(item => item.id === id)) return false;
    write(items.filter(item => item.id !== id));
    return true;
  }
  function exportData() { return { schema: SCHEMA, exportedAt: now(), items: list() }; }
  function importData(payload) {
    if (!payload || payload.schema !== SCHEMA || !Array.isArray(payload.items)) throw new TypeError("Arquivo de recebimentos inválido.");
    const existing = list(), byId = new Map(existing.map(item => [item.id, item]));
    for (const raw of payload.items) {
      const item = normalize(raw, { now, idFactory });
      if (!byId.has(item.id)) byId.set(item.id, item);
    }
    write([...byId.values()]);
    return list();
  }
  return Object.freeze({ storageKey: INFORMATION_INBOX_STORAGE_KEY, list, receiveInformation, markRead, deleteInformation, exportData, importData });
}
