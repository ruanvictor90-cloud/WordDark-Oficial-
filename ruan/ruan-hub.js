(()=>{"use strict";
const $=id=>document.getElementById(id);
const appsButton=$("apps-open"),drawer=$("apps-drawer"),scrim=$("drawer-scrim"),alertButton=$("alert-toggle"),alertPanel=$("alert-panel");
const menuButton=$("menu-open"),sideDrawer=$("side-drawer"),sideScrim=$("side-scrim");
const searchForm=$("hub-search"),searchInput=$("hub-search-input"),searchFeedback=$("search-feedback");
const greeting=$("greeting"),homeWidgets=$("home-widgets"),widgetSettings=$("widget-settings"),widgetCount=$("widget-count");
function updateGreeting(){const hour=new Date().getHours();const salutation=hour>=5&&hour<12?"Bom dia":hour>=12&&hour<18?"Boa tarde":"Boa noite";greeting.textContent=`${salutation}, que bom ter vc por aqui`}
updateGreeting();

/* Cada widget é um módulo independente. A seleção e o tamanho ficam salvos neste aparelho. */
const widgetCatalog=[
 {id:"agenda",app:"Agenda",icon:"◷",size:"medium",title:"Agenda",summary:"Sua organização em um só lugar",value:"Tudo livre por enquanto",detail:"Quando houver compromissos, eles aparecerão aqui."},
 {id:"cofre",app:"Cofre",icon:"◇",size:"small",title:"Cofre",summary:"Visão rápida das finanças",value:"R$ 0,00",detail:"Resumo demonstrativo; ainda sem conta conectada."},
 {id:"tarefas",app:"Tarefas",icon:"✓",size:"small",title:"Tarefas",summary:"O que precisa da sua atenção",value:"0 pendentes",detail:"Suas tarefas poderão aparecer neste espaço."},
 {id:"projetos",app:"Projetos",icon:"▦",size:"medium",title:"Projetos",summary:"Acompanhe suas criações",value:"Espaço pronto",detail:"Os projetos serão conectados aqui futuramente."},
 {id:"biblioteca",app:"Biblioteca",icon:"▤",size:"small",title:"Biblioteca",summary:"Acesso rápido aos seus itens",value:"Nenhum item",detail:"Livros, contas e dispositivos poderão ser organizados aqui."},
 {id:"rotinas",app:"Rotinas",icon:"⟳",size:"large",title:"Rotinas",summary:"Hábitos e lembretes",value:"Monte sua rotina",detail:"Este widget poderá mostrar rotinas, lembretes e progresso diário."}
];
const storageKey="darkhub.widget-layout.v1";
function readLayout(){
 try{const saved=JSON.parse(localStorage.getItem(storageKey)||"{}");return Object.fromEntries(widgetCatalog.map(w=>[w.id,{enabled:saved[w.id]?.enabled??(w.id==="agenda"||w.id==="tarefas"),size:["small","medium","large"].includes(saved[w.id]?.size)?saved[w.id].size:w.size}]))}
 catch{return Object.fromEntries(widgetCatalog.map(w=>[w.id,{enabled:w.id==="agenda"||w.id==="tarefas",size:w.size}]))}
}
let layout=readLayout();
function saveLayout(){try{localStorage.setItem(storageKey,JSON.stringify(layout))}catch{}}
function renderWidgets(){
 const active=widgetCatalog.filter(w=>layout[w.id].enabled);
 homeWidgets.innerHTML="";
 widgetCount.textContent=`${active.length} ativo${active.length===1?"":"s"}`;
 if(!active.length){homeWidgets.innerHTML='<div class="widgets-empty"><span>＋</span><strong>Sua tela, do seu jeito</strong><p>Abra o menu ☰ e escolha os widgets que quer ver aqui.</p></div>';return}
 active.forEach(w=>{
  const card=document.createElement("article");card.className=`home-widget widget-${layout[w.id].size}`;card.dataset.widget=w.id;
  card.innerHTML=`<div class="home-widget-top"><span class="home-widget-icon" aria-hidden="true">${w.icon}</span><span class="home-widget-app">${w.app}</span><button class="widget-more" type="button" aria-label="Configurar widget ${w.title}" title="Configurar tamanho">•••</button></div><h2>${w.title}</h2><p class="home-widget-summary">${w.summary}</p><strong class="home-widget-value">${w.value}</strong><p class="home-widget-detail">${w.detail}</p>`;
  card.querySelector(".widget-more").addEventListener("click",()=>{setSideMenu(true);const control=$(`widget-size-${w.id}`);if(control)control.focus()});
  homeWidgets.appendChild(card);
 });
}
function renderSettings(){
 widgetSettings.innerHTML="";
 widgetCatalog.forEach(w=>{
  const row=document.createElement("div");row.className="widget-setting";
  row.innerHTML=`<label class="widget-setting-toggle" for="widget-enabled-${w.id}"><span class="widget-setting-icon" aria-hidden="true">${w.icon}</span><span class="widget-setting-name"><strong>${w.title}</strong><small>${w.app}</small></span><input id="widget-enabled-${w.id}" type="checkbox" ${layout[w.id].enabled?"checked":""}></label><label class="widget-size-label" for="widget-size-${w.id}">Tamanho<select id="widget-size-${w.id}"><option value="small" ${layout[w.id].size==="small"?"selected":""}>Pequeno</option><option value="medium" ${layout[w.id].size==="medium"?"selected":""}>Médio</option><option value="large" ${layout[w.id].size==="large"?"selected":""}>Grande</option></select></label>`;
  const checkbox=row.querySelector("input[type=checkbox]"),select=row.querySelector("select");
  checkbox.addEventListener("change",()=>{layout[w.id].enabled=checkbox.checked;saveLayout();renderWidgets();renderSettings()});
  select.addEventListener("change",()=>{layout[w.id].size=select.value;saveLayout();renderWidgets()});
  widgetSettings.appendChild(row);
 });
}
function setSideMenu(open){sideDrawer.hidden=!open;sideScrim.hidden=!open;sideDrawer.setAttribute("aria-hidden",String(!open));menuButton.setAttribute("aria-expanded",String(open));if(open){setDrawer(false);setAlerts(false)}}
function setDrawer(open){drawer.hidden=!open;scrim.hidden=!open;drawer.setAttribute("aria-hidden",String(!open));appsButton.setAttribute("aria-expanded",String(open));if(open){alertPanel.hidden=true;alertButton.setAttribute("aria-expanded","false")}}
function setAlerts(open){alertPanel.hidden=!open;alertButton.setAttribute("aria-expanded",String(open));if(open){setDrawer(false)}}
menuButton.addEventListener("click",()=>setSideMenu(sideDrawer.hidden));
$("menu-close").addEventListener("click",()=>setSideMenu(false));
sideScrim.addEventListener("click",()=>setSideMenu(false));
$("side-home").addEventListener("click",()=>{setSideMenu(false);window.scrollTo({top:0,behavior:"smooth"})});
appsButton.addEventListener("click",()=>setDrawer(drawer.hidden));
$("apps-close").addEventListener("click",()=>setDrawer(false));
scrim.addEventListener("click",()=>setDrawer(false));
alertButton.addEventListener("click",()=>setAlerts(alertPanel.hidden));
searchForm.addEventListener("submit",event=>{
 event.preventDefault();
 const query=searchInput.value.trim().toLocaleLowerCase("pt-BR");
 if(!query){searchFeedback.hidden=false;searchFeedback.textContent="Digite o que você procura.";searchInput.focus();return}
 if(query.includes("worddark")){window.location.href=document.querySelector(".world-action").href;return}
 if(/^(apps?|aplicativos?|meus aplicativos|abrir apps)$/.test(query)){searchFeedback.hidden=true;setDrawer(true);return}
 const found=widgetCatalog.find(w=>w.title.toLocaleLowerCase("pt-BR").includes(query)||w.app.toLocaleLowerCase("pt-BR").includes(query));
 if(found){layout[found.id].enabled=true;saveLayout();renderWidgets();renderSettings();searchFeedback.hidden=false;searchFeedback.textContent=`Widget ${found.title} adicionado à tela inicial.`;return}
 searchFeedback.hidden=false;searchFeedback.textContent="Ainda não encontrei esse destino. Abra o menu para personalizar seus widgets.";
 setSideMenu(true);
});
$("alert-close").addEventListener("click",()=>setAlerts(false));
document.addEventListener("keydown",event=>{if(event.key==="Escape"){setDrawer(false);setAlerts(false);setSideMenu(false)}});
renderWidgets();renderSettings();
if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
})();