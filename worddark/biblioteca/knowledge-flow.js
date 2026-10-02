export const KNOWLEDGE_CLASS = Object.freeze({
  LOCAL: "LOCAL",
  CANDIDATE: "CENTRAL_CANDIDATE",
  CENTRAL: "CENTRAL"
});

export class SectorLibraryManager {
  constructor({centralLibrary=null,audit=null}={}) {
    this.centralLibrary=centralLibrary;
    this.audit=audit;
    this.sectors=new Map();
  }

  registerSector({sectorId,ownerId=sectorId,parentId=null,metadata={}}={}) {
    if(!sectorId) throw new Error("SECTOR_ID_REQUIRED");
    if(this.sectors.has(sectorId)) return this.sectors.get(sectorId);
    const library={
      libraryId:"LOCAL-"+sectorId,
      ownerId,
      parentId,
      metadata:{scope:"SECTOR",sectorId,...metadata},
      records:new Map()
    };
    this.sectors.set(sectorId,library);
    return library;
  }

  getSector(sectorId) {
    return this.sectors.get(sectorId)||null;
  }

  save(sectorId,record) {
    const library=this.getSector(sectorId)||this.registerSector({sectorId});
    if(!record?.id) throw new Error("LIBRARY_RECORD_ID_REQUIRED");
    const stored={
      ...structuredClone(record),
      libraryId:library.libraryId,
      ownerId:library.ownerId,
      sectorId,
      knowledgeClass:record.knowledgeClass||KNOWLEDGE_CLASS.LOCAL,
      updatedAt:new Date().toISOString()
    };
    library.records.set(stored.id,stored);
    return structuredClone(stored);
  }

  list(sectorId) {
    const library=this.getSector(sectorId);
    return library?[...library.records.values()].map(structuredClone):[];
  }

  filter(sectorId,{predicate=null,classify=null}={}) {
    const records=this.list(sectorId);
    return records.map(record=>{
      const classification=classify?classify(record):record.knowledgeClass||KNOWLEDGE_CLASS.LOCAL;
      const accepted=predicate?Boolean(predicate(record)):true;
      return {...record,knowledgeClass:classification,accepted};
    });
  }

  consolidate(sectorId,{predicate=null,classify=null,reason="LOCAL_KNOWLEDGE_CONSOLIDATION"}={}) {
    if(!this.centralLibrary) throw new Error("CENTRAL_LIBRARY_REQUIRED");
    const candidates=this.filter(sectorId,{predicate,classify}).filter(x=>x.accepted&&x.knowledgeClass!==KNOWLEDGE_CLASS.LOCAL);
    const promoted=[];
    for(const record of candidates){
      const result=this.centralLibrary.append({
        id:"MEMORY-"+record.sectorId+"-"+record.id,
        type:"WORLD_MEMORY",
        sourceSector:record.sectorId,
        sourceLibrary:record.libraryId,
        classification:record.knowledgeClass,
        reason,
        data:record
      });
      promoted.push(result);
      const library=this.getSector(sectorId);
      const current=library.records.get(record.id);
      if(current) library.records.set(record.id,{...current,centralizedAt:new Date().toISOString(),centralRecordId:result.id});
      this.audit?.record?.("LIBRARY_KNOWLEDGE_CONSOLIDATED",{sectorId,recordId:record.id,centralRecordId:result.id});
    }
    return promoted.map(structuredClone);
  }

  status() {
    return {
      sectors:this.sectors.size,
      localRecords:[...this.sectors.values()].reduce((total,library)=>total+library.records.size,0),
      centralRecords:this.centralLibrary?.count?.()||0
    };
  }
}
