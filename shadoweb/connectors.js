const WIKI_API = "https://en.wikipedia.org/w/api.php";
function assertQuery(value) {
  const query = String(value ?? "").trim();
  if (!query || query.length > 180) throw new Error("Informe uma consulta de 1 a 180 caracteres.");
  return query;
}
export const builtInConnectors = [
  { id: "web-search", actions:["search"], name: "Pesquisa web", description: "Abre pesquisas no mecanismo escolhido.", scopes: ["web.search"], enabled: true, mode: "navigate" },
  { id: "wikipedia", actions:["search"], name: "Wikipedia", description: "Pesquisa artigos públicos da Wikipedia.", scopes: ["connector.read"], enabled: false, mode: "api" },
  { id: "local-knowledge", actions:["search"], name: "Biblioteca local", description: "Pesquisa notas armazenadas neste dispositivo.", scopes: ["knowledge.read"], enabled: true, mode: "local" }
];
export const connectorHandlers = {
  "web-search": async ({ query, engine = "duckduckgo" }) => {
    const urls = { duckduckgo: "https://duckduckgo.com/?q=", google: "https://www.google.com/search?q=", bing: "https://www.bing.com/search?q=" };
    if (!urls[engine]) throw new Error("Mecanismo de pesquisa não permitido.");
    return { kind: "navigate", url: urls[engine] + encodeURIComponent(assertQuery(query)) };
  },
  wikipedia: async ({ query }, { signal } = {}) => {
    const url = new URL(WIKI_API);
    url.search = new URLSearchParams({ action:"query", list:"search", srsearch:assertQuery(query), format:"json", origin:"*", srlimit:"6" }).toString();
    const response = await fetch(url, { method:"GET", mode:"cors", credentials:"omit", redirect:"error", signal, headers:{ Accept:"application/json" } });
    if (!response.ok) throw new Error("O conector Wikipedia respondeu com erro.");
    const payload = await response.json();
    const rows = payload?.query?.search;
    if (!Array.isArray(rows)) throw new Error("Resposta da Wikipedia incompatível.");
    return rows.map(row => ({ title:String(row.title || "").slice(0,180), snippet:String(row.snippet || "").replace(/<[^>]*>/g,"").slice(0,420), url:"https://en.wikipedia.org/wiki/" + encodeURIComponent(String(row.title || "").replace(/ /g,"_")) }));
  },
  "local-knowledge": async ({ query, notes = [] }) => {
    const q = assertQuery(query).toLocaleLowerCase();
    return notes.filter(note => (note.title + " " + note.body).toLocaleLowerCase().includes(q)).slice(0, 20).map(({id,title,body,updatedAt}) => ({id,title,body:body.slice(0,320),updatedAt}));
  }
};
