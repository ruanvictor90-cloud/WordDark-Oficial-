const RUAN_ALERTS_KEY='ruan.important.notifications.v1';
const RUAN_ROOT=new URL('../',import.meta.url);
function safeRuanHref(value){
  let raw=String(value||'./index.html').trim();
  if(raw==='./tarefas.html'||raw==='tarefas.html')raw='./apps/pessoal/tarefas.html';
  if(raw==='./financeiro.html'||raw==='financeiro.html')raw='./apps/pessoal/financeiro.html';
  try{
    const url=new URL(raw,RUAN_ROOT);
    if(url.origin!==RUAN_ROOT.origin||!url.pathname.startsWith(RUAN_ROOT.pathname)||!url.pathname.endsWith('.html'))return './index.html';
    return './'+url.pathname.slice(RUAN_ROOT.pathname.length)+url.search+url.hash;
  }catch{return './index.html'}
}
export function publishRuanNotification(title,detail,href,urgent=true){
  try{
    const current=JSON.parse(localStorage.getItem(RUAN_ALERTS_KEY)||'[]');
    const items=Array.isArray(current)?current:[];
    items.unshift({id:'ruan-alert-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),title:String(title||'Aviso importante'),detail:String(detail||''),href:safeRuanHref(href),urgent:urgent!==false,createdAt:new Date().toISOString()});
    localStorage.setItem(RUAN_ALERTS_KEY,JSON.stringify(items.slice(0,30)));
    window.dispatchEvent(new Event('ruan:data-changed'));
  }catch{}
}
