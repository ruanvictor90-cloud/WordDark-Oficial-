(()=>{"use strict";
const $=id=>document.getElementById(id);
const toggle=$("alert-toggle"),panel=$("alert-panel"),close=$("alert-close");
const menuOpen=$("menu-open"),menuClose=$("menu-close"),side=$("side-drawer"),sideScrim=$("side-scrim");
const appsOpen=$("apps-open"),appsClose=$("apps-close"),appsDrawer=$("apps-drawer"),drawerScrim=$("drawer-scrim");
const widgetsOpen=$("side-widgets-open"),widgetCategory=$("widget-category");
const search=$("hub-search"),input=$("hub-search-input"),feedback=$("search-feedback");
function show(el,visible){if(!el)return;el.hidden=!visible;el.setAttribute("aria-hidden",String(!visible))}
function closeSide(){show(side,false);show(sideScrim,false);menuOpen?.setAttribute("aria-expanded","false")}
function openSide(){show(side,true);show(sideScrim,true);menuOpen?.setAttribute("aria-expanded","true")}
function closeApps(){show(appsDrawer,false);show(drawerScrim,false);appsOpen?.setAttribute("aria-expanded","false")}
function openApps(){show(appsDrawer,true);show(drawerScrim,true);appsOpen?.setAttribute("aria-expanded","true")}
function closeAlerts(){show(panel,false);toggle?.setAttribute("aria-expanded","false")}
function openAlerts(){show(panel,true);toggle?.setAttribute("aria-expanded","true")}
menuOpen?.addEventListener("click",openSide);menuClose?.addEventListener("click",closeSide);sideScrim?.addEventListener("click",closeSide);
appsOpen?.addEventListener("click",openApps);appsClose?.addEventListener("click",closeApps);drawerScrim?.addEventListener("click",closeApps);
toggle?.addEventListener("click",()=>panel?.hidden?openAlerts():closeAlerts());close?.addEventListener("click",closeAlerts);
$("side-home")?.addEventListener("click",()=>{closeSide();window.location.href="./index.html"});
widgetsOpen?.addEventListener("click",()=>{const opening=widgetCategory?.hidden;show(widgetCategory,opening);widgetsOpen.setAttribute("aria-expanded",String(opening))});
search?.addEventListener("submit",event=>{event.preventDefault();const q=(input?.value||"").trim().toLocaleLowerCase("pt-BR");const msg=$("search-feedback");if(!q){msg.textContent="Digite o que deseja encontrar.";msg.hidden=false;return}if(/central/.test(q)){window.location.href="./central.html";return}if(/teste|testar/.test(q)){window.location.href="../worddark/app/index.html?area=test&fromHub=1";return}msg.textContent="Nenhum destino encontrado para essa busca.";msg.hidden=false});
document.addEventListener("keydown",event=>{if(event.key==="Escape"){closeSide();closeApps();closeAlerts()}});
const greeting=$("greeting");if(greeting){const hour=new Date().getHours();greeting.textContent=hour<12?"Bom dia, bem-vindo ao WordDark Hub":hour<18?"Boa tarde, bem-vindo ao WordDark Hub":"Boa noite, bem-vindo ao WordDark Hub"}
const list=$("alert-list");if(list)list.innerHTML='<p class="empty-state">Nenhum alerta por enquanto.</p>';
})();