const crypto=require("crypto");

function stable(value){
  if(value===null||typeof value!=="object") return value;
  if(Array.isArray(value)) return value.map(stable);
  return Object.keys(value).sort().reduce((o,k)=>{o[k]=stable(value[k]);return o;},{});
}

class WordDarkAuditLedger {
  constructor({ledgerId="WORLD-AUDIT",maxEntries=10000,clock=()=>new Date().toISOString()}={}) {
    this.ledgerId=ledgerId; this.maxEntries=maxEntries; this.clock=clock; this.entries=[];
  }

  append({actorId="SYSTEM",action,resourceId=null,result="RECORDED",severity="INFO",metadata={}}={}) {
    if(!action) throw new Error("action é obrigatório");
    const previousHash=this.entries.length?this.entries[this.entries.length-1].hash:null;
    const entry={
      sequence:this.entries.length+1,
      ledgerId:this.ledgerId,
      timestamp:this.clock(),
      actorId,
      action,
      resourceId,
      result,
      severity,
      metadata,
      previousHash
    };
    entry.hash=crypto.createHash("sha256").update(JSON.stringify(stable(entry))).digest("hex");
    this.entries.push(entry);
    if(this.entries.length>this.maxEntries) this.entries.shift();
    return {...entry};
  }

  verify(){
    let previous=null;
    for(const entry of this.entries){
      const copy={...entry}; delete copy.hash;
      if(entry.previousHash!==previous) return {valid:false,reason:"CHAIN_BROKEN",sequence:entry.sequence};
      const expected=crypto.createHash("sha256").update(JSON.stringify(stable(copy))).digest("hex");
      if(expected!==entry.hash) return {valid:false,reason:"ENTRY_TAMPERED",sequence:entry.sequence};
      previous=entry.hash;
    }
    return {valid:true,count:this.entries.length};
  }

  list(){return this.entries.map(e=>({...e}));}
  clear(){this.entries=[];}
}
if(typeof module!=="undefined") module.exports=WordDarkAuditLedger;
if(typeof window!=="undefined") window.WordDarkAuditLedger=WordDarkAuditLedger;
