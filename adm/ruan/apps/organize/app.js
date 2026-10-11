(() => {
  "use strict";
  const KEY = "ruan.organize.v1";
  const SECTORS = {
    "Entrada": "Ideias e coisas para classificar",
    "Projetos": "Objetivos e entregas",
    "Rotina": "Compromissos e tarefas recorrentes",
    "Ideias": "Notas para desenvolver depois"
  };
  const STATUSES = {todo:"A fazer",doing:"Em andamento",done:"Concluído"};
  const byId = id => document.getElementById(id);
  let currentSector = "Projetos";
  let toastTimer;
  function uid() { return "org-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,8); }
  function escapeHTML(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char])); }
  function readStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
      return {version:1,tasks:Array.isArray(parsed.tasks)?parsed.tasks:[]};
    } catch { return {version:1,tasks:[]}; }
  }
  let state = readStore();
  function save(message) {
    try { localStorage.setItem(KEY,JSON.stringify(state)); renderAll(); if(message) notify(message); }
    catch { notify("Não foi possível salvar neste navegador."); }
  }
  function notify(message) {
    const toast=byId("toast"); toast.textContent=message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),2400);
  }
  function today() {
    const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  }
  function dateLabel(value) {
    if(!value) return "";
    const d=new Date(value+"T12:00:00");
    return Number.isNaN(d.getTime())?"":d.toLocaleDateString("pt-BR");
  }
  function alertTasks() {
    const day=today();
    return state.tasks.filter(task=>task.status!=="done"&&(task.priority==="urgent"||(task.dueDate&&task.dueDate<=day)))
      .sort((a,b)=>(a.priority==="urgent"?0:1)-(b.priority==="urgent"?0:1)||String(a.dueDate||"9999").localeCompare(String(b.dueDate||"9999")));
  }
  function renderAlerts() {
    const tasks=alertTasks();
    byId("alert-count").textContent=String(tasks.length);
    byId("alerts").innerHTML=tasks.length?tasks.slice(0,4).map(task=>{
      const overdue=task.dueDate&&task.dueDate<today();
      const label=task.priority==="urgent"?"Urgente":overdue?"Atrasada":task.dueDate===today()?"Hoje":dateLabel(task.dueDate);
      return '<div class="alert-row '+(task.priority==="urgent"||overdue?"urgent":"")+'"><span class="alert-dot"></span><span class="alert-main"><strong>'+escapeHTML(task.title)+'</strong><small>'+escapeHTML(task.sector||"Entrada")+'</small></span><span class="alert-label">'+escapeHTML(label)+'</span></div>';
    }).join(""):'<div class="empty-alert">Nenhuma tarefa urgente ou com prazo próximo.</div>';
  }
  function renderSectorCounts() {
    Object.keys(SECTORS).forEach(sector=>{
      const count=state.tasks.filter(task=>task.sector===sector&&task.status!=="done").length;
      const node=document.querySelector('[data-sector-count="'+sector+'"]');
      if(node) node.textContent=String(count);
    });
  }
  function cardHTML(task) {
    const overdue=task.dueDate&&task.dueDate<today()&&task.status!=="done";
    const dueClass=overdue?"overdue":"due";
    const priorityClass=task.priority==="urgent"?"urgent":task.priority==="high"?"high":"";
    const priorityLabel={low:"Baixa",normal:"Normal",high:"Alta",urgent:"Urgente"}[task.priority]||"Normal";
    let moveButton="";
    if(task.status==="todo") moveButton='<button data-move="doing" data-id="'+escapeHTML(task.id)+'">Iniciar →</button>';
    else if(task.status==="doing") moveButton='<button data-move="todo" data-id="'+escapeHTML(task.id)+'">← A fazer</button><button data-move="done" data-id="'+escapeHTML(task.id)+'">Concluir ✓</button>';
    else moveButton='<button data-move="todo" data-id="'+escapeHTML(task.id)+'">Reabrir</button>';
    const due=task.dueDate?'<span class="tag '+dueClass+'">'+(overdue?"Atrasada · ":"Prazo · ")+escapeHTML(dateLabel(task.dueDate))+'</span>':"";
    const desc=task.description?'<p>'+escapeHTML(task.description)+'</p>':"";
    return '<article class="task-card"><h3>'+escapeHTML(task.title)+'</h3>'+desc+'<div class="task-meta"><span class="tag '+priorityClass+'">'+priorityLabel+'</span>'+due+'</div><div class="card-actions">'+moveButton+'<button class="delete" data-delete="'+escapeHTML(task.id)+'" aria-label="Excluir cartão">Excluir</button></div></article>';
  }
  function renderBoard() {
    byId("board-title").textContent=currentSector;
    byId("board-subtitle").textContent=SECTORS[currentSector]||"Acompanhe seus cartões.";
    Object.keys(STATUSES).forEach(status=>{
      const tasks=state.tasks.filter(task=>task.sector===currentSector&&task.status===status);
      byId("count-"+status).textContent=String(tasks.length);
      byId("cards-"+status).innerHTML=tasks.length?tasks.map(cardHTML).join(""):'<div class="empty-column">Sem cartões</div>';
    });
  }
  function renderAll() { renderAlerts(); renderSectorCounts(); if(!byId("board-view").hidden) renderBoard(); }
  function openSector(sector) {
    if(!SECTORS[sector]) return;
    currentSector=sector; byId("home-view").hidden=true; byId("board-view").hidden=false; byId("task-form").hidden=true;
    renderBoard(); window.scrollTo({top:0,behavior:"smooth"});
  }
  function openHome() { byId("board-view").hidden=true; byId("home-view").hidden=false; renderAll(); window.scrollTo({top:0,behavior:"smooth"}); }
  document.addEventListener("click",event=>{
    const sector=event.target.closest("[data-sector]");
    if(sector){openSector(sector.dataset.sector);return;}
    if(event.target.closest("#back-sectors")){openHome();return;}
    if(event.target.closest("#new-task-open")){byId("task-form").hidden=false;byId("task-form").elements.title.focus();return;}
    if(event.target.closest("#cancel-task")){byId("task-form").reset();byId("task-form").hidden=true;return;}
    const move=event.target.closest("[data-move]");
    if(move){const task=state.tasks.find(item=>item.id===move.dataset.id);if(task){task.status=move.dataset.move;save(task.status==="done"?"Cartão concluído.":"Cartão atualizado.");}return;}
    const del=event.target.closest("[data-delete]");
    if(del){if(!window.confirm("Excluir este cartão?"))return;state.tasks=state.tasks.filter(item=>item.id!==del.dataset.delete);save("Cartão removido.");}
  });
  byId("task-form").addEventListener("submit",event=>{
    event.preventDefault();const form=event.currentTarget;const data=new FormData(form);
    const title=String(data.get("title")||"").trim();if(!title)return;
    state.tasks.push({id:uid(),title,description:String(data.get("description")||"").trim(),sector:currentSector,status:"todo",priority:String(data.get("priority")||"normal"),dueDate:String(data.get("dueDate")||""),createdAt:new Date().toISOString()});
    form.reset();form.hidden=true;save("Cartão adicionado.");
  });
  window.addEventListener("storage",event=>{if(!event.key||event.key===KEY){state=readStore();renderAll();}});
  renderAll();
  if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
})();