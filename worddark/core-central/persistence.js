export class MemoryPersistence {
  constructor(){ this.records=new Map(); }
  save(key,value){
    if(!key) throw new Error("PERSISTENCE_KEY_REQUIRED");
    this.records.set(String(key), structuredClone(value));
    return structuredClone(value);
  }
  get(key){ const value=this.records.get(String(key)); return value==null?null:structuredClone(value); }
  has(key){ return this.records.has(String(key)); }
  delete(key){ return this.records.delete(String(key)); }
  list(){ return [...this.records.entries()].map(([key,value])=>({key,value:structuredClone(value)})); }
  clear(){ this.records.clear(); }
}
