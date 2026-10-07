/* WordDark — Central Social Analytics
 * Unifica métricas das contas conectadas sem expor a estrutura das redes ao usuário.
 */
const STORAGE_KEY="wd.social.analytics";

class WordDarkSocialAnalytics {
  constructor({storage=null}={}){this.storage=storage||globalThis.localStorage;}
  list(){try{return JSON.parse(this.storage.getItem(STORAGE_KEY)||"[]");}catch{return[];}}
  save(snapshot){
    if(!snapshot?.providerId||!snapshot?.accountId)throw new Error("ANALYTICS_ACCOUNT_REQUIRED");
    const current=this.list().filter(x=>!(x.providerId===snapshot.providerId&&x.accountId===snapshot.accountId));
    current.push({...snapshot,updatedAt:new Date().toISOString()});
    this.storage.setItem(STORAGE_KEY,JSON.stringify(current));
    return snapshot;
  }
  remove(providerId,accountId){
    const next=this.list().filter(x=>!(x.providerId===String(providerId).toUpperCase()&&x.accountId===accountId));
    this.storage.setItem(STORAGE_KEY,JSON.stringify(next));
  }
  overview(connections=[]){
    const snapshots=this.list();
    const connected=connections.filter(x=>x.status==="CONNECTED");
    const rows=connected.map(account=>{
      const snap=snapshots.find(x=>x.providerId===account.providerId&&x.accountId===account.accountId)||{};
      return {...account,...snap};
    });
    const sum=(key)=>rows.reduce((n,x)=>n+Number(x.metrics?.[key]||0),0);
    const top=(items,key)=>items.filter(x=>x[key]!=null).sort((a,b)=>Number(b[key]||0)-Number(a[key]||0)[0];
    const videos=rows.flatMap(x=>(x.topContent||[]).map(v=>({...v,providerId:x.providerId,accountName:x.displayName||x.accountId})));
    const mostViewed=videos.sort((a,b)=>Number(b.views||0)-Number(a.views||0))[0]||null;
    const mostLiked=videos.sort((a,b)=>Number(b.likes||0)-Number(a.likes||0))[0]||null;
    const mostCommented=videos.sort((a,b)=>Number(b.comments||0)-Number(a.comments||0))[0]||null;
    const bestAccount=rows.map(x=>({...x,score:Number(x.metrics?.views||0)+Number(x.metrics?.likes||0)*3+Number(x.metrics?.comments||0)*4}))
      .sort((a,b)=>b.score-a.score)[0]||null;
    return {
      accounts:rows.length,
      views:sum("views"),
      uniqueViews:sum("uniqueViews"),
      likes:sum("likes"),
      comments:sum("comments"),
      mostViewed,mostLiked,mostCommented,bestAccount,
      updatedAt:rows.map(x=>x.updatedAt).filter(Boolean).sort().pop()||null
    };
  }
}
if(typeof window!=="undefined")window.WordDarkSocialAnalytics=WordDarkSocialAnalytics;
if(typeof module!=="undefined"&&module.exports)module.exports=WordDarkSocialAnalytics;
