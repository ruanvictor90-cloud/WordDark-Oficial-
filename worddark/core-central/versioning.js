export class VersionHistory {
  constructor(){ this.versions=new Map(); }
  create(entityId,data){
    if(!entityId) throw new Error("ENTITY_ID_REQUIRED");
    const list=this.versions.get(entityId)||[];
    const version={entityId,version:list.length+1,createdAt:new Date().toISOString(),data:structuredClone(data)};
    list.push(version); this.versions.set(entityId,list);
    return structuredClone(version);
  }
  list(entityId){ return (this.versions.get(entityId)||[]).map(structuredClone); }
  latest(entityId){ const list=this.list(entityId); return list.at(-1)||null; }
}
