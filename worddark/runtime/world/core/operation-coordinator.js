/* WordDark — Central Operation Coordinator · DF-0.11
 * Ponto de entrada para operações Terra → controles WordDark → Céu → Terra.
 * Não executa trabalho de negócio: coordena contrato, rota, autorização e retorno.
 */
class WordDarkOperationCoordinator {
  constructor({engine,road=null,destination="world/sky/darkfactory"}={}) {
    this.engine=engine||null;
    this.road=road||null;
    this.destination=destination;\n    this.companyRouter=companyRouter||null;
    this.version="0.11";
  }

  ensureRoute(origin,service,destination=this.destination) {
    if(!this.road||!origin)return{success:false,reason:"Rodovia não configurada ou origem ausente."};
    const existing=this.road.findRoute(origin,destination,service)||this.road.findRoute(origin,destination,"*");
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

  ensureReturnRoute(origin,service,destination=this.destination){
    if(!this.road||!origin)return{success:false,reason:"Rodovia não configurada ou origem ausente."};
    const existing=this.road.findRoute(destination,origin,service)||this.road.findRoute(destination,origin,"*");
    if(existing)return{success:true,routeId:existing.routeId};
    if(typeof WordDarkRoute==="undefined")return{success:false,reason:"Contrato de rota não carregado."};
    return this.road.registerRoute(new WordDarkRoute({
      routeId:"AUTO-RETURN-"+String(origin).replace(/[^a-z0-9]/gi,"-")+"-"+String(service).replace(/[^a-z0-9.*]/gi,"-"),
      origin:destination,destination:origin,service
    }));
  }

  submit(source={}){
    if(!this.engine)return{success:false,status:"FAILED",reason:"Operation Engine não configurado."};
    const origin=source.originId||source.origin;
    const service=source.operationType||source.service||"unknown.operation";
    const route=this.ensureRoute(origin,service,destination);
    if(!route.success)return{success:false,status:"BLOCKED",stage:"ROUTING",reason:route.reason};
    const returnRoute=this.ensureReturnRoute(origin,service,destination);
    if(!returnRoute.success)return{success:false,status:"BLOCKED",stage:"RETURN_ROUTING",reason:returnRoute.reason};

    const operation=this.engine.create({
      ...source,
      originId:origin,
      destinationId:destination,
      operationType:service,
      environment:source.environment||"TEST"
    });
    return this.engine.run(operation);
  }

  getStatus(){return{status:this.engine?"READY":"OFFLINE",version:this.version,destination:this.destination||"CAPABILITY_ROUTED",capabilityRouting:!!this.companyRouter};}
}
if(typeof module!=="undefined")module.exports=WordDarkOperationCoordinator;
if(typeof window!=="undefined")window.WordDarkOperationCoordinator=WordDarkOperationCoordinator;