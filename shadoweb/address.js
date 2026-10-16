export const SEARCH_ENGINES = Object.freeze({
  duckduckgo: "https://duckduckgo.com/?q=",
  google: "https://www.google.com/search?q=",
  bing: "https://www.bing.com/search?q="
});
export function isLocalHost(hostname) {
  const host=String(hostname||"").toLowerCase().replace(/^\[|\]$/g,"").replace(/\.$/,"");
  if (!host || host==="localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || host==="::1" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) return true;
  const parts=host.split(".");
  if(parts.length===4 && parts.every(part=>/^\d{1,3}$/.test(part) && Number(part)<=255)) {
    const [a,b]=parts.map(Number);
    if(a===0||a===10||a===127||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===100&&b>=64&&b<=127)||(a===198&&(b===18||b===19))) return true;
  }
  return false;
}
export function normalizeHttps(value, engine="duckduckgo") {
  const raw=String(value||"").trim();
  if(!raw) throw new Error("Digite uma pesquisa ou endereço.");
  if(/^(javascript|data|file|intent|blob):/i.test(raw)) throw new Error("Esse tipo de endereço não é permitido.");
  if(/^https?:\/\//i.test(raw)) {
    const url=new URL(raw);
    if(url.protocol!=="https:"||!url.hostname||url.username||url.password) throw new Error("Use HTTPS sem credenciais no endereço.");
    if(isLocalHost(url.hostname)) throw new Error("Endereços locais ou privados não são aceitos nesta versão.");
    return url.href;
  }
  if(/^[\w-]+(?:\.[\w-]+)+(?:[/:?#].*)?$/.test(raw)) {
    const url=new URL("https://"+raw);
    if(isLocalHost(url.hostname)) throw new Error("Endereços locais ou privados não são aceitos nesta versão.");
    return url.href;
  }
  return (SEARCH_ENGINES[engine]||SEARCH_ENGINES.duckduckgo)+encodeURIComponent(raw);
}
export function safeLabel(url) {
  try { return new URL(url).hostname.replace(/^www\./,""); } catch { return String(url||""); }
}
