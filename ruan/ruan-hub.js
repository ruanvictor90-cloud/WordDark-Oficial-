(()=>{"use strict";
const $=id=>document.getElementById(id);
const appsButton=$("apps-open"),drawer=$("apps-drawer"),scrim=$("drawer-scrim"),alertButton=$("alert-toggle"),alertPanel=$("alert-panel");
const searchForm=$("hub-search"),searchInput=$("hub-search-input"),searchFeedback=$("search-feedback");
const greeting=$("greeting");
function updateGreeting(){const hour=new Date().getHours();const salutation=hour>=5&&hour<12?"Bom dia":hour>=12&&hour<18?"Boa tarde":"Boa noite";greeting.textContent=`${salutation}, que bom ter vc por aqui`}
updateGreeting();
function setDrawer(open){drawer.hidden=!open;scrim.hidden=!open;drawer.setAttribute("aria-hidden",String(!open));appsButton.setAttribute("aria-expanded",String(open));if(open){alertPanel.hidden=true;alertButton.setAttribute("aria-expanded","false")}}
function setAlerts(open){alertPanel.hidden=!open;alertButton.setAttribute("aria-expanded",String(open));if(open){setDrawer(false)}}
appsButton.addEventListener("click",()=>setDrawer(drawer.hidden));
$("apps-close").addEventListener("click",()=>setDrawer(false));
scrim.addEventListener("click",()=>setDrawer(false));
alertButton.addEventListener("click",()=>setAlerts(alertPanel.hidden));
searchForm.addEventListener("submit",event=>{
 event.preventDefault();
 const query=searchInput.value.trim().toLocaleLowerCase("pt-BR");
 if(!query){searchFeedback.hidden=false;searchFeedback.textContent="Digite o que você procura.";searchInput.focus();return}
 if(query.includes("worddark")){
  window.location.href=document.querySelector(".world-action").href;
  return;
 }
 if(/^(apps?|aplicativos?|meus aplicativos|abrir apps)$/.test(query)){
  searchFeedback.hidden=true;setDrawer(true);return;
 }
 searchFeedback.hidden=false;
 searchFeedback.textContent="Ainda não encontrei esse destino. Vou abrir seus aplicativos para você conferir.";
 setDrawer(true);
});
$("alert-close").addEventListener("click",()=>setAlerts(false));
document.addEventListener("keydown",event=>{if(event.key==="Escape"){setDrawer(false);setAlerts(false)}});
if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
})();
