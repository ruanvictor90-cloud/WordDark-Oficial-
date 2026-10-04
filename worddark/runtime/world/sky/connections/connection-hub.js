/* WordDark — Central Connection Hub
 * Interface interna única entre WordDark e conectores externos.
 * A UI conhece somente estado/conta; adapters e tokens ficam abaixo desta camada.
 */
(function(global){
  class WordDarkConnectionHub{
    constructor({registry=null}={}){this.registry=registry||new WordDarkConnectorRegistry();}
    register(provider={}){return this.registry.register(provider);}
    status(){return this.registry.list().map(x=>({id:x.id,provider:x.provider,status:x.status,capabilities:x.capabilities}));}
    find(capability){return this.registry.findCapability(capability).map(x=>({id:x.id,provider:x.provider,status:x.status}));}
    async authorize(id,context={}){return this.registry.authorize(id,context);}
    async execute(id,request={}){return this.registry.execute(id,request);}
    async disconnect(id,context={}){return this.registry.disconnect(id,context);}
  }
  if(typeof global!=="undefined")global.WordDarkConnectionHub=WordDarkConnectionHub;
  if(typeof module!=="undefined"&&module.exports)module.exports=WordDarkConnectionHub;
})(typeof globalThis!=="undefined"?globalThis:window);