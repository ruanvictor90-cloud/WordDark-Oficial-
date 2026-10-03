/* WordDark — Dark Factory Content Module Registry · DF-0.10 */
class ContentModuleRegistry{
  constructor(){this.modules=new Map();}
  register(id,executor){if(!id||typeof executor!=="function")throw new Error("Módulo inválido.");this.modules.set(String(id).toUpperCase(),executor);return this;}
  has(id){return this.modules.has(String(id).toUpperCase());}
  list(){return [...this.modules.keys()];}
  async execute(id,context){const fn=this.modules.get(String(id).toUpperCase());if(!fn)return{success:false,status:"MODULE_UNAVAILABLE",module:id};return await fn(context);}
}
if(typeof window!=="undefined")window.ContentModuleRegistry=ContentModuleRegistry;
if(typeof module!=="undefined"&&module.exports)module.exports=ContentModuleRegistry;
