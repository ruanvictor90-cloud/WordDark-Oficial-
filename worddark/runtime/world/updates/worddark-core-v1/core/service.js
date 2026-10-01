/* WordDark Lab — Service execution layer */
class WordDarkLabServiceRegistry {
  constructor(){this.services=new Map();}
  register(service){if(!service||!service.id||typeof service.executor!=="function")throw new Error("Serviço inválido.");if(this.services.has(service.id))throw new Error("Serviço já registrado.");this.services.set(service.id,service);return service;}
  get(id){return this.services.get(id)||null;}
  execute(id,operation){const s=this.get(id);if(!s)return {success:false,status:"FAILED",reason:"SERVICE_NOT_FOUND"};return s.executor(operation);}
}
if(typeof module!=="undefined")module.exports=WordDarkLabServiceRegistry;
if(typeof window!=="undefined")window.WordDarkLabServiceRegistry=WordDarkLabServiceRegistry;
