/* WordDark — Biblioteca Hierárquica
 * Cada setor guarda o detalhe na própria biblioteca.
 * WordDark guarda apenas índices, resumos e conhecimento promovido.
 */
class WordDarkHierarchicalLibrary {
  constructor({centralLibrary=null,sectorLibraries={}}={}) {
    this.centralLibrary=centralLibrary;
    this.sectorLibraries=new Map(Object.entries(sectorLibraries));
  }
  registerSector(libraryId,library){if(!libraryId||!library)throw new Error("Biblioteca de setor inválida.");this.sectorLibraries.set(libraryId,library);return library;}
  getSector(libraryId){return this.sectorLibraries.get(libraryId)||null;}
  save(libraryId,record){const library=this.getSector(libraryId);if(!library)throw new Error("Biblioteca de setor não registrada: "+libraryId);return library.save(record);}
  summarize({libraryId,record,type="SECTOR_INDEX",data={}}={}){
    if(!this.centralLibrary)throw new Error("Biblioteca Central não configurada.");
    return this.centralLibrary.append({recordId:"INDEX-"+libraryId+"-"+(record?.recordId||Date.now().toString(36).toUpperCase()),type,source:libraryId,summary:data,detailRecordId:record?.recordId||null});
  }
  promote({libraryId,recordId,reason="KNOWLEDGE_PROMOTED"}={}){const local=this.getSector(libraryId);if(!local)throw new Error("Biblioteca de setor não registrada.");const record=local.get(recordId);if(!record)return null;return this.summarize({libraryId,record,type:"LEARNING_PROMOTION",data:{reason,recordId:record.recordId,operationId:record.operationId,moduleId:record.moduleId,lesson:record.lesson}});}
  status(){const sectors={};for(const [id,lib] of this.sectorLibraries)sectors[id]={records:lib.list().length,ownerId:lib.ownerId,parentId:lib.parentId};return{centralRecords:this.centralLibrary?.count?.()||0,sectors};}
}
if(typeof module!=="undefined")module.exports={WordDarkHierarchicalLibrary};
if(typeof window!=="undefined")window.WordDarkHierarchicalLibrary=WordDarkHierarchicalLibrary;
