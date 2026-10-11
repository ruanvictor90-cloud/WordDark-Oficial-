/* WordDark — External Adapter Contract
 * Implementado somente dentro da Central de Conexões.
 * Cada provedor externo terá seu próprio adapter.
 */
class WordDarkExternalAdapter {
  constructor({providerId,version="1.0"}={}){this.providerId=String(providerId||"").toUpperCase();this.version=version;}
  validate(){return{valid:!!this.providerId,errors:this.providerId?[]:["providerId é obrigatório."]};}
  async execute(){throw new Error("Adapter externo sem implementação.");}
}
if(typeof window!=="undefined")window.WordDarkExternalAdapter=WordDarkExternalAdapter;
if(typeof module!=="undefined"&&module.exports)module.exports=WordDarkExternalAdapter;
