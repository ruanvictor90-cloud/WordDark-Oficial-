/* WordDark — Central Operation Coordinator · DF-0.11
 * Ponto de entrada para operações Terra → controles WordDark → Céu → Terra.
 * Não executa trabalho de negócio: coordena contrato, rota, autorização e retorno.
 */
class WordDarkOperationCoordinator {
  constructor({engine,road=null,destination="world/sky/darkfactory"}={}) {
    this.engine=engine||null;
    this.road=road||null;
    this.destination=destination;
    this.version="0.11";
  }

  ensureRoute(origin,service) {
    if(!this.road||!origin)return{success:false,reason:"Rodovia não configurada ou origem ausente."};
    const existing=this.road.findRoute(origin,this.destination,service)||this.road.findRoute(origin,this.destination,"*");
    if(existing)return{success:true,routeId:existing.routeId};
    if(typeof WordDarkRoute==="undefined")return{success:false,reason:"Contrato de rota não carregado."};

    const route=new WordDarkRoute({
      routeId:"AUTO-"+String(origin).replace(/[^a-z0-9]/gi,"-")+"-"+String(service).replace(/[^a-z0-9.*]/gi,"-"),
      origin,
      destination:this.destination,
      service
    });
    return this.road.registerRoute(route);
  }

  ensureReturnRoute(service){
    if(!this.road)return{success:false,reason:"Rodovia não configurada."};
    const existing=this.road.findRoute(this.destination,"*",service);
    if(existing)return{success:true,routeId:existing.routeId};
    return{success:true};
  }

  submit(source={}){
    if(!this.engine)return{success:false,status:"FAILED",reason:"Operation Engine não configurado."};
    const origin=source.originId||source.origin;
    const service=source.operationType||source.service||"unknown.operation";
    const route=this.ensureRoute(origin,service);
    if(!route.success)return{success:false,status:"BLOCKED",stage:"ROUTING",reason:route.reason};

    const operation=this.engine.create({
      ...source,
      originId:origin,
      destinationId:source.destinationId||this.destination,
      operationType:service,
      environment:source.environment||"TEST"
    });
    return this.engine.run(operation);
  }

  getStatus(){return{status:this.engine?"READY":"OFFLINE",version:this.version,destination:this.destination};}
}
if(typeof module!=="undefined")module.exports=WordDarkOperationCoordinator;
if(typeof window!=="undefined")window.WordDarkOperationCoordinator=WordDarkOperationCoordinator;