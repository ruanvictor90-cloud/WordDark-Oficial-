/* WordDark — Dark Factory Service Registry · DF-0.7 */
class DarkFactoryServiceRegistry {
  constructor(){this.services=new Map();}
  register(service){
    if(!service||!service.serviceId||!service.executor) throw new Error("Serviço inválido.");
    if(this.services.has(service.serviceId)) throw new Error("Serviço já registrado.");
    this.services.set(service.serviceId,service); return service;
  }
  get(serviceId){return this.services.get(serviceId)||null;}
  list(){return [...this.services.values()].map(s=>({serviceId:s.serviceId,name:s.name,type:s.type,status:s.status||"READY"}));}
  resolve(type){return [...this.services.values()].find(s=>s.type===type)||null;}
}
if(typeof module!=="undefined") module.exports=DarkFactoryServiceRegistry;
if(typeof window!=="undefined") window.DarkFactoryServiceRegistry=DarkFactoryServiceRegistry;
