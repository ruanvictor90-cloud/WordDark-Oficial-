(()=>{"use strict";
const $=id=>document.getElementById(id);
const names={worddark:"WordDark",ceu:"Céu",terra:"Terra"};
const descriptions={worddark:"Área principal do mundo.",ceu:"Aplicativos do Céu.",terra:"Aplicativos da Terra."};
const marks={worddark:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M7 15h10l7 27 8-19h6l8 19 7-27h10L52 51h-9l-8-18-8 18h-9Z"/></svg>',ceu:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M17 43h31a10 10 0 0 0 1-20 17 17 0 0 0-32-3 12 12 0 0 0 0 23Z"/><path d="m23 34 7 7 13-15"/></svg>',terra:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="24"/><path d="M8 32h48M32 8c8 8 12 16 12 24S40 48 32 56M32 8c-8 8-12 16-12 24s4 16 12 24M13 19h38M13 45h38"/></svg>'};
const apps={
ceu:[
{name:"DarkFactory",desc:"Produção e criação",href:"./darkfactory/index.html",color:"#b16cff",svg:'<path d="M8 54V24l12 10V24l12 10V14h12v40Z"/><path d="M38 14V7h10v7"/><path d="M17 43h5m6 0h5m6 0h5"/>'},
{name:"Central Mundial",desc:"Painel mundial",href:"./central-mundial/index.html",color:"#d4a8ff",svg:'<circle cx="32" cy="32" r="23"/><path d="M9 32h46M32 9c8 8 12 15 12 23S40 47 32 55M32 9c-8 8-12 15-12 23s4 15 12 23M14 19h36M14 45h36"/>'},
{name:"DarkBank",desc:"Área financeira",href:"./darkbank/index.html",color:"#b8a1ff",svg:'<rect x="8" y="16" width="48" height="34" rx="5"/><path d="M8 26h48M16 40h12"/><circle cx="44" cy="39" r="5"/>'}
],
terra:[
{name:"Capitação",desc:"Entrada de oportunidades",href:"./capitacao/index.html",color:"#e2a4ff",svg:'<circle cx="26" cy="25" r="11"/><path d="M7 53c2-10 9-15 19-15s17 5 19 15"/><path d="M43 17h14m-7-7v14M44 38l6 6 8-10"/>'},
{name:"DarkCommerce",desc:"Comércio e operações",href:"./darkcommerce/index.html",color:"#cf9bff",svg:'<path d="M8 12h7l5 27h25l7-19H18"/><circle cx="26" cy="49" r="3"/><circle cx="44" cy="49" r="3"/><path d="M27 9h16m-8-8v16"/>'},
{name:"DarkAccount",desc:"Contas e acessos",href:"./darkaccount/index.html",color:"#ad8aff",svg:'<circle cx="32" cy="21" r="12"/><path d="M9 55c2-13 10-20 23-20s21 7 23 20Z"/><path d="M44 12h12m-6-6v12"/>'}
]};
const home=$("sector-home"),view=$("sector-view");
function renderApps(key){const host=$("sector-apps");host.innerHTML="";(apps[key]||[]).forEach(app=>{const a=document.createElement("a");a.className="sector-app-link";a.href=app.href;a.style.setProperty("--app-accent",app.color);a.innerHTML='<span class="app-symbol" aria-hidden="true"><svg viewBox="0 0 64 64">'+app.svg+'</svg></span><span class="app-link-copy"><strong>'+app.name+'</strong><small>'+app.desc+'</small></span><span class="app-link-arrow">↗</span>';host.appendChild(a)})}
function openSector(key){if(!names[key])return;home.hidden=true;view.hidden=false;$("sector-view-title").textContent=names[key];$("sector-view-description").textContent=descriptions[key];$("sector-view-mark").innerHTML=marks[key];$("sector-view-mark").setAttribute("aria-label",names[key]);renderApps(key);history.replaceState(null,"","#"+key);window.scrollTo({top:0,behavior:"smooth"})}
function showHome(){view.hidden=true;home.hidden=false;history.replaceState(null,"",location.pathname);window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll("[data-sector]").forEach(button=>button.addEventListener("click",()=>openSector(button.dataset.sector)));
$("sector-back").addEventListener("click",showHome);
$("notification-toggle").addEventListener("click",()=>{const panel=$("notification-panel"),open=panel.hidden;panel.hidden=!open;$("notification-toggle").setAttribute("aria-expanded",String(open))});
$("notification-close").addEventListener("click",()=>{$("notification-panel").hidden=true;$("notification-toggle").setAttribute("aria-expanded","false")});
const key=location.hash.slice(1);if(names[key])openSector(key);
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))
})();