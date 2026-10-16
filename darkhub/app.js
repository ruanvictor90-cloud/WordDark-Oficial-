import { DarkHubVault, DARKHUB_STORAGE_KEYS } from "./core.js";

(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const vault = new DarkHubVault();
  const lockScreen = $("lock-screen"), unlockForm = $("unlock-form"), passphrase = $("passphrase"), confirmPass = $("passphrase-confirm");
  const lockTitle = $("lock-title"), lockDescription = $("lock-description"), lockFeedback = $("lock-feedback"), submitButton = $("unlock-submit");
  const toast = $("toast");
  let setupMode = !vault.isConfigured, currentView = "dashboard", idleTimer = null, toastTimer = null, busy = false;
  const viewIds = ["dashboard","ecosystem","technical","creator","registry","security","activity"];
  const names = { dashboard:"Painel central", ecosystem:"Análise do ecossistema", technical:"Análise técnica", creator:"Criador de apps", registry:"Registro de projetos", security:"Segurança e acesso", activity:"Registro de atividade" };
  function notify(message) { toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2500); }
  function setSecurityIndicator(label) { const state = $("security-state"); state.replaceChildren(); const dot = document.createElement("i"); state.append(dot, document.createTextNode(" " + label)); }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char])); }
  function formatDate(value) { try { return new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(value)); } catch { return ""; } }
  function setFeedback(id, message, error = false) { const el = $(id); el.textContent = message; el.dataset.state = error ? "error" : "success"; }
  function updateLockScreen() {
    setupMode = !vault.isConfigured;
    lockTitle.textContent = setupMode ? "Crie seu cofre" : "Acesso protegido";
    lockDescription.textContent = setupMode ? "Defina uma frase secreta para criptografar os registros deste dispositivo." : "Digite sua frase secreta para desbloquear o darkHub.";
    $("passphrase-label").textContent = setupMode ? "Frase secreta (mínimo 8 caracteres)" : "Frase secreta";
    confirmPass.hidden = !setupMode; $("confirm-label").hidden = !setupMode;
    submitButton.textContent = setupMode ? "Criar cofre protegido" : "Desbloquear darkHub";
    passphrase.value = ""; confirmPass.value = ""; lockFeedback.textContent = "";
    passphrase.autocomplete = setupMode ? "new-password" : "current-password";
    lockScreen.hidden = false; passphrase.focus();
  }
  function setBusy(value) { busy = value; submitButton.disabled = value; submitButton.textContent = value ? "Aguarde…" : (setupMode ? "Criar cofre protegido" : "Desbloquear darkHub"); }
  function readThrottle() { try { return JSON.parse(localStorage.getItem(DARKHUB_STORAGE_KEYS.throttle) || '{"count":0,"until":0}'); } catch { return {count:0,until:0}; } }
  function saveThrottle(value) { try { localStorage.setItem(DARKHUB_STORAGE_KEYS.throttle, JSON.stringify(value)); } catch {} }
  unlockForm.addEventListener("submit", async event => {
    event.preventDefault(); if (busy) return;
    const phrase = passphrase.value;
    if (phrase.length < 8 || phrase.length > 128) { lockFeedback.textContent = "Use entre 8 e 128 caracteres."; return; }
    if (setupMode && phrase !== confirmPass.value) { lockFeedback.textContent = "As frases secretas não coincidem."; return; }
    const throttle = readThrottle();
    if (!setupMode && throttle.until > Date.now()) { lockFeedback.textContent = "Muitas tentativas. Aguarde " + Math.ceil((throttle.until-Date.now())/1000) + " segundos."; return; }
    setBusy(true);
    try {
      if (setupMode) await vault.setup(phrase); else await vault.unlock(phrase);
      saveThrottle({count:0,until:0});
      lockScreen.hidden = true; setSecurityIndicator("Protegido");
      notify(setupMode ? "Cofre criado e criptografia ativada." : "darkHub desbloqueado.");
      renderAll(); resetIdleTimer();
    } catch (error) {
      lockFeedback.textContent = error?.message || "Não foi possível abrir o cofre.";
      if (!setupMode && error?.message === "Frase secreta incorreta.") {
        const count = (Number(throttle.count)||0) + 1;
        saveThrottle({count,until: count >= 5 ? Date.now()+60000 : 0});
      }
    } finally { setBusy(false); }
  });
  function lockApp(reason = "manual") {
    if (!vault.isUnlocked) { updateLockScreen(); return; }
    vault.lock(); clearTimeout(idleTimer);
    setSecurityIndicator("Bloqueado");
    lockScreen.hidden = false; passphrase.value = ""; confirmPass.value = "";
    lockFeedback.textContent = reason === "idle" ? "Sessão bloqueada por inatividade." : "";
    updateLockScreen();
  }
  function resetIdleTimer() { clearTimeout(idleTimer); if (vault.isUnlocked) idleTimer = setTimeout(() => lockApp("idle"), 5 * 60 * 1000); }
  ["pointerdown","keydown","touchstart","scroll"].forEach(eventName => document.addEventListener(eventName, resetIdleTimer, {passive:true}));
  document.addEventListener("visibilitychange", () => { if (document.hidden && vault.isUnlocked) lockApp("visibility"); });
  $("lock-now").addEventListener("click", () => lockApp("manual"));

  function go(view) {
    if (!viewIds.includes(view) || !vault.isUnlocked) return;
    currentView = view;
    document.querySelectorAll("[data-view-panel]").forEach(panel => { panel.hidden = panel.dataset.viewPanel !== view; panel.classList.toggle("active", panel.dataset.viewPanel === view); });
    document.querySelectorAll(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === view));
    $("sidebar").classList.remove("open"); $("sidebar-scrim").classList.remove("open"); $("menu-toggle").setAttribute("aria-expanded","false");
    renderAll();
    if (location.hash !== "#" + view) history.replaceState(null,"","#" + view);
  }
  document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => go(button.dataset.view)));
  document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => go(button.dataset.go)));
  $("menu-toggle").addEventListener("click", () => { const open = !$("sidebar").classList.contains("open"); $("sidebar").classList.toggle("open",open); $("sidebar-scrim").classList.toggle("open",open); $("menu-toggle").setAttribute("aria-expanded",String(open)); });
  $("sidebar-scrim").addEventListener("click", () => { $("sidebar").classList.remove("open"); $("sidebar-scrim").classList.remove("open"); $("menu-toggle").setAttribute("aria-expanded","false"); });

  function createRecordCard(item, collection, statusChoices = []) {
    const article = document.createElement("article"); article.className = "record-card";
    const copy = document.createElement("div"); copy.className = "record-copy";
    const title = document.createElement("strong"); title.textContent = item.title || item.name || item.slug || "Registro";
    const meta = document.createElement("small"); meta.textContent = [item.target || item.owner || item.slug, item.category || item.type, formatDate(item.createdAt)].filter(Boolean).join(" · ");
    const body = document.createElement("p"); body.textContent = item.findings || item.description || (item.platform ? item.platform + " · " + item.security : "");
    copy.append(title,meta); if(body.textContent) copy.append(body); article.append(copy);
    const status = document.createElement("span"); status.className = "record-status"; status.textContent = item.status || "Registrado"; article.append(status);
    const actions = document.createElement("div"); actions.className = "record-actions";
    if (collection === "apps") { const exportButton = document.createElement("button"); exportButton.type="button"; exportButton.textContent="Exportar base"; exportButton.addEventListener("click", () => exportApp(item.id)); actions.append(exportButton); }
    if (collection !== "apps") { const deleteButton = document.createElement("button"); deleteButton.type="button"; deleteButton.textContent="Excluir"; deleteButton.addEventListener("click", async () => { if (!confirm("Excluir este registro? A ação não pode ser desfeita.")) return; try { await vault.deleteRecord(collection,item.id); renderAll(); notify("Registro excluído."); } catch(error) { notify(error.message); } }); actions.append(deleteButton); }
    if (statusChoices.length) { const select = document.createElement("select"); select.setAttribute("aria-label","Atualizar estado"); statusChoices.forEach(value => { const option=document.createElement("option"); option.value=value; option.textContent=value; select.append(option); }); select.value=item.status; select.addEventListener("change", async () => { try { await vault.updateStatus(collection,item.id,select.value); renderAll(); notify("Estado atualizado."); } catch(error) { notify(error.message); } }); actions.append(select); }
    if (actions.childElementCount) copy.append(actions);
    return article;
  }
  function renderList(containerId, records, collection, statuses = []) {
    const container=$(containerId); container.replaceChildren();
    if (!records.length) { const empty=document.createElement("div"); empty.className="empty-state"; empty.textContent="Nenhum registro por enquanto. Os novos itens aparecerão aqui."; container.append(empty); return; }
    records.forEach(item => container.append(createRecordCard(item,collection,statuses)));
  }
  function renderActivity(containerId, records) {
    const container=$(containerId); container.replaceChildren();
    if (!records.length) { const empty=document.createElement("div"); empty.className="empty-state"; empty.textContent="Ainda não há atividade registrada."; container.append(empty); return; }
    records.slice(0,8).forEach(item => { const row=document.createElement("div");row.className="activity-row";const mark=document.createElement("span");mark.className="activity-mark";mark.textContent="◷";const copy=document.createElement("div");copy.className="activity-copy";const title=document.createElement("strong");title.textContent=item.detail||item.event;const detail=document.createElement("small");detail.textContent=(item.event||"Evento local")+" · "+formatDate(item.at);copy.append(title,detail);row.append(mark,copy);container.append(row); });
  }
  function renderAll() {
    if (!vault.isUnlocked) return;
    const state=vault.getState();
    $("metric-projects").textContent=String(state.projects.length);
    $("metric-analyses").textContent=String(state.ecosystemAnalyses.length+state.technicalAnalyses.length);
    $("metric-apps").textContent=String(state.apps.length);
    renderActivity("dashboard-activity",state.audit);
    renderList("eco-records",state.ecosystemAnalyses,"ecosystemAnalyses",["Rascunho","Em análise","Validada","Bloqueada"]);
    renderList("tech-records",state.technicalAnalyses,"technicalAnalyses",["Rascunho","Em análise","Aprovada","Reprovada","Bloqueada"]);
    renderList("created-apps",state.apps,"apps");
    renderList("project-records",state.projects,"projects",["Planejado","Em desenvolvimento","Em revisão","Em finalização","Concluído","Bloqueado"]);
    renderActivity("audit-records",state.audit);
    $("last-saved").textContent="Cofre criptografado · salvo neste dispositivo";
  }
  function formObject(form) { return Object.fromEntries(new FormData(form).entries()); }
  $("ecosystem-form").addEventListener("submit", async event => { event.preventDefault(); try { await vault.createAnalysis("ecosystem",{...formObject(event.currentTarget),category:formObject(event.currentTarget).kind}); event.currentTarget.reset(); setFeedback("eco-feedback","Análise registrada no cofre."); renderAll(); } catch(error) { setFeedback("eco-feedback",error.message,true); } });
  $("technical-form").addEventListener("submit", async event => { event.preventDefault(); const data=formObject(event.currentTarget); try { await vault.createAnalysis("technical",{...data,category:data.severity,severity:data.severity}); event.currentTarget.reset(); setFeedback("tech-feedback","Revisão técnica registrada no cofre."); renderAll(); } catch(error) { setFeedback("tech-feedback",error.message,true); } });
  $("creator-form").addEventListener("submit", async event => { event.preventDefault(); try { const app=await vault.createApp(formObject(event.currentTarget)); event.currentTarget.reset(); setFeedback("creator-feedback","Especificação criada. Agora você pode exportar os arquivos iniciais."); renderAll(); notify("App registrado: "+app.name); } catch(error) { setFeedback("creator-feedback",error.message,true); } });
  $("project-form").addEventListener("submit", async event => { event.preventDefault(); try { await vault.createProject(formObject(event.currentTarget)); event.currentTarget.reset(); setFeedback("project-feedback","Projeto registrado."); renderAll(); } catch(error) { setFeedback("project-feedback",error.message,true); } });
  async function exportApp(id) {
    try {
      const files=await vault.exportAppFiles(id);
      downloadText(files.manifest.id+"-app-manifest.json",JSON.stringify(files.manifest,null,2),"application/json");
      downloadText(files.manifest.id+"-index.html",files.html,"text/html");
      notify("Manifesto e página inicial exportados separadamente.");
      renderAll();
    } catch(error) { notify(error.message); }
  }
  function downloadText(filename,text,mime) { const blob=new Blob([text],{type:mime+";charset=utf-8"}); const url=URL.createObjectURL(blob); const link=document.createElement("a");link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  $("export-audit").addEventListener("click", async () => { try { const data=await vault.exportAudit(); downloadText("darkhub-audit.json",JSON.stringify(data,null,2),"application/json"); renderAll(); notify("Registro exportado."); } catch(error) { notify(error.message); } });
  $("change-passphrase").addEventListener("click", () => lockApp("manual"));
  if (!globalThis.crypto?.subtle) { lockDescription.textContent="Este navegador não oferece criptografia segura. Abra o darkHub em HTTPS ou use uma versão nativa compatível."; submitButton.disabled=true; }
  if (vault.isConfigured) updateLockScreen(); else updateLockScreen();
  const initial=location.hash.slice(1); if(viewIds.includes(initial)) currentView=initial;
  const originalSubmit=unlockForm.onsubmit;
  unlockForm.addEventListener("submit", () => { setTimeout(() => { if(vault.isUnlocked){go(currentView);}},0); });
})();