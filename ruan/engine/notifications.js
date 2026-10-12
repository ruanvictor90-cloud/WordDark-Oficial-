const RUAN_ALERTS_KEY='ruan.important.notifications.v1';
export function publishRuanNotification(title,detail,href,urgent=true){
  try{
    const current=JSON.parse(localStorage.getItem(RUAN_ALERTS_KEY)||'[]');
    const items=Array.isArray(current)?current:[];
    items.unshift({id:'ruan-alert-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),title:String(title||'Aviso importante'),detail:String(detail||''),href:String(href||'../index.html'),urgent:urgent!==false,createdAt:new Date().toISOString()});
    localStorage.setItem(RUAN_ALERTS_KEY,JSON.stringify(items.slice(0,30)));
    window.dispatchEvent(new Event('ruan:data-changed'));
  }catch{}
}
