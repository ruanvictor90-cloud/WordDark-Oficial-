(()=>{"use strict";
const $=id=>document.getElementById(id);
const appsButton=$("apps-open"),drawer=$("apps-drawer"),scrim=$("drawer-scrim"),alertButton=$("alert-toggle"),alertPanel=$("alert-panel");
const menuButton=$("menu-open"),sideDrawer=$("side-drawer"),sideScrim=$("side-scrim");
const searchForm=$("hub-search"),searchInput=$("hub-search-input"),searchFeedback=$("search-feedback");
const greeting=$("greeting"),homeWidgets=$("home-widgets");
const homeView=$("home-view"),subpageView=$("subpage-view"),backRow=$("page-back-row"),subpageTitle=$("subpage-title"),subpageDescription=$("subpage-description"),creationOptions=$("creation-options"),subpageEmpty=$("subpage-empty"),emptyTitle=$("subpage-empty-title"),emptyText=$("subpage-empty-text");
function showView(view){
 const isHome=view==="home";homeView.hidden=!isHome;subpageView.hidden=isHome;backRow.hidden=isHome;
 if(isHome){subpageTitle.textContent="";setSideMenu(false);window.scrollTo({top:0,behavior:"smooth"});return;}
 creationOptions.hidden=!(view==="creation");subpageEmpty.hidden=view==="creation";
 const details={creation:["Criação","Escolha uma etapa para criar seus aplicativos."],panel:["Painel","Área central do darkHub. Esta estrutura será desenvolvida depois."],development:["Desenvolvimento","Área preparada para iniciar a criação dos aplicativos."],finalization:["Finalização","Área preparada para revisar e fechar os aplicativos." ]};
 const info=details[view]||details.panel;subpageTitle.textContent=info[0];subpageDescription.textContent=info[1];
 if(view==="development"){emptyTitle.textContent="Desenvolvimento preparado";emptyText.textContent="Este espaço será usado para criar os aplicativos. Nenhuma ferramenta extra foi adicionada por enquanto.";}
 else if(view==="finalization"){emptyTitle.textContent="Finalização preparada";emptyText.textContent="Este espaço será usado para revisar, fechar e preparar cada aplicativo como produto final.";}
 else if(view==="panel"){emptyTitle.textContent="Painel preparado";emptyText.textContent="A estrutura está pronta. Os controles serão adicionados conforme o darkHub ganhar funções reais.";}
 setSideMenu(false);window.scrollTo({top:0,behavior:"smooth"});
}
$("shortcut-creation").addEventListener("click",()=>showView("creation"));
$("shortcut-panel").addEventListener("click",()=>showView("panel"));
$("shortcut-development").addEventListener("click",()=>showView("development"));
$("shortcut-finalization").addEventListener("click",()=>showView("finalization"));
$("page-back").addEventListener("click",()=>showView("home"));
function updateGreeting(){const hour=new Date().getHours();const salutation=hour>=5&&hour<12?"Bom dia":hour>=12&&hour<18?"Boa tarde":"Boa noite";greeting.textContent=`${salutation}, que bom ter vc por aqui`}
updateGreeting();

/* A categoria Widgets fica preparada, mas vazia até existirem aplicativos reais. */
const widgetCategory=$("widget-category"),widgetsOpen=$("side-widgets-open");
function setWidgetCategory(open){widgetCategory.hidden=!open;widgetsOpen.setAttribute("aria-expanded",String(open));}
function setSideMenu(open){sideDrawer.hidden=!open;sideScrim.hidden=!open;sideDrawer.setAttribute("aria-hidden",String(!open));menuButton.setAttribute("aria-expanded",String(open));if(open){setDrawer(false);setAlerts(false)}}
widgetsOpen.addEventListener("click",()=>setWidgetCategory(widgetCategory.hidden));
function setDrawer(open){drawer.hidden=!open;scrim.hidden=!open;drawer.setAttribute("aria-hidden",String(!open));appsButton.setAttribute("aria-expanded",String(open));if(open){alertPanel.hidden=true;alertButton.setAttribute("aria-expanded","false")}}
function setAlerts(open){alertPanel.hidden=!open;alertButton.setAttribute("aria-expanded",String(open));if(open){setDrawer(false)}}
menuButton.addEventListener("click",()=>setSideMenu(sideDrawer.hidden));
$("menu-close").addEventListener("click",()=>setSideMenu(false));
sideScrim.addEventListener("click",()=>setSideMenu(false));
$("side-home").addEventListener("click",()=>showView("home"));
appsButton.addEventListener("click",()=>setDrawer(drawer.hidden));
$("apps-close").addEventListener("click",()=>setDrawer(false));
scrim.addEventListener("click",()=>setDrawer(false));
alertButton.addEventListener("click",()=>setAlerts(alertPanel.hidden));
searchForm.addEventListener("submit",event=>{
 event.preventDefault();
 const query=searchInput.value.trim().toLocaleLowerCase("pt-BR");
 if(!query){searchFeedback.hidden=false;searchFeedback.textContent="Digite o que você procura.";searchInput.focus();return}
 if(query.includes("worddark")){window.location.href=document.querySelector(".world-action").href;return}
 if(/^(cria[cç][aã]o|criar)$/.test(query)){searchFeedback.hidden=true;showView("creation");return}
 if(/^(painel)$/.test(query)){searchFeedback.hidden=true;showView("panel");return}
 if(/^(desenvolvimento)$/.test(query)){searchFeedback.hidden=true;showView("development");return}
 if(/^(finaliza[cç][aã]o|finalizar)$/.test(query)){searchFeedback.hidden=true;showView("finalization");return}
 if(/^(widgets?|widget|personalizar)$/.test(query)){searchFeedback.hidden=true;setSideMenu(true);setWidgetCategory(true);return}
 if(/^(apps?|aplicativos?|meus aplicativos|abrir apps)$/.test(query)){searchFeedback.hidden=true;setDrawer(true);return}
 searchFeedback.hidden=false;searchFeedback.textContent="Ainda não há aplicativos instalados para abrir.";
});
$("alert-close").addEventListener("click",()=>setAlerts(false));
document.addEventListener("keydown",event=>{if(event.key==="Escape"){setDrawer(false);setAlerts(false);setSideMenu(false)}});
setWidgetCategory(false);
if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
})();