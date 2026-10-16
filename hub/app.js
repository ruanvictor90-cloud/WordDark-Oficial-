import { createDarkHubEngine } from "./engine/darkhub-engine.js";

(()=>{"use strict";
const $=id=>document.getElementById(id);
const engine=createDarkHubEngine();
const appsButton=$("apps-open"),drawer=$("apps-drawer"),scrim=$("drawer-scrim"),alertButton=$("alert-toggle"),alertPanel=$("alert-panel");
const menuButton=$("menu-open"),sideDrawer=$("side-drawer"),sideScrim=$("side-scrim");
const searchForm=$("hub-search"),searchInput=$("hub-search-input"),searchFeedback=$("search-feedback");
const greeting=$("greeting");
const homeView=$("home-view"),subpageView=$("subpage-view"),backRow=$("page-back-row"),subpageTitle=$("subpage-title"),subpageDescription=$("subpage-description"),creationOptions=$("creation-options"),subpageEmpty=$("subpage-empty"),emptyTitle=$("subpage-empty-title"),emptyText=$("subpage-empty-text");
const developmentWorkspace=$("development-workspace"),projectGrid=$("project-grid"),projectForm=$("project-create-form"),projectFeedback=$("project-feedback");
let currentView="home";const viewHistory=["home"];

function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function initials(name){return String(name||"DH").trim().split(/\s+/).slice(0,2).map(part=>part[0]||"").join("").toUpperCase();}
function showProjectFeedback(message,isError=false){projectFeedback.hidden=false;projectFeedback.textContent=message;projectFeedback.dataset.state=isError?"error":"success";}
function renderProjects(){
 const projects=engine.listProjects();
 if(!projects.length){projectGrid.innerHTML='<p class="project-empty">Nenhum projeto registrado ainda.</p>';return;}
 projectGrid.innerHTML=projects.map(project=>{
  const logo=project.logo?'<img class="project-logo-img" src="'+escapeHtml(project.logo)+'" alt="" loading="lazy">':"";
  const statuses=engine.statuses.map(status=>'<option value="'+escapeHtml(status)+'"'+(project.status===status?" selected":"")+'>'+escapeHtml(status)+'</option>').join("");
  return '<article class="project-card" data-project-id="'+escapeHtml(project.id)+'">'+
   '<a class="project-open" href="'+escapeHtml(project.href)+'" aria-label="Abrir projeto '+escapeHtml(project.name)+'">'+
    '<span class="project-logo-wrap">'+logo+'<span class="project-logo-fallback"'+(project.logo?' hidden':'')+'>'+escapeHtml(initials(project.name))+'</span></span>'+
    '<span class="project-main"><strong>'+escapeHtml(project.name)+'</strong><small>'+escapeHtml(project.description||"Projeto registrado no darkHub.")+'</small></span><span class="project-open-mark" aria-hidden="true">↗</span></a>'+
   '<div class="project-card-controls"><label>Status<select class="project-status" aria-label="Status de '+escapeHtml(project.name)+'">'+statuses+'</select></label>'+
   (project.protected?'':'<button class="project-delete" type="button" data-delete-project="'+escapeHtml(project.id)+'" aria-label="Excluir projeto '+escapeHtml(project.name)+'">Excluir</button>')+
   '</div></article>';
 }).join("");
 projectGrid.querySelectorAll(".project-logo-img").forEach(img=>img.addEventListener("error",()=>{img.hidden=true;const fallback=img.parentElement.querySelector(".project-logo-fallback");if(fallback)fallback.hidden=false;}));
 projectGrid.querySelectorAll(".project-status").forEach(select=>select.addEventListener("change",()=>{
  const id=select.closest("[data-project-id]").dataset.projectId;
  try{engine.updateProject(id,{status:select.value});showProjectFeedback("Status do projeto atualizado.");renderProjects();}
  catch(error){showProjectFeedback(error.message||"Não foi possível atualizar o projeto.",true);}
 }));
 projectGrid.querySelectorAll("[data-delete-project]").forEach(button=>button.addEventListener("click",()=>{
  const id=button.dataset.deleteProject;
  try{engine.deleteProject(id);showProjectFeedback("Projeto removido do registro.");renderProjects();}
  catch(error){showProjectFeedback(error.message||"Não foi possível remover o projeto.",true);}
 }));
}
function showView(view,goBack=false){
 if(!goBack&&view===currentView)return;
 if(goBack){if(viewHistory.length>1)viewHistory.pop();view=viewHistory[viewHistory.length-1]||"home";}
 else{viewHistory.push(view);}
 currentView=view;
 const isHome=view==="home";homeView.hidden=!isHome;subpageView.hidden=isHome;backRow.hidden=isHome;
 if(isHome){subpageTitle.textContent="";setSideMenu(false);window.scrollTo({top:0,behavior:"smooth"});return;}
 creationOptions.hidden=view!=="creation";
 developmentWorkspace.hidden=view!=="development";
 subpageEmpty.hidden=view==="creation"||view==="development";
 const details={creation:["Criação","Escolha uma etapa para continuar."],panel:["Painel","Área central do darkHub."],development:["Desenvolvimento","Projetos e ferramentas de desenvolvimento."],finalization:["Finalização","Revisar e preparar uma criação para o pacote final."]};
 const info=details[view]||details.panel;subpageTitle.textContent=info[0];subpageDescription.textContent=info[1];
 if(view==="finalization"){emptyTitle.textContent="Finalização preparada";emptyText.textContent="A área de finalização será conectada ao processo de validação e empacotamento depois que a base estiver consolidada.";}
 else if(view==="panel"){emptyTitle.textContent="Painel preparado";emptyText.textContent="O motor central está ativo. Os widgets reais serão conectados quando houver fontes de dados definidas.";}
 if(view==="development")renderProjects();
 setSideMenu(false);window.scrollTo({top:0,behavior:"smooth"});
}
$("shortcut-creation").addEventListener("click",()=>showView("creation"));
$("shortcut-panel").addEventListener("click",()=>showView("panel"));
$("shortcut-development").addEventListener("click",()=>showView("development"));
$("shortcut-finalization").addEventListener("click",()=>showView("finalization"));
$("page-back").addEventListener("click",()=>showView(currentView,true));
function updateGreeting(){const hour=new Date().getHours();const salutation=hour>=5&&hour<12?"Bom dia":hour>=12&&hour<18?"Boa tarde":"Boa noite";greeting.textContent=`${salutation}, que bom ter vc por aqui`;}
updateGreeting();

const widgetCategory=$("widget-category"),widgetsOpen=$("side-widgets-open");
function setWidgetCategory(open){widgetCategory.hidden=!open;widgetsOpen.setAttribute("aria-expanded",String(open));}
function setSideMenu(open){sideDrawer.hidden=!open;sideScrim.hidden=!open;sideDrawer.setAttribute("aria-hidden",String(!open));menuButton.setAttribute("aria-expanded",String(open));if(open){setDrawer(false);setAlerts(false);}}
widgetsOpen.addEventListener("click",()=>setWidgetCategory(widgetCategory.hidden));
function setDrawer(open){drawer.hidden=!open;scrim.hidden=!open;drawer.setAttribute("aria-hidden",String(!open));appsButton.setAttribute("aria-expanded",String(open));if(open){alertPanel.hidden=true;alertButton.setAttribute("aria-expanded","false");}}
function setAlerts(open){alertPanel.hidden=!open;alertButton.setAttribute("aria-expanded",String(open));if(open)setDrawer(false);}
menuButton.addEventListener("click",()=>setSideMenu(sideDrawer.hidden));
$("menu-close").addEventListener("click",()=>setSideMenu(false));
sideScrim.addEventListener("click",()=>setSideMenu(false));
$("side-home").addEventListener("click",()=>showView("home"));
appsButton.addEventListener("click",()=>setDrawer(drawer.hidden));
$("apps-close").addEventListener("click",()=>setDrawer(false));
scrim.addEventListener("click",()=>setDrawer(false));
alertButton.addEventListener("click",()=>setAlerts(alertPanel.hidden));

searchForm.addEventListener("submit",event=>{
 event.preventDefault();const query=searchInput.value.trim().toLocaleLowerCase("pt-BR");
 if(!query){searchFeedback.hidden=false;searchFeedback.textContent="Digite o que você procura.";searchInput.focus();return;}
 if(query.includes("darkhub")){window.location.href=document.querySelector(".world-action").href;return;}
 if(/^(cria[cç][aã]o|criar|painel|desenvolvimento|projetos?|finaliza[cç][aã]o|finalizar)$/.test(query)){searchFeedback.hidden=false;searchFeedback.textContent="As áreas próprias do WordDark Hub serão estruturadas em uma etapa futura.";return;}
 
 
 
 if(/^(widgets?|widget|personalizar)$/.test(query)){searchFeedback.hidden=true;setSideMenu(true);setWidgetCategory(true);return;}
 if(/^(apps?|aplicativos?|meus aplicativos|abrir apps)$/.test(query)){searchFeedback.hidden=true;setDrawer(true);return;}
 const project=engine.listProjects().find(item=>item.name.toLocaleLowerCase("pt-BR")===query||item.id===query);
 if(project){window.location.href=project.href;return;}
 searchFeedback.hidden=false;searchFeedback.textContent="Não encontrei esse destino no registro de projetos.";
});
projectForm.addEventListener("submit",event=>{
 event.preventDefault();const data=new FormData(projectForm);
 try{
  const project=engine.createProject({name:data.get("name"),href:data.get("href"),logo:data.get("logo"),description:data.get("description"),status:data.get("status")});
  projectForm.reset();showProjectFeedback("Projeto “"+project.name+"” registrado.");renderProjects();
 }catch(error){showProjectFeedback(error.message||"Não foi possível registrar o projeto.",true);}
});
$("projects-export").addEventListener("click",()=>{
 try{
  const blob=new Blob([JSON.stringify(engine.exportProjects(),null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="darkhub-projetos.json";link.click();URL.revokeObjectURL(url);
  showProjectFeedback("Registro de projetos exportado.");
 }catch(error){showProjectFeedback(error.message||"Falha ao exportar projetos.",true);}
});
const importTrigger=$("projects-import-trigger"),importFile=$("projects-import-file");
importTrigger.addEventListener("click",()=>importFile.click());
importFile.addEventListener("change",()=>{
 const file=importFile.files&&importFile.files[0];if(!file)return;
 const reader=new FileReader();
 reader.onload=()=>{
  try{const payload=JSON.parse(String(reader.result||""));engine.importProjects(payload);renderProjects();showProjectFeedback("Registro de projetos importado.");}
  catch(error){showProjectFeedback(error.message||"Arquivo de projetos inválido.",true);}
  importFile.value="";
 };
 reader.onerror=()=>{showProjectFeedback("Não foi possível ler esse arquivo.",true);importFile.value="";};
 reader.readAsText(file);
});
window.addEventListener("darkhub:projects-changed",()=>{if(currentView==="development")renderProjects();});
$("alert-close").addEventListener("click",()=>setAlerts(false));
document.addEventListener("keydown",event=>{if(event.key==="Escape"){setDrawer(false);setAlerts(false);setSideMenu(false);}});
setWidgetCategory(false);
if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
})();
// O botão oficial fica preparado visualmente, sem conexão nesta etapa.

