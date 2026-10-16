import { createShadowebRuntime } from "./runtime.js";
import { SEARCH_ENGINES, normalizeHttps, safeLabel } from "./address.js";

(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const KEYS = { prefs:"shadoweb.preferences.v1", favorites:"shadoweb.favorites.v1", history:"shadoweb.history.v1", shortcuts:"shadoweb.shortcuts.v1", connectorSettings:"shadoweb.connectors.v1" };
  const PROFILES = { personal:"Pessoal", study:"Estudos", work:"Trabalho", creator:"Criador", general:"Geral" };
  const runtime = createShadowebRuntime();
  const state = { view:"home", prefs:{engine:"duckduckgo",profile:"personal"}, favorites:[], history:[], shortcuts:[] };
  let toastTimer;
  const read = (key, fallback) => { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { notify("O armazenamento local não está disponível."); return false; } };
  function notify(message) { const el=$("toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2800); }
  function download(name, data, type="application/json") { const blob=new Blob([data],{type}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
  function openAddress(raw) {
    let url; try { url=normalizeHttps(raw); } catch(error) { notify(error.message); return; }
    if(!url.startsWith("https://")) { notify("Apenas endereços HTTPS podem ser abertos."); return; }
    state.history=[{url,title:safeLabel(url),at:new Date().toISOString()},...state.history.filter(x=>x.url!==url)].slice(0,50);
    write(KEYS.history,state.history); renderHistory();
    const nativeBrowser=window.Capacitor?.Plugins?.Browser;
    if(nativeBrowser?.open){nativeBrowser.open({url}).catch(()=>notify("Não foi possível abrir o endereço externo."));return;}
    const opened=window.open(url,"_blank","noopener,noreferrer");
    if(!opened) notify("O navegador bloqueou a nova aba. Permita a abertura do link e tente novamente.");
  }
  function setView(view) {
    const views=["home","favorites","history","connections","world","knowledge","plugins","audit"];
    state.view=views.includes(view)?view:"home";
    document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view));
    views.forEach(name=>{ const section=$("view-"+name); if(section) section.hidden=name!==state.view; });
    renderFavorites(); renderHistory();
    if(state.view==="connections") renderConnections();
    if(state.view==="world") renderWorldApps();
    if(state.view==="knowledge") renderKnowledge();
    if(state.view==="plugins") renderPlugins();
    if(state.view==="audit") renderAudit();
  }
  function addFavorite(raw) {
    let url; try { url=normalizeHttps(raw); if(!url.startsWith("https://")) throw new Error("Salve um endereço HTTPS, não uma pesquisa."); } catch(error) { notify(error.message); return; }
    if(state.favorites.some(x=>x.url===url)) { notify("Esse endereço já está salvo."); return; }
    state.favorites=[{url,title:safeLabel(url),at:new Date().toISOString()},...state.favorites].slice(0,100); write(KEYS.favorites,state.favorites); renderFavorites(); notify("Favorito salvo neste dispositivo.");
  }
  function savedRow(item, kind) {
    const row=document.createElement("div"); row.className="saved-row";
    const main=document.createElement("button"); main.type="button"; main.className="saved-main";
    const title=document.createElement("strong"); title.textContent=item.title||safeLabel(item.url||"");
    const small=document.createElement("small"); small.textContent=item.url||item.body||"";
    main.append(title,small); main.addEventListener("click",()=>kind==="knowledge"?editNote(item):openAddress(item.url)); row.append(main);
    const action=document.createElement("button"); action.type="button"; action.className="row-action";
    if(kind==="favorite") { action.textContent="Remover"; action.addEventListener("click",()=>{state.favorites=state.favorites.filter(x=>x.url!==item.url);write(KEYS.favorites,state.favorites);renderFavorites();}); row.append(action); }
    if(kind==="history") { action.textContent="Abrir"; action.addEventListener("click",()=>openAddress(item.url)); row.append(action); }
    if(kind==="knowledge") { action.textContent="Excluir"; action.addEventListener("click",()=>{runtime.knowledge.remove(item.id);renderKnowledge();notify("Nota excluída.");}); row.append(action); }
    return row;
  }
  function renderFavorites() { const list=$("favorites-list"); list.replaceChildren(...state.favorites.map(x=>savedRow(x,"favorite"))); $("favorites-empty").hidden=state.favorites.length>0; $("favorite-count").textContent=String(state.favorites.length); }
  function renderHistory() { const list=$("history-list"); list.replaceChildren(...state.history.map(x=>savedRow(x,"history"))); $("history-empty").hidden=state.history.length>0; }
  function applyPrefs() { $("search-engine").value=state.prefs.engine; $("profile-select").value=state.prefs.profile; $("profile-name").textContent=PROFILES[state.prefs.profile]||"Pessoal"; document.documentElement.dataset.profile=state.prefs.profile; }
  function setEye(open) { $("eye-panel").hidden=!open; if(open) $("close-eye").focus(); else $("open-eye").focus(); }
  function card({title,description,mark="◈",action,detail}) {
    const b=document.createElement("button"); b.type="button"; b.className="shortcut";
    const icon=document.createElement("span"); icon.className="shortcut-symbol"; icon.textContent=mark;
    const strong=document.createElement("strong"); strong.textContent=title;
    const small=document.createElement("small"); small.textContent=description;
    b.append(icon,strong,small);
    if(detail){const foot=document.createElement("small");foot.className="world-card-status";foot.textContent=detail;b.append(foot);}
    b.addEventListener("click",action); return b;
  }
  function renderWorldApps() {
    const grid=$("world-apps"); grid.replaceChildren(
      card({title:"Pesquisar na web",description:"Abrir pesquisa no seu mecanismo",mark:"⌕",action:()=>{$("address-input").focus();setView("home");}}),
      card({title:"Wikipedia",description:"Pesquisar conhecimento aberto",mark:"W",detail:"Conector externo · requer permissão",action:()=>{setView("world");$("connector-query").focus();}}),
      card({title:"YouTube",description:"Vídeos e canais",mark:"▶",action:()=>openAddress("https://www.youtube.com/")}),
      card({title:"GitHub",description:"Projetos e código",mark:"⌘",action:()=>openAddress("https://github.com/")}),
      card({title:"WordDark",description:"Mundo operacional do ecossistema",mark:"D",detail:"Conexão autenticada pendente",action:()=>notify("WordDark ainda não possui um endpoint autenticado configurado.")}),
      card({title:"darkHub",description:"Análise e criação de aplicativos",mark:"H",detail:"Conexão autenticada pendente",action:()=>notify("darkHub ainda não possui um endpoint autenticado configurado.")}),
      card({title:"Céu / Terra",description:"Execução e origem das necessidades",mark:"◌",detail:"Conexão autenticada pendente",action:()=>notify("Os conectores internos serão ativados após definir os contratos de API.")})
    );
  }
  function connectorSettings() { return read(KEYS.connectorSettings,{}); }
  function saveConnectorSetting(id, enabled) {
    const settings=connectorSettings(); settings[id]=Boolean(enabled); write(KEYS.connectorSettings,settings);
    const connector=runtime.connectors.find(x=>x.id===id); if(connector) connector.enabled=Boolean(enabled);
    runtime.audit.record(enabled?"connector.enabled":"connector.disabled",{connectorId:id}); renderConnections(); renderWorldApps();
  }
  function renderConnections() {
    const list=$("connector-list"); list.replaceChildren();
    const settings=connectorSettings();
    runtime.connectors.forEach(connector=>{
      if(Object.hasOwn(settings,connector.id)) connector.enabled=settings[connector.id];
      const row=document.createElement("article"); row.className="connection-card";
      const icon=document.createElement("span"); icon.className="connection-icon"; icon.textContent=connector.id==="wikipedia"?"W":connector.id==="web-search"?"⌕":"▤";
      const body=document.createElement("div"); body.className="connection-body";
      const title=document.createElement("strong"); title.textContent=connector.name;
      const desc=document.createElement("p"); desc.textContent=connector.description;
      const status=document.createElement("small"); status.className=connector.enabled?"active-status":"pending"; status.textContent=connector.enabled?"Conector ativado":"Desativado";
      const grant=document.createElement("small"); grant.className="pending"; grant.textContent="Escopos: "+connector.scopes.join(", ")+" · "+(connector.scopes.every(s=>runtime.gate.isGranted(connector.id,s))?"permissão concedida":"permissão não concedida");
      const actions=document.createElement("div"); actions.className="inline-actions";
      const toggle=document.createElement("button"); toggle.className="small-button"; toggle.type="button"; toggle.textContent=connector.enabled?"Desativar":"Ativar"; toggle.addEventListener("click",()=>saveConnectorSetting(connector.id,!connector.enabled));
      const permission=document.createElement("button"); permission.className="small-button"; permission.type="button"; permission.textContent=connector.scopes.every(s=>runtime.gate.isGranted(connector.id,s))?"Revogar acesso":"Conceder acesso";
      permission.addEventListener("click",()=>{ if(connector.scopes.every(s=>runtime.gate.isGranted(connector.id,s))){runtime.gate.revoke(connector.id);runtime.audit.record("permission.revoked",{connectorId:connector.id});}else{runtime.gate.grant(connector.id,connector.scopes);runtime.audit.record("permission.granted",{connectorId:connector.id,scopes:connector.scopes});}renderConnections();renderAudit();notify("Permissões atualizadas.");});
      actions.append(toggle,permission); body.append(title,desc,status,grant,actions); row.append(icon,body); list.append(row);
    });
  }
  async function searchWikipedia(query) {
    const results=$("connector-results"); results.replaceChildren(); $("connector-results-empty").hidden=false; $("connector-results-empty").textContent="Consultando o conector...";
    const reply=await runtime.bridge.request({connectorId:"wikipedia",action:"search",input:{query}},{scope:"connector.read"});
    if(!reply.ok){$("connector-results-empty").textContent=reply.error;return;}
    const rows=reply.result; $("connector-results-empty").hidden=rows.length>0; $("connector-results-empty").textContent=rows.length?"":"Nenhum resultado encontrado.";
    rows.forEach(item=>{const row=document.createElement("article");row.className="saved-row";const body=document.createElement("div");body.className="saved-main";const title=document.createElement("strong");title.textContent=item.title;const desc=document.createElement("small");desc.textContent=item.snippet;const link=document.createElement("button");link.type="button";link.className="row-action";link.textContent="Abrir";link.addEventListener("click",()=>openAddress(item.url));body.append(title,desc);row.append(body,link);results.append(row);});
  }
  function renderKnowledge(filter="") {
    const list=$("knowledge-list"); const query=filter.trim().toLocaleLowerCase();
    const notes=runtime.knowledge.list().filter(n=>(n.title+" "+n.body).toLocaleLowerCase().includes(query));
    list.replaceChildren(...notes.map(n=>savedRow(n,"knowledge"))); $("knowledge-empty").hidden=notes.length>0;
  }
  function editNote(note) { $("knowledge-title").value=note.title; $("knowledge-body").value=note.body; $("knowledge-form").dataset.editId=note.id; $("knowledge-title").focus(); }
  function renderPlugins() {
    const list=$("plugins-list"), rows=runtime.plugins.list(); list.replaceChildren();
    rows.forEach(plugin=>{const row=document.createElement("article");row.className="connection-card";const icon=document.createElement("span");icon.className="connection-icon";icon.textContent="⌘";const body=document.createElement("div");body.className="connection-body";const title=document.createElement("strong");title.textContent=plugin.name+" · "+plugin.version;const desc=document.createElement("p");desc.textContent=plugin.description;const state=document.createElement("small");state.className="pending";state.textContent=(plugin.enabled?"Registro ativado":"Registro desativado")+" · não executa código";const toggle=document.createElement("button");toggle.type="button";toggle.className="small-button";toggle.textContent=plugin.enabled?"Desativar registro":"Ativar registro";toggle.addEventListener("click",()=>{runtime.plugins.setEnabled(plugin.id,!plugin.enabled);renderPlugins();notify("Registro do plugin atualizado; nenhum código foi executado.");});body.append(title,desc,state,toggle);row.append(icon,body);list.append(row);});
    $("plugins-empty").hidden=rows.length>0;
  }
  function renderAudit() {
    const list=$("audit-list"), rows=runtime.audit.list(); list.replaceChildren();
    rows.forEach(event=>{const row=document.createElement("article");row.className="saved-row";const body=document.createElement("div");body.className="saved-main";const title=document.createElement("strong");title.textContent=event.event;const desc=document.createElement("small");desc.textContent=new Date(event.at).toLocaleString()+" · "+Object.entries(event.detail||{}).map(([k,v])=>k+": "+v).join(" · ");body.append(title,desc);row.append(body);list.append(row);});
    $("audit-empty").hidden=rows.length>0;
  }
  function setupShortcuts() {
    const grid=$("shortcut-grid");
    state.shortcuts.forEach(item=>{const b=card({title:item.title,description:item.url,mark:"↗",action:()=>openAddress(item.url)});b.dataset.customShortcut=item.url;grid.append(b);});
    $("add-shortcut").addEventListener("click",()=>{const raw=window.prompt("Digite o endereço HTTPS para criar um atalho:");if(!raw)return;try{const url=normalizeHttps(raw);if(!url.startsWith("https://"))throw new Error("Use um endereço HTTPS, não uma pesquisa.");if(state.shortcuts.some(x=>x.url===url))throw new Error("Esse atalho já existe.");state.shortcuts=[{url,title:safeLabel(url)},...state.shortcuts].slice(0,20);write(KEYS.shortcuts,state.shortcuts);grid.querySelectorAll("[data-custom-shortcut]").forEach(x=>x.remove());setupShortcutCardsOnly();notify("Atalho adicionado.");}catch(e){notify(e.message);}});
  }
  function setupShortcutCardsOnly(){const grid=$("shortcut-grid");state.shortcuts.forEach(item=>{const b=card({title:item.title,description:item.url,mark:"↗",action:()=>openAddress(item.url)});b.dataset.customShortcut=item.url;grid.append(b);});}
  $("search-form").addEventListener("submit",e=>{e.preventDefault();openAddress($("address-input").value);});
  $("search-engine").addEventListener("change",e=>{state.prefs.engine=SEARCH_ENGINES[e.target.value]?e.target.value:"duckduckgo";write(KEYS.prefs,state.prefs);runtime.audit.record("settings.changed",{setting:"searchEngine",value:state.prefs.engine});notify("Mecanismo de pesquisa atualizado.");});
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
  document.querySelectorAll(".shortcut[data-url]").forEach(b=>b.addEventListener("click",()=>openAddress(b.dataset.url)));
  $("open-eye").addEventListener("click",()=>setEye(true)); $("eye-card").addEventListener("click",()=>setEye(true)); $("close-eye").addEventListener("click",()=>setEye(false));
  $("profile-button").addEventListener("click",()=>{if(typeof $("profile-dialog").showModal==="function")$("profile-dialog").showModal();else notify("Configuração de perfil não suportada.");});
  $("profile-form").addEventListener("submit",e=>{e.preventDefault();state.prefs.profile=PROFILES[$("profile-select").value]?$("profile-select").value:"personal";write(KEYS.prefs,state.prefs);applyPrefs();$("profile-dialog").close();runtime.audit.record("settings.changed",{setting:"profile",value:state.prefs.profile});notify("Perfil salvo neste dispositivo.");});
  $("add-favorite").addEventListener("click",()=>{const value=$("address-input").value.trim();const raw=value||window.prompt("Cole o endereço HTTPS que deseja salvar:");if(raw)addFavorite(raw);});
  $("clear-history").addEventListener("click",()=>{state.history=[];write(KEYS.history,state.history);renderHistory();notify("Histórico local limpo.");});
  $("connector-search-form").addEventListener("submit",e=>{e.preventDefault();searchWikipedia($("connector-query").value).catch(err=>notify(err.message));});
  $("knowledge-form").addEventListener("submit",e=>{e.preventDefault();try{runtime.knowledge.save({id:e.currentTarget.dataset.editId,title:$("knowledge-title").value,body:$("knowledge-body").value});e.currentTarget.dataset.editId="";e.currentTarget.reset();renderKnowledge();notify("Nota salva na biblioteca local.");}catch(err){notify(err.message);}});
  $("knowledge-search")?.addEventListener("input",e=>renderKnowledge(e.target.value));
  $("export-knowledge").addEventListener("click",()=>download("shadoweb-knowledge.json",JSON.stringify(runtime.knowledge.export(),null,2)));
  $("import-knowledge").addEventListener("click",()=>$("knowledge-file").click());
  $("knowledge-file").addEventListener("change",async e=>{const file=e.target.files?.[0];if(!file)return;try{const count=runtime.knowledge.import(JSON.parse(await file.text()));renderKnowledge();notify(count+" notas importadas.");}catch(err){notify(err.message);}finally{e.target.value="";}});
  $("import-plugin").addEventListener("click",()=>$("plugin-file").click());
  $("plugin-file").addEventListener("change",async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>50000){notify("Manifesto excede 50 KB.");e.target.value="";return;}try{runtime.plugins.importManifest(JSON.parse(await file.text()));renderPlugins();renderAudit();notify("Manifesto importado. Código executável não foi carregado.");}catch(err){notify(err.message);}finally{e.target.value="";}});
  $("download-plugin-template").addEventListener("click",()=>download("shadoweb-plugin-template.json",JSON.stringify(runtime.plugins.exportTemplate(),null,2)));
  $("export-audit").addEventListener("click",()=>download("shadoweb-audit.json",JSON.stringify({format:"shadoweb-audit",version:1,events:runtime.audit.list()},null,2)));
  $("profile-dialog").addEventListener("click",e=>{if(e.target===$("profile-dialog"))$("profile-dialog").close();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("eye-panel").hidden)setEye(false);});
  const prefs=read(KEYS.prefs,{});
  state.prefs.engine=ENGINES[prefs.engine]?prefs.engine:"duckduckgo"; state.prefs.profile=PROFILES[prefs.profile]?prefs.profile:"personal";
  state.favorites=read(KEYS.favorites,[]).filter(x=>x&&typeof x.url==="string"&&x.url.startsWith("https://")).slice(0,100);
  state.history=read(KEYS.history,[]).filter(x=>x&&typeof x.url==="string"&&x.url.startsWith("https://")).slice(0,50);
  state.shortcuts=read(KEYS.shortcuts,[]).filter(x=>x&&typeof x.url==="string"&&x.url.startsWith("https://")&&typeof x.title==="string").slice(0,20);
  const settings=connectorSettings(); runtime.connectors.forEach(c=>{if(Object.hasOwn(settings,c.id))c.enabled=settings[c.id];});
  applyPrefs(); setupShortcuts(); renderFavorites(); renderHistory(); renderWorldApps(); renderConnections(); renderKnowledge(); renderPlugins(); renderAudit();
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register("./sw.js").catch(() => {});
})();
