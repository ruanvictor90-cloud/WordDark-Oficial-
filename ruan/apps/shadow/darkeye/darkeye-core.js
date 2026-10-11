export function normalizeDestination(raw) {
  const value = String(raw ?? '').trim();
  if (!value) throw new TypeError('Digite um endereço ou termo de pesquisa.');
  if (/^(javascript|data|file|vbscript):/i.test(value)) throw new TypeError('Esse tipo de endereço não é permitido.');
  if (/^(https?:\/\/)/i.test(value)) {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new TypeError('Protocolo não permitido.');
    return url.href;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^[a-z][a-z0-9+.-]*:\s/i.test(value)) {
    throw new TypeError('Use um endereço web HTTP/HTTPS ou uma busca.');
  }
  if (/^(localhost|[\w-]+\.[a-z]{2,})(:\d+)?([/?#].*)?$/i.test(value)) return 'https://' + value;
  return 'https://duckduckgo.com/?q=' + encodeURIComponent(value);
}
export function safeLabel(url) {
  try { const parsed = new URL(url); return parsed.hostname.replace(/^www\./, '') + (parsed.pathname === '/' ? '' : parsed.pathname); }
  catch { return String(url); }
}
