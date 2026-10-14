/**
 * Ruan -> Darknet client bridge v0.1.
 * Browser-safe, read-only adapter. Provider URLs are allowlisted; no credentials,
 * mutations or arbitrary URLs are exposed here.
 * Replace the transport behind this contract when the authenticated Darknet API exists.
 */
export const DARKNET_CLIENT_VERSION = "0.1.0";
export const DARKNET_REQUEST_POLICY = Object.freeze({
  allowedProviders: Object.freeze(["jikan"]),
  methods: Object.freeze(["GET"]),
  allowCredentials: false,
  allowArbitraryUrl: false,
  cacheTtlMs: 60_000
});

const cache = new Map();
const pending = new Map();
const PATH = /^(?:seasons\/now|top\/anime|anime(?:\/\d+(?:\/(?:full|episodes))?)?)$/;
const QUERY_KEYS = new Set(["limit", "filter", "q", "sfw", "page"]);

function normalizeResource(resource) {
  if (typeof resource !== "string" || resource.length > 500) {
    throw new TypeError("Recurso Darknet inválido.");
  }
  const parsed = new URL(resource, "https://api.jikan.moe/v4/");
  if (parsed.origin !== "https://api.jikan.moe" || !parsed.pathname.startsWith("/v4/")) {
    throw new Error("A política Darknet bloqueou um destino externo não autorizado.");
  }
  const route = parsed.pathname.slice("/v4/".length);
  if (!PATH.test(route)) throw new Error("A política Darknet bloqueou este recurso.");
  for (const [key, value] of parsed.searchParams) {
    if (!QUERY_KEYS.has(key)) throw new Error("Parâmetro não autorizado pela política Darknet.");
    if (key === "limit" && (!/^\d+$/.test(value) || Number(value) > 24)) {
      throw new Error("Limite de resultados acima da política Darknet.");
    }
    if (key === "page" && (!/^\d+$/.test(value) || Number(value) > 100)) {
      throw new Error("Página fora do limite permitido.");
    }
    if (key === "filter" && !["bypopularity", "airing"].includes(value)) {
      throw new Error("Filtro não autorizado pela política Darknet.");
    }
    if (key === "sfw" && !["true", "false"].includes(value)) {
      throw new Error("Valor de segurança inválido.");
    }
    if (key === "q" && value.length > 100) throw new Error("Busca muito longa.");
  }
  return parsed.href;
}

export async function darknetRequest({ provider = "jikan", resource, fetchImpl = globalThis.fetch, now = Date.now } = {}) {
  if (!DARKNET_REQUEST_POLICY.allowedProviders.includes(provider)) {
    throw new Error("Provedor bloqueado pela política Darknet.");
  }
  if (typeof fetchImpl !== "function") throw new Error("Conexão de internet indisponível neste ambiente.");
  const url = normalizeResource(resource);
  const key = provider + ":" + url;
  const current = now();
  const hit = cache.get(key);
  if (hit && current - hit.at < DARKNET_REQUEST_POLICY.cacheTtlMs) return hit.data;
  if (pending.has(key)) return pending.get(key);

  const task = (async () => {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "omit",
      cache: "no-store"
    });
    if (!response.ok) {
      const error = new Error(response.status === 429
        ? "O catálogo está recebendo muitas consultas. Tente novamente em alguns segundos."
        : "Não foi possível atualizar os dados pela Darknet agora.");
      error.status = response.status;
      throw error;
    }
    const payload = await response.json();
    if (!payload || !Object.prototype.hasOwnProperty.call(payload, "data")) {
      throw new Error("A resposta do provedor não corresponde ao contrato Darknet.");
    }
    cache.set(key, { at: now(), data: payload.data });
    return payload.data;
  })();
  pending.set(key, task);
  try { return await task; }
  finally { pending.delete(key); }
}

export function clearDarknetClientCache() {
  cache.clear();
  pending.clear();
}
