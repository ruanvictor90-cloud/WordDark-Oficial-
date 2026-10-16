(()=>{"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;',"'":"&#39;"}[c]));
function safeHref(value){
  const fallback="./index.html";
  try{
    let raw=String(value||fallback).trim();
    if(raw==="./tarefas.html"||raw==="tarefas.html")raw="./apps/pessoal/tarefas.html";
    if(raw==="./financeiro.html"||raw==="financeiro.html")raw="./apps/pessoal/financeiro.html";
    const root=new URL("./",document.baseURI);
    const url=new URL(raw,root);
    if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname)||!url.pathname.endsWith(".html"))return fallback;
    return "./"+url.pathname.slice(root.pathname.length)+url.search+url.hash;
  }catch{return fallback}
}
function read(k){try{const value=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(value)?value:[]}catch{return[]}}
function today(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function getItems(){
  const day=today(),items=[],tasks=read("ruan.pessoal.tasks.v1"),finance=read("ruan.pessoal.finance.v1"),appAlerts=read("ruan.important.notifications.v1");
  tasks.filter(t=>t&&!t.done&&t.dueDate&&t.dueDate<=day).forEach(t=>items.push({title:t.title||"Tarefa",detail:t.dueDate<day?"Tarefa atrasada":"Tarefa para hoje",urgent:t.dueDate<day,href:"./apps/pessoal/tarefas.html",date:t.dueDate}));
  finance.filter(t=>t&&t.type==="bill"&&t.status!=="paid"&&t.dueDate&&t.dueDate<=day).forEach(t=>items.push({title:t.title||"Conta a pagar",detail:"Pagamento pendente",urgent:true,href:"./apps/pessoal/financeiro.html",date:t.dueDate}));
  appAlerts.filter(n=>n&&typeof n.title==="string").slice(0,20).forEach(n=>items.push({title:n.title,detail:n.detail||"Aviso importante de um aplicativo",urgent:n.urgent!==false,href:safeHref(n.href),date:n.createdAt||day}));
  return items.sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))).slice(0,30)
}
function renderNotifications(){
  const items=getItems(),badge=$("notification-badge");
  badge.textContent=items.length;badge.hidden=!items.length;
  $("notification-list").innerHTML=items.length?items.map(n=>'<a class="notification-item" href="'+esc(safeHref(n.href))+'"><span class="notification-dot '+(n.urgent?"urgent":"")+'"></span><span><strong>'+esc(n.title)+'</strong><small>'+esc(n.detail)+'</small></span></a>').join(""):'<p class="notification-empty">Nenhuma notificação por enquanto.</p>'
}
const noticeBtn=$("notification-toggle"),panel=$("notification-panel"),backBtn=$("back-button");
if(backBtn)backBtn.addEventListener("click",()=>{if(window.history.length>1)window.history.back();else window.location.href="./index.html"});
noticeBtn.addEventListener("click",()=>{panel.hidden=!panel.hidden;noticeBtn.setAttribute("aria-expanded",String(!panel.hidden));if(!panel.hidden)renderNotifications()});
$("notification-close").addEventListener("click",()=>{panel.hidden=true;noticeBtn.setAttribute("aria-expanded","false")});
window.addEventListener("storage",renderNotifications);window.addEventListener("ruan:data-changed",renderNotifications);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)renderNotifications()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){panel.hidden=true;noticeBtn.setAttribute("aria-expanded","false")}});
renderNotifications();
if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
})();