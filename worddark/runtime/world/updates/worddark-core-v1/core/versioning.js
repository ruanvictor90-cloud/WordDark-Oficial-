/* WordDark Lab — immutable version history */
class WordDarkLabVersioning {
  constructor(){this.versions=new Map();}
  create(entityId,data){const list=this.versions.get(entityId)||[];const version={entityId,version:list.length+1,createdAt:new Date().toISOString(),data:JSON.parse(JSON.stringify(data))};list.push(version);this.versions.set(entityId,list);return version;}
  list(entityId){return [...(this.versions.get(entityId)||[])];}
  latest(entityId){const l=this.list(entityId);return l[l.length-1]||null;}
}
if(typeof module!=="undefined")module.exports=WordDarkLabVersioning;
if(typeof window!=="undefined")window.WordDarkLabVersioning=WordDarkLabVersioning;
