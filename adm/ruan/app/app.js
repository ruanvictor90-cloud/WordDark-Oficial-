/* Ruan UI v0.1 — browser-local prototype; not a security sandbox. */
(() => {
  "use strict";
  const STORE_KEY = "ruan.personal.ui.v1";
  const CAPABILITIES = new Set(["tasks.read","tasks.write","notes.read","notes.write","calendar.read","calendar.write","files.read.selected","notifications.send","world.request"]);
  const byId = id => document.getElementById(id);
  const uid = prefix => prefix + "_" + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2));
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const readStore = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      return {
        apps: Array.isArray(parsed.apps) ? parsed.apps : [],
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : []
      };
    } catch {
      return { apps: [], tasks: [], notes: [] };
    }
  };
  let state = readStore();
  let toastTimer;
  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      renderAll();
    } catch {
      notify("Não foi possível salvar. Verifique o espaço disponível no navegador.");
    }
  }
  function notify(message) {
    const toast = byId("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2700);
  }
  const capabilityLabel = key => ({
    "tasks.read":"Ler tarefas","tasks.write":"Gerenciar tarefas",
    "notes.read":"Ler notas","notes.write":"Criar notas",
    "calendar.read":"Ler calendário","calendar.write":"Gerenciar calendário",
    "files.read.selected":"Ler arquivos selecionados","notifications.send":"Enviar notificações",
    "world.request":"Solicitar operações ao WordDark"
  })[key] || key;

  function go(view) {
    const known = ["inicio","apps","fabrica","tarefas","notas","conexoes"];
    if (!known.includes(view)) return;
    document.querySelectorAll(".view").forEach(node => node.classList.toggle("active", node.id === "view-" + view));
    document.querySelectorAll("[data-view]").forEach(node => node.classList.toggle("active", node.dataset.view === view));
    const titles = {inicio:"Visão geral",apps:"Meus aplicativos",fabrica:"Fábrica de aplicativos",tarefas:"Tarefas",notas:"Biblioteca pessoal",conexoes:"Conexões e acesso"};
    byId("page-title").textContent = titles[view];
    byId("section-eyebrow").textContent = view === "inicio" ? "ÁREA PESSOAL" : "RUAN / " + titles[view].toUpperCase();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function renderStats() {
    byId("stat-apps").textContent = state.apps.length;
    byId("stat-tasks").textContent = state.tasks.filter(task => !task.done).length;
  }
  function renderApps() {
    const target = byId("apps-list");
    if (!state.apps.length) {
      target.innerHTML = '<div class="empty-state"><strong>Sua biblioteca começa aqui.</strong>Crie o registro do primeiro aplicativo. Ele ficará separado e sem permissões concedidas até você autorizar.</div>';
      return;
    }
    target.innerHTML = state.apps.map(app => {
      const grants = Array.isArray(app.grantedCapabilities) ? app.grantedCapabilities : [];
      const requested = Array.isArray(app.capabilities) ? app.capabilities : [];
      const tags = requested.length ? requested.map(cap => '<span class="tag '+(grants.includes(cap)?"granted":"")+'">'+escapeHTML(capabilityLabel(cap))+(grants.includes(cap)?" · autorizado":" · solicitado")+'</span>').join("") : '<span class="tag">Sem permissões solicitadas</span>';
      const safeId = escapeHTML(app.id);
      return '<article class="app-card"><div class="app-card-top"><div class="app-symbol">'+escapeHTML(app.name.trim().charAt(0).toUpperCase() || "A")+'</div><div><h3>'+escapeHTML(app.name)+'</h3><p>'+escapeHTML(app.id)+' · v'+escapeHTML(app.version || "0.1.0")+'</p></div></div><p>'+escapeHTML(app.description || "Sem descrição adicionada.")+'</p><div class="app-meta">'+tags+'</div><div class="app-card-actions"><button class="small-btn" data-app-action="export" data-app-id="'+safeId+'">Exportar módulo</button><button class="small-btn" data-app-action="permissions" data-app-id="'+safeId+'">'+(grants.length?"Revogar acessos":"Autorizar acessos")+'</button><button class="small-btn danger" data-app-action="delete" data-app-id="'+safeId+'">Remover</button></div></article>';
    }).join("");
  }
  function renderTasks() {
    const target = byId("tasks-list");
    if (!state.tasks.length) {
      target.innerHTML = '<div class="empty-state"><strong>Nenhuma tarefa por enquanto.</strong>Adicione uma tarefa acima para organizar seu próximo passo.</div>';
      return;
    }
    target.innerHTML = state.tasks.map(task => '<article class="task-item '+(task.done?"completed":"")+'"><input type="checkbox" aria-label="Concluir tarefa" data-task-toggle="'+escapeHTML(task.id)+'" '+(task.done?"checked":"")+'><div class="task-text"><strong>'+escapeHTML(task.title)+'</strong><small>'+new Date(task.createdAt).toLocaleDateString("pt-BR")+'</small></div><span class="priority '+escapeHTML(task.priority)+'">'+escapeHTML(({low:"baixa",normal:"normal",high:"alta",urgent:"urgente"})[task.priority] || "normal")+'</span><button class="task-delete" data-task-delete="'+escapeHTML(task.id)+'" aria-label="Excluir tarefa">×</button></article>').join("");
  }
  function renderNotes() {
    const target = byId("notes-list");
    if (!state.notes.length) {
      target.innerHTML = '<div class="empty-state"><strong>Sua biblioteca ainda está vazia.</strong>Salve uma ideia ou decisão para encontrá-la depois.</div>';
      return;
    }
    target.innerHTML = state.notes.slice().reverse().map(note => '<article class="note-card"><button class="task-delete" data-note-delete="'+escapeHTML(note.id)+'" aria-label="Excluir nota">×</button><h3>'+escapeHTML(note.title)+'</h3><p>'+escapeHTML(note.content || "Sem conteúdo.")+'</p><small>'+new Date(note.createdAt).toLocaleString("pt-BR")+'</small></article>').join("");
  }
  function renderAll() { renderStats(); renderApps(); renderTasks(); renderNotes(); }

  function exportJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportApp(app) {
    const manifest = {
      schemaVersion: 1,
      kind: "ruan-app-manifest",
      id: app.id, name: app.name, version: app.version || "0.1.0",
      description: app.description || "",
      requestedCapabilities: app.capabilities || [],
      grantedCapabilities: app.grantedCapabilities || [],
      runtime: {type:"not-yet-packaged", entrypoint:null},
      note: "Manifest export only. This file is not an executable app and does not prove sandbox isolation."
    };
    exportJSON("ruan-app-" + app.id.replace(/[^a-z0-9._-]/g,"-") + ".json", manifest);
    notify("Manifesto individual exportado. Nenhum outro app foi incluído.");
  }
  document.addEventListener("click", event => {
    const nav = event.target.closest("[data-view]");
    if (nav) { go(nav.dataset.view); return; }
    const route = event.target.closest("[data-go]");
    if (route) { go(route.dataset.go); return; }
    const action = event.target.closest("[data-app-action]");
    if (action) {
      const app = state.apps.find(item => item.id === action.dataset.appId);
      if (!app) return;
      if (action.dataset.appAction === "export") exportApp(app);
      if (action.dataset.appAction === "permissions") {
        const current = app.grantedCapabilities || [];
        if (current.length) {
          if (!window.confirm("Revogar todas as permissões concedidas a " + app.name + "?")) return;
          app.grantedCapabilities = [];
          persist();
          notify("Permissões revogadas para este registro.");
        } else {
          const requested = (app.capabilities || []).filter(cap => CAPABILITIES.has(cap));
          if (!requested.length) { notify("Este app não solicitou permissões."); return; }
          if (!window.confirm("Autorizar todas estas capacidades para " + app.name + "?\n\n" + requested.map(capabilityLabel).join("\n") + "\n\nEsta autorização é apenas um registro local da interface, ainda sem enforcement de runtime.")) return;
          app.grantedCapabilities = requested;
          persist();
          notify("Autorização local registrada. Ainda não habilita acesso real ao motor.");
        }
      }
      if (action.dataset.appAction === "delete") {
        if (!window.confirm("Remover o registro de " + app.name + "? Isso não remove um aplicativo instalado no telefone.")) return;
        state.apps = state.apps.filter(item => item.id !== app.id);
        persist();
        notify("Registro removido da biblioteca local.");
      }
      return;
    }
    const exportAll = event.target.closest("#export-all");
    if (exportAll) {
      exportJSON("ruan-biblioteca-local.json", {schemaVersion:1,exportedAt:new Date().toISOString(),apps:state.apps,tasks:state.tasks,notes:state.notes,note:"Backup local de dados da interface. Não inclui credenciais."});
      notify("Backup local preparado para exportação.");
    }
  });

  byId("app-form").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const id = String(data.get("id") || "").trim();
    const description = String(data.get("description") || "").trim();
    const capabilities = data.getAll("capabilities").map(String);
    if (!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(id)) { notify("ID inválido: use 2–64 caracteres minúsculos, números, ponto, hífen ou sublinhado."); return; }
    if (state.apps.some(app => app.id === id)) { notify("Já existe um app com esse ID."); return; }
    if (capabilities.some(cap => !CAPABILITIES.has(cap))) { notify("Uma capacidade solicitada não é reconhecida."); return; }
    state.apps.push({id,name,description,version:"0.1.0",capabilities:[...new Set(capabilities)],grantedCapabilities:[],createdAt:new Date().toISOString()});
    persist();
    form.reset();
    go("apps");
    notify("Registro criado sem permissões concedidas.");
  });
  byId("task-form").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    if (!title) return;
    state.tasks.push({id:uid("task"),title,priority:String(data.get("priority") || "normal"),done:false,createdAt:new Date().toISOString()});
    persist(); form.reset(); notify("Tarefa adicionada.");
  });
  byId("tasks-list").addEventListener("change", event => {
    const input = event.target.closest("[data-task-toggle]");
    if (!input) return;
    const task = state.tasks.find(item => item.id === input.dataset.taskToggle);
    if (task) { task.done = input.checked; persist(); }
  });
  byId("tasks-list").addEventListener("click", event => {
    const button = event.target.closest("[data-task-delete]");
    if (!button) return;
    state.tasks = state.tasks.filter(task => task.id !== button.dataset.taskDelete);
    persist(); notify("Tarefa removida.");
  });
  byId("note-form").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    if (!title) return;
    state.notes.push({id:uid("note"),title,content:String(data.get("content") || "").trim(),createdAt:new Date().toISOString()});
    persist(); form.reset(); notify("Nota salva na biblioteca local.");
  });
  byId("notes-list").addEventListener("click", event => {
    const button = event.target.closest("[data-note-delete]");
    if (!button) return;
    state.notes = state.notes.filter(note => note.id !== button.dataset.noteDelete);
    persist(); notify("Nota removida.");
  });
  renderAll();
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
})();