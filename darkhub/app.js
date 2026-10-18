import { createDarkHubRuntime } from "./engine/runtime.js";
import { createDarkHubOrchestrator } from "./engine/orchestrator.js";
import { createShadowAssistant } from "./engine/shadow.js";
import { createDarkHubWorkspace } from "./engine/workspace.js";
const runtime=createDarkHubRuntime();
const orchestrator=createDarkHubOrchestrator({runtime});
const shadow=createShadowAssistant({runtime,orchestrator});
const workspace=createDarkHubWorkspace({runtime});
let activeWorkspacePath="";
let loadedWorkspaceKey="";
const $=id=>document.getElementById(id);
const views=["home","create","panel","module","shadow"];
function moveWriteFormsToCreate(){
 const target=$("create"),before=$("draft-form");
 [["capability-form"],["task-form"]].forEach(([id])=>{
  const form=$(id);if(!form||!target||!before)return;
  const section=form.closest(".section");
  if(section)target.insertBefore(section,before);
 });
}
moveWriteFormsToCreate();
function showView(id){views.forEach(view=>$(view).hidden=view!==id);window.scrollTo({top:0,behavior:"smooth"});if(id==="home")renderHome();if(id==="create"){renderCreate();renderWorkspace();}if(id==="panel")renderPanel();if(id==="shadow")renderShadow();}
document.querySelectorAll("[data-view]").forEach(button=>button.addEventListener("click",()=>showView(button.dataset.view)));
function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function appCard(app){return '<button class="app-card" data-open-app="'+esc(app.id)+'"><span class="app-icon">'+esc(app.name.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase())+'</span><span><strong>'+esc(app.name)+'</strong><small>'+esc(app.kind==="module"?"Módulo interno":"Aplicativo independente")+' · '+esc(app.version)+'</small><small>'+esc(app.status)+'</small></span></button>';}
function renderHome(){
 const apps=runtime.listApps(),ops=orchestrator.dashboard(),drafts=runtime.exportState().drafts;
 $("app-drawer").innerHTML=apps.map(appCard).join("");$("app-count").textContent=String(apps.length);
 if($("overview")) $("overview").innerHTML='<div class="overview-card"><strong>'+apps.length+'</strong><small>Apps e módulos</small></div><div class="overview-card"><strong>'+ops.capabilities+'</strong><small>Capacidades catalogadas</small></div><div class="overview-card"><strong>'+ops.queuedTasks+'</strong><small>Tarefas em aberto</small></div><div class="overview-card"><strong>'+drafts.filter(d=>d.status!=="Finalizado"&&d.status!=="Cancelado").length+'</strong><small>Alterações em aberto</small></div>';
 document.querySelectorAll("[data-open-app]").forEach(button=>button.addEventListener("click",()=>openApp(button.dataset.openApp)));
}
function openApp(id){
 const app=runtime.getApp(id);if(!app)return;showView("module");
 $("module-content").innerHTML='<span class="eyebrow">'+esc(app.kind==="module"?"MÓDULO INTERNO":"APP INDEPENDENTE")+'</span><h1>'+esc(app.name)+'</h1><p>'+esc(app.description)+'</p><p>Versão de referência: '+esc(app.version)+' · Estado: '+esc(app.status)+'</p>';
 if(id==="shadoweb"){$("module-body").innerHTML='<article class="row-card"><strong>Foco atual: Shadoweb</strong><p>Concluir o navegador como APK independente. O darkHub coordena o plano de trabalho e acompanha o estado, mas não absorve o código nem é requisito para a navegação básica.</p><span class="meta">Próximo foco: navegação, histórico, favoritos, permissões, capacidades e empacotamento Android.</span></article><article class="row-card"><strong>Capacidades e tarefas</strong><p>O Hub pode catalogar capacidades previstas e distribuir tarefas de desenvolvimento. Uma capacidade só é executável quando existir implementação autorizada e testada.</p><button data-go-panel>Ir ao Painel de coordenação</button></article>';document.querySelector("[data-go-panel]").addEventListener("click",()=>showView("panel"));return;}
 if(id==="worddark-hub"){$("module-body").innerHTML='<article class="row-card"><strong>WordDark Hub permanece aqui dentro</strong><p>Este é um módulo interno do darkHub, não o APK WordDark e não um aplicativo independente nesta etapa.</p><p>A conexão com o futuro APK WordDark será criada por contrato versionado, autenticação, permissões e sincronização explícita.</p><span class="meta">Conexão: planejada · Nenhum vínculo remoto ativo</span></article><article class="row-card"><strong>Escopo do módulo</strong><p>Organizar solicitações, tarefas, estados operacionais e preparar os contratos de integração futura.</p><button data-module-task>Adicionar tarefa para o WordDark Hub</button></article>';document.querySelector("[data-module-task]").addEventListener("click",()=>{showView("panel");$("task-app").value="worddark-hub";$("task-title").focus();});return;}
 $("module-body").innerHTML='<article class="row-card"><strong>Módulo registrado</strong><p>As funções serão adicionadas quando este setor entrar no escopo de desenvolvimento.</p></article>';
}
function renderShadow(){
 const state=shadow.status();
 $("shadow-status").innerHTML='<div class="shadow-status-head"><span class="shadow-status-dot"></span><strong>Base local preparada</strong></div><p>Modo: '+esc(state.mode)+' · Provedor de IA: '+(state.providerConnected?'adaptador configurado':'não conectado')+'</p><div class="shadow-guardrails"><span>Rede externa: desativada</span><span>APIs pagas: desativadas</span><span>Execução automática: desativada</span><span>Aprovação humana: obrigatória</span></div>';
 $("shadow-project").innerHTML=runtime.listApps().map(app=>'<option value="'+esc(app.id)+'">'+esc(app.name)+(app.kind==="module"?" · módulo":"")+'</option>').join("");
 const requests=shadow.listRequests();
 $("shadow-requests").innerHTML=requests.length?requests.map(request=>{
  const app=runtime.getApp(request.appId);
  const actions=request.status==="pending"?'<div><button data-shadow-approve="'+esc(request.id)+'">Aprovar e criar tarefa</button><button data-shadow-reject="'+esc(request.id)+'">Recusar</button></div>':"";
  const task=request.result?.taskId?'<p class="meta">Tarefa criada na fila: '+esc(request.result.taskId)+'</p>':"";
  return '<article class="row-card"><strong>'+esc(app?.name||request.appId)+' · '+esc(request.status==="pending"?"Aguardando aprovação":request.status==="approved"?"Aprovada":"Recusada")+'</strong><p>'+esc(request.prompt)+'</p><span class="meta">'+esc(request.createdAt)+'</span>'+task+actions+'</article>';
 }).join(""):'<article class="row-card"><strong>Nenhuma solicitação</strong><p>Registre um pedido para iniciar o fluxo controlado do Shadow.</p></article>';
 document.querySelectorAll("[data-shadow-approve]").forEach(button=>button.addEventListener("click",()=>{try{shadow.approveRequest(button.dataset.shadowApprove);$("shadow-feedback").textContent="Aprovado: uma tarefa foi adicionada à fila do darkHub. Nenhum código foi executado.";renderShadow();renderPanel();renderHome();}catch(e){$("shadow-feedback").textContent=e.message;}}));
 document.querySelectorAll("[data-shadow-reject]").forEach(button=>button.addEventListener("click",()=>{try{shadow.rejectRequest(button.dataset.shadowReject);renderShadow();}catch(e){$("shadow-feedback").textContent=e.message;}}));
}
function downloadJson(name,value){
 const blob=new Blob([JSON.stringify(value,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function workspaceFeedback(message){$("workspace-feedback").textContent=message;}
function renderWorkspace({loadEditor=true,force=false}={}){
 const projectSelect=$("workspace-project"),fileSelect=$("workspace-file");
 if(!projectSelect||!fileSelect)return;
 const priorProject=projectSelect.value,priorPath=activeWorkspacePath;
 const projects=workspace.listProjects();
 projectSelect.innerHTML=projects.map(p=>'<option value="'+esc(p.appId)+'">'+esc(p.name)+' · '+p.fileCount+' arquivo(s)</option>').join("");
 if(projects.some(p=>p.appId===priorProject))projectSelect.value=priorProject;
 const appId=projectSelect.value,files=workspace.listFiles(appId);
 fileSelect.innerHTML=files.map(f=>'<option value="'+esc(f.path)+'">'+esc(f.path)+' · r'+f.revision+'</option>').join("");
 if(files.some(f=>f.path===priorPath))fileSelect.value=priorPath;
 activeWorkspacePath=fileSelect.value||"";
 const nextKey=appId+"::"+activeWorkspacePath;
 if(loadEditor&&(force||nextKey!==loadedWorkspaceKey)){const file=activeWorkspacePath?workspace.getFile(appId,activeWorkspacePath):null;$("workspace-editor").value=file?.content||"";loadedWorkspaceKey=nextKey;}
 const snapshots=workspace.listSnapshots(appId);
 $("workspace-snapshots").innerHTML=snapshots.length?snapshots.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.label)+' · '+esc(s.createdAt)+' · '+s.fileCount+' arquivo(s)</option>').join(""):'<option value="">Nenhuma versão salva</option>';
 $("workspace-save").disabled=!activeWorkspacePath;
 $("workspace-load").disabled=!activeWorkspacePath;
 $("workspace-preview").disabled=!activeWorkspacePath;
 $("workspace-restore").disabled=!snapshots.length;
}
function selectedWorkspaceFile(){
 const appId=$("workspace-project").value,path=$("workspace-file").value;
 if(!appId||!path)throw new Error("Selecione um projeto e um arquivo.");
 return {appId,path};
}
function renderCreate(){
 const apps=runtime.listApps();
 const appOptions=apps.map(a=>'<option value="'+esc(a.id)+'">'+esc(a.name)+(a.kind==="module"?" · módulo":"")+'</option>').join("");
 $("capability-app").innerHTML=appOptions;
 $("task-app").innerHTML=appOptions;$("draft-app").innerHTML=apps.map(a=>'<option value="'+esc(a.id)+'">'+esc(a.name)+(a.kind==="module"?" · módulo":"")+'</option>').join("");
 const data=runtime.exportState();
 $("draft-list").innerHTML=data.drafts.length?data.drafts.slice().reverse().map(d=>{const app=runtime.getApp(d.appId);return '<article class="row-card"><strong>'+esc(d.title)+'</strong><p>'+esc(app?.name||d.appId)+' · '+esc(d.summary)+'</p><span class="meta">'+esc(d.status)+' · '+esc(d.createdAt)+'</span><div>'+["Em revisão","Validado","Cancelado"].map(status=>'<button data-draft-status="'+esc(d.id)+'" data-status="'+status+'" '+(d.status==="Finalizado"||d.status==="Cancelado"?"disabled":"")+'>'+status+'</button>').join("")+'<button data-finalize="'+esc(d.id)+'" '+(d.status!=="Validado"?"disabled":"")+'>Finalizar versão</button></div></article>';}).join(""):'<article class="row-card"><strong>Nenhuma alteração registrada</strong><p>Crie uma tarefa de desenvolvimento para começar a organizar a próxima atualização.</p></article>';
 document.querySelectorAll("[data-draft-status]").forEach(b=>b.addEventListener("click",()=>{runtime.updateDraft(b.dataset.draftStatus,{status:b.dataset.status});renderCreate();}));
 document.querySelectorAll("[data-finalize]").forEach(b=>b.addEventListener("click",()=>{try{const release=runtime.finalizeDraft(b.dataset.finalize,{});$("draft-feedback").textContent="Versão registrada para teste: "+release.version;renderCreate();}catch(e){$("draft-feedback").textContent=e.message;}}));
}
$("workspace-project").addEventListener("change",()=>{activeWorkspacePath="";renderWorkspace();workspaceFeedback("Projeto selecionado. Crie um arquivo ou abra um existente.");});
$("workspace-file").addEventListener("change",()=>{activeWorkspacePath=$("workspace-file").value;renderWorkspace();});
$("workspace-load").addEventListener("click",()=>{try{activeWorkspacePath=$("workspace-file").value;renderWorkspace();workspaceFeedback("Arquivo aberto no editor local.");}catch(e){workspaceFeedback(e.message);}});
$("workspace-new").addEventListener("click",()=>{try{const appId=$("workspace-project").value,path=$("workspace-new-path").value;workspace.createFile(appId,path,"");activeWorkspacePath=path;$("workspace-new-path").value="";renderWorkspace();workspaceFeedback("Arquivo criado. Edite o conteúdo e salve.");$("workspace-editor").focus();}catch(e){workspaceFeedback(e.message);}});
$("workspace-save").addEventListener("click",()=>{try{const {appId,path}=selectedWorkspaceFile();workspace.saveFile(appId,path,$("workspace-editor").value);renderWorkspace({loadEditor:false});workspaceFeedback("Arquivo salvo localmente. Rev. "+workspace.getFile(appId,path).revision+".");}catch(e){workspaceFeedback(e.message);}});
$("workspace-snapshot").addEventListener("click",()=>{try{const appId=$("workspace-project").value,path=$("workspace-file").value;if(path)workspace.saveFile(appId,path,$("workspace-editor").value);const snapshot=workspace.createSnapshot(appId,"Ponto de restauração "+new Date().toLocaleString("pt-BR"));renderWorkspace({loadEditor:false});workspaceFeedback("Ponto de restauração criado com "+snapshot.fileCount+" arquivo(s).");}catch(e){workspaceFeedback(e.message);}});
$("workspace-restore").addEventListener("click",()=>{try{const id=$("workspace-snapshots").value;if(!id)throw new Error("Selecione uma versão salva.");const result=workspace.restoreSnapshot(id);activeWorkspacePath=result.files[0]?.path||"";renderWorkspace({force:true});workspaceFeedback("Versão restaurada. Revise os arquivos antes de continuar.");}catch(e){workspaceFeedback(e.message);}});
$("workspace-export").addEventListener("click",()=>{try{const appId=$("workspace-project").value,path=$("workspace-file").value;if(path)workspace.saveFile(appId,path,$("workspace-editor").value);const app=runtime.getApp(appId);downloadJson("darkhub-"+app.id+"-project.json",workspace.exportProject(appId));workspaceFeedback("Pacote de projeto exportado. Guarde o JSON para transferir os arquivos.");}catch(e){workspaceFeedback(e.message);}});
$("workspace-import").addEventListener("change",async event=>{try{const file=event.target.files?.[0];if(!file)return;if(file.size>5000000)throw new Error("O pacote excede 5 MB.");const bundle=JSON.parse(await file.text());workspace.importProject(bundle);activeWorkspacePath="";renderWorkspace();workspaceFeedback("Projeto importado. Confira os arquivos antes de continuar.");}catch(e){workspaceFeedback("Importação não concluída: "+e.message);}finally{event.target.value="";}});
$("workspace-preview").addEventListener("click",()=>{try{const {appId,path}=selectedWorkspaceFile();const file=workspace.getFile(appId,path);if(!path.toLowerCase().endsWith(".html"))throw new Error("A prévia funciona apenas com arquivos .html nesta etapa.");const html=$("workspace-editor").value;$("workspace-preview-frame").srcdoc=html;workspaceFeedback("Prévia aberta em quadro isolado. Recursos de rede e publicação não são conectados.");}catch(e){workspaceFeedback(e.message);}});
$("register-app-form").addEventListener("submit",event=>{event.preventDefault();try{const app=runtime.registerApp({id:$("register-app-id").value,name:$("register-app-name").value,kind:$("register-app-kind").value,description:$("register-app-description").value,version:$("register-app-version").value});$("register-app-feedback").textContent=app.name+" foi adicionado ao catálogo."; $("register-app-id").value="";$("register-app-name").value="";$("register-app-description").value="";renderCreate();renderWorkspace({force:true});renderHome();}catch(e){$("register-app-feedback").textContent=e.message;}});
$("draft-form").addEventListener("submit",event=>{event.preventDefault();try{runtime.createDraft({appId:$("draft-app").value,title:$("draft-title").value,summary:$("draft-summary").value});$("draft-title").value="";$("draft-summary").value="";$("draft-feedback").textContent="Alteração registrada.";renderCreate();}catch(e){$("draft-feedback").textContent=e.message;}});
$("shadow-open").addEventListener("click",()=>showView("shadow"));
$("shadow-request-form").addEventListener("submit",event=>{
 event.preventDefault();
 try{
  shadow.submitRequest({appId:$("shadow-project").value,prompt:$("shadow-prompt").value});
  $("shadow-prompt").value="";
  $("shadow-feedback").textContent="Solicitação registrada localmente. O Shadow ainda não está conectado a um modelo de IA.";
  renderShadow();
 }catch(e){$("shadow-feedback").textContent=e.message;}
});
function taskButtons(task){
 const actions={queued:[["assigned","Atribuir"],["cancelled","Cancelar"]],assigned:[["running","Iniciar"],["blocked","Bloquear"],["cancelled","Cancelar"]],running:[["done","Concluir"],["blocked","Bloquear"],["cancelled","Cancelar"]],blocked:[["queued","Reabrir"],["cancelled","Cancelar"]],done:[],cancelled:[]};
 return (actions[task.state]||[]).map(([state,label])=>'<button data-task-id="'+esc(task.id)+'" data-task-state="'+state+'">'+label+'</button>').join("");
}
function renderPanel(){
 $("panel-apps").innerHTML=runtime.listApps().map(app=>'<article class="row-card"><strong>'+esc(app.name)+'</strong><p>'+esc(app.description)+'</p><span class="meta">'+esc(app.kind==="module"?"Módulo interno":"APK independente")+' · v'+esc(app.version)+' · '+esc(app.status)+'</span><span class="meta">Estado operacional: somente leitura</span></article>').join("");

 const ops=orchestrator.dashboard();
 $("orchestrator-metrics").innerHTML='<div class="overview-card"><strong>'+ops.capabilities+'</strong><small>Capacidades catalogadas</small></div><div class="overview-card"><strong>'+ops.enabledCapabilities+'</strong><small>Capacidades habilitadas</small></div><div class="overview-card"><strong>'+ops.queuedTasks+'</strong><small>Tarefas abertas</small></div><div class="overview-card"><strong>'+ops.unreadMessages+'</strong><small>Eventos não lidos</small></div>';
 $("capability-app").innerHTML=runtime.listApps().map(app=>'<option value="'+esc(app.id)+'">'+esc(app.name)+(app.kind==="module"?" · módulo":"")+'</option>').join("");
 const capabilities=orchestrator.listCapabilities();
 $("capability-list").innerHTML=capabilities.length?capabilities.map(cap=>'<article class="row-card"><strong>'+esc(cap.name)+'</strong><p>'+esc(cap.fullId)+' · '+esc(cap.description)+'</p><span class="meta">Permissão: '+esc(cap.permission)+' · Estado: '+esc(cap.status)+' · v'+esc(cap.version)+'</span><div><button data-cap-enable="'+esc(cap.fullId)+'" '+(cap.status==="enabled"||(cap.permission!=="local-only"&&cap.permission!=="approved")?"disabled":"")+'>Habilitar</button><button data-cap-disable="'+esc(cap.fullId)+'" '+(cap.status==="disabled"?"disabled":"")+'>Desabilitar</button></div></article>').join(""):'<article class="row-card"><strong>Nenhuma capacidade catalogada</strong><p>Registre uma capacidade para documentar o que um app oferece. O registro não executa a função por si só.</p></article>';
 document.querySelectorAll("[data-cap-enable]").forEach(button=>button.addEventListener("click",()=>{try{orchestrator.setCapabilityStatus(button.dataset.capEnable,"enabled");$("capability-feedback").textContent="Capacidade habilitada no catálogo.";renderPanel();}catch(e){$("capability-feedback").textContent=e.message;}}));
 document.querySelectorAll("[data-cap-disable]").forEach(button=>button.addEventListener("click",()=>{try{orchestrator.setCapabilityStatus(button.dataset.capDisable,"disabled");renderPanel();}catch(e){$("capability-feedback").textContent=e.message;}}));
 $("task-app").innerHTML=runtime.listApps().map(app=>'<option value="'+esc(app.id)+'">'+esc(app.name)+(app.kind==="module"?" · módulo":"")+'</option>').join("");
 const tasks=orchestrator.listTasks();
 $("task-queue").innerHTML=tasks.length?tasks.map(task=>{const app=runtime.getApp(task.appId);return '<article class="row-card"><strong>'+esc(task.title)+'</strong><p>'+esc(app?.name||task.appId)+' · '+esc(task.description)+'</p><span class="meta">Estado: '+esc(task.state)+' · Prioridade: '+esc(task.priority)+' · '+esc(task.createdAt)+'</span>'+(task.result?'<p>'+esc(task.result)+'</p>':"")+'<div>'+taskButtons(task)+'</div></article>';}).join(""):'<article class="row-card"><strong>Fila vazia</strong><p>As tarefas registradas aqui organizam o trabalho; não executam código externo automaticamente.</p></article>';
 document.querySelectorAll("[data-task-id]").forEach(button=>button.addEventListener("click",()=>{try{const details=button.dataset.taskState==="blocked"?{reason:"Aguardando revisão manual."}:{};orchestrator.transitionTask(button.dataset.taskId,button.dataset.taskState,details);renderPanel();}catch(e){$("task-feedback").textContent=e.message;}}));
 $("connections").innerHTML='<article class="row-card"><strong>WordDark APK</strong><p>Conexão futura entre o módulo WordDark Hub do darkHub e o aplicativo WordDark independente.</p><span class="meta">Planejada · contrato ainda não conectado</span></article><article class="row-card"><strong>Shadoweb</strong><p>Integração opcional futura; o navegador mantém funcionamento independente.</p><span class="meta">Planejada · sem dependência de rede</span></article><article class="row-card"><strong>Política padrão</strong><p>'+esc(ops.policy?.description||"Negar capacidades por padrão.")+'</p><span class="meta">Controles locais; não substituem autenticação de servidor.</span></article>';
}
$("capability-form").addEventListener("submit",event=>{event.preventDefault();try{orchestrator.registerCapability({appId:$("capability-app").value,id:$("capability-id").value,name:$("capability-name").value,description:$("capability-description").value,permission:$("capability-permission").value});$("capability-feedback").textContent="Capacidade registrada. O catálogo descreve a função; não significa que exista um executor ativo."; $("capability-id").value="";$("capability-name").value="";$("capability-description").value="";renderPanel();renderHome();}catch(e){$("capability-feedback").textContent=e.message;}});
$("task-form").addEventListener("submit",event=>{event.preventDefault();try{orchestrator.createTask({appId:$("task-app").value,title:$("task-title").value,description:$("task-description").value,priority:$("task-priority").value});$("task-title").value="";$("task-description").value="";$("task-feedback").textContent="Tarefa adicionada à fila do darkHub.";renderPanel();}catch(e){$("task-feedback").textContent=e.message;}});
$("export-backup").addEventListener("click",()=>{const bundle={darkHub:runtime.exportState(),orchestrator:orchestrator.exportState()};const blob=new Blob([JSON.stringify(bundle,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="darkhub-ecosystem-backup.json";a.click();URL.revokeObjectURL(url);$("backup-feedback").textContent="Backup local do catálogo e do motor de coordenação exportado.";});
const menuDrawer=$("menu-drawer"),menuScrim=$("menu-scrim"),appsDrawer=$("apps-drawer"),drawerScrim=$("drawer-scrim"),alertPanel=$("alert-panel");
function closeMenu(){menuDrawer.hidden=true;menuScrim.hidden=true;$("menu-open").setAttribute("aria-expanded","false");}
function closeApps(){appsDrawer.hidden=true;drawerScrim.hidden=true;appsDrawer.setAttribute("aria-hidden","true");$("apps-open").setAttribute("aria-expanded","false");}
$("menu-open").addEventListener("click",()=>{const opening=menuDrawer.hidden;menuDrawer.hidden=!opening;menuScrim.hidden=!opening;$("menu-open").setAttribute("aria-expanded",String(opening));});
$("menu-close").addEventListener("click",closeMenu);menuScrim.addEventListener("click",closeMenu);
document.querySelectorAll("[data-menu-view]").forEach(b=>b.addEventListener("click",()=>{closeMenu();showView(b.dataset.menuView);}));
$("widgets-open").addEventListener("click",()=>{$("widgets-panel").hidden=!$("widgets-panel").hidden;});
$("apps-open").addEventListener("click",()=>{const opening=appsDrawer.hidden;appsDrawer.hidden=!opening;drawerScrim.hidden=!opening;appsDrawer.setAttribute("aria-hidden",String(!opening));$("apps-open").setAttribute("aria-expanded",String(opening));if(opening)renderHome();});
$("apps-close").addEventListener("click",closeApps);drawerScrim.addEventListener("click",closeApps);
$("worddark-open").addEventListener("click",()=>{closeApps();openApp("worddark-hub");});
$("hub-search").addEventListener("submit",event=>{event.preventDefault();const q=$("hub-search-input").value.trim().toLowerCase();if(!q){$("search-feedback").hidden=false;$("search-feedback").textContent="Digite o nome de um aplicativo para buscar.";return;}const found=runtime.listApps().find(a=>(a.name+" "+a.id).toLowerCase().includes(q));if(found){$("search-feedback").hidden=true;openApp(found.id);}else{$("search-feedback").hidden=false;$("search-feedback").textContent="Nenhum aplicativo encontrado com esse nome.";}});
$("alerts").addEventListener("click",()=>{const ops=orchestrator.dashboard(),drafts=runtime.exportState().drafts.filter(d=>d.status!=="Finalizado"&&d.status!=="Cancelado").length;const open=alertPanel.hidden;alertPanel.hidden=!open;$("alerts").setAttribute("aria-expanded",String(open));$("alert-list").innerHTML='<article class="row-card"><strong>'+ops.unreadMessages+' evento(s) não lido(s)</strong><p>'+ops.queuedTasks+' tarefa(s) em aberto e '+drafts+' alteração(ões) em aberto.</p><button id="alert-go-panel">Abrir Painel</button></article>';const go=$("alert-go-panel");if(go)go.addEventListener("click",()=>{alertPanel.hidden=true;showView("panel");});});
$("alert-close").addEventListener("click",()=>{alertPanel.hidden=true;$("alerts").setAttribute("aria-expanded","false");});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeMenu();closeApps();alertPanel.hidden=true;}});
window.addEventListener("darkhub:runtime-change",()=>{if(!$("home").hidden)renderHome();});
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
renderHome();
renderWorkspace();
