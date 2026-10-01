/* WordDark — Record Contract
 * Template universal para registros rastreáveis.
 * Registro preserva fatos; não decide operações.
 */
class WordDarkRecord {
  constructor(source = {}) {
    this.recordId = source.recordId || null;
    this.type = source.type || null;
    this.operationId = source.operationId || null;
    this.sourceId = source.sourceId || null;
    this.status = source.status || null;
    this.data = source.data || {};
    this.createdAt = source.createdAt || new Date().toISOString();
  }
  validate(){
    const errors=[];
    if(!this.recordId) errors.push("recordId é obrigatório.");
    if(!this.type) errors.push("type é obrigatório.");
    if(!this.sourceId) errors.push("sourceId é obrigatório.");
    return {valid:errors.length===0, errors};
  }
  toJSON(){return {...this};}
}
if(typeof module!=="undefined") module.exports=WordDarkRecord;
if(typeof window!=="undefined") window.WordDarkRecord=WordDarkRecord;
