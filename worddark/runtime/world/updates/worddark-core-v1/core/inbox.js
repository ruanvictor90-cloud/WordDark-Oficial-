/* WordDark Lab — Notifications vs actionable inbox */
class WordDarkLabInbox {
  constructor(){this.notifications=[];this.pending=[];}
  notify(data){const n={notificationId:"NTF-"+Date.now().toString(36).toUpperCase(),timestamp:new Date().toISOString(),...data};this.notifications.push(n);return n;}
  pend(data){const p={pendingId:"PEN-"+Date.now().toString(36).toUpperCase(),status:"OPEN",timestamp:new Date().toISOString(),...data};this.pending.push(p);return p;}
  resolve(pendingId){const p=this.pending.find(x=>x.pendingId===pendingId);if(!p)return null;p.status="RESOLVED";p.resolvedAt=new Date().toISOString();return p;}
  getOpen(){return this.pending.filter(x=>x.status==="OPEN");}
}
if(typeof module!=="undefined")module.exports=WordDarkLabInbox;
if(typeof window!=="undefined")window.WordDarkLabInbox=WordDarkLabInbox;
