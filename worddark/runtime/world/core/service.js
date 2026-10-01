/* WordDark Core — Service Registry / Execution Capability */
class WordDarkServiceRegistry {
 constructor(){this.services=new Map();}
 register(service){if(!service||!service.id||typeof service.executor!=="function")throw new Error("Serviço inválido.");if(this.services.has(service.id))throw new Error("Serviço já registrado.");this.services.set(service.id,service);return service;}
 get(id){return this.services.get(id)||null;}
 execute(id,operation,context={}){const s=this.get(id);if(!s)return {success:false,status:"FAILED",reason:"SERVICE_NOT_FOUND"};try{const result=s.executor(operation,context);if(!result||typeof result!=="object")return {success:false,status:"FAILED",reason:"INVALID_SERVICE_RESULT"};return result;}catch(error){return {success:false,status:"FAILED",reason:error&&error.message||"SERVICE_EXECUTION_ERROR"};}}
 list(){return [...this.services.values()];}
}
if(typeof module!=="undefined")module.exports=WordDarkServiceRegistry;
if(typeof window!=="undefined")window.WordDarkServiceRegistry=WordDarkServiceRegistry;
