/** Darknet browser-shell core v0.1: local preferences and safe browser navigation. */
export const DARKNET_PROFILES = Object.freeze([
  { id: "personal", label: "Pessoal", description: "Seu uso diário e seus aplicativos" },
  { id: "study", label: "Estudos", description: "Pesquisa, leitura e aprendizado" },
  { id: "work", label: "Trabalho", description: "Serviços, ferramentas e produtividade" },
  { id: "creator", label: "Criador", description: "Conteúdo, mídia e canais" },
  { id: "general", label: "Geral", description: "Navegação sem personalização específica" }
]);
export const DARKNET_PREFS_KEY = "darknet.browser.preferences.v1";
const PROFILE_IDS = new Set(DARKNET_PROFILES.map(profile => profile.id));
const DEFAULT_PREFS = Object.freeze({ profile: "personal", engine: "duckduckgo", favorites: [] });
export function normalizePreferences(input = {}) {
  const profile = PROFILE_IDS.has(input.profile) ? input.profile : DEFAULT_PREFS.profile;
  const engine = ["duckduckgo", "google", "bing"].includes(input.engine) ? input.engine : DEFAULT_PREFS.engine;
  const favorites = Array.isArray(input.favorites)
    ? [...new Set(input.favorites.filter(item => typeof item === "string" && /^https:\/\/[a-z0-9.-]+(?:\/[^\s]*)?$/i.test(item)).map(item => item.slice(0, 300)))].slice(0, 12)
    : [];
  return { profile, engine, favorites };
}
export function loadPreferences(storage) {
  try {
    const raw = storage?.getItem(DARKNET_PREFS_KEY);
    return normalizePreferences(raw ? JSON.parse(raw) : DEFAULT_PREFS);
  } catch {
    return { ...DEFAULT_PREFS, favorites: [] };
  }
}
export function savePreferences(storage, input) {
  const prefs = normalizePreferences(input);
  try { storage?.setItem(DARKNET_PREFS_KEY, JSON.stringify(prefs)); } catch {}
  return prefs;
}
export function buildSearchUrl(query, engine = "duckduckgo") {
  const q = String(query ?? "").trim();
  if (!q) throw new TypeError("Digite uma pesquisa ou endereço.");
  if (/^https:\/\//i.test(q)) {
    const url = new URL(q);
    if (url.protocol !== "https:") throw new TypeError("Por segurança, use endereços HTTPS.");
    return url.href;
  }
  const engines = {
    duckduckgo: "https://duckduckgo.com/?q=",
    google: "https://www.google.com/search?q=",
    bing: "https://www.bing.com/search?q="
  };
  const base = engines[engine] || engines.duckduckgo;
  return base + encodeURIComponent(q);
}
