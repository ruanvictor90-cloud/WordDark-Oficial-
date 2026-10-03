/* WordDark — Central Operation Coordinator · Capability Routing */
class WordDarkOperationCoordinator {
  constructor({engine,road=null,destination=null,companyRouter=null}={}) {
    this.engine=engine||null;
    this.road=road||null;
    this.destination=destination;
    this.companyRouter=companyRouter||null;
    this.version="0.12";
  }

  resolveDestination(source={},service="unknown.operation"){
    const explicit=source.destinationId||source.destination||this.destination;
    if(explicit)return{success:true,destination:explicit};
    if(!this.companyRouter)return{success:false,reason:"Destino e resolvedor de capacidade não configurados."};
    const resolved=this.companyRouter.route({
      intent:source.intent,
      need:source.need,
      capability:source.capability||service
    });
    if(!resolved.success)return{success:false,reason:resolved.reason,capability:resolved.capability||null};
    return{success:true,destination:resolved.destinationCompanyId,resolution:resolved};
  }

  ensureRoute(origin,service,destination){
    if(!this.road||!origin)return{success:false,reason:"Rodovia não configurada ou origem ausente."};
    const existing=this.road.findRoute(origin,destination,service)||this.road.findRoute(origin,destination,"*");
    if(existing)return{success:true,routeId:existing.routeId};
    if(typeof WordDarkRoute==="undefined")return{success:false,reason:"Contrato de rota não carregado."};
    return this.road.registerRoute(new WordDarkRoute({
      routeId:"AUTO-"+String(origin).replace(/[^a-z0-9]/gi,"-")+"-"+String(destination).replace(/[^a-z0-9]/gi,"-")+"-"+String(service).replace(/[^a-z0-9.*]/gi,"-"),
      origin,destination,service
    }));
  }

  ensureReturnRoute(origin,service,destination){
    if(!this.road||!origin)return{success:false,reason:"Rodovia não configurada ou origem ausente."};
    const existing=this.road.findRoute(destination,origin,service)||this.road.findRoute(destination,origin,"*");
    if(existing)return{success:true,routeId:existing.routeId};
    if(typeof WordDarkRoute==="undefined")return{success:false,reason:"Contrato de rota não carregado."};
    return this.road.registerRoute(new WordDarkRoute({
      routeId:"AUTO-RETURN-"+String(origin).replace(/[^a-z0-9]/gi,"-")+"-"+String(destination).replace(/[^a-z0-9]/gi,"-")+"-"+String(service).replace(/[^a-z0-9.*]/gi,"-"),
      origin:destination,destination:origin,service
    }));
  }

  submit(source={}){
    if(!this.engine)return{success:false,status:"FAILED",reason:"Operation Engine não configurado."};
    const origin=source.originId||source.origin;
    const service=source.operationType||source.service||"unknown.operation";
    const destination=this.resolveDestination(source,service);
    if(!destination.success)return{success:false,status:"BLOCKED",stage:"CAPABILITY",reason:destination.reason,capability:destination.capability||null};
    const route=this.ensureRoute(origin,service,destination.destination);
    if(!route.success)return{success:false,status:"BLOCKED",stage:"ROUTING",reason:route.reason};
    const returnRoute=this.ensureReturnRoute(origin,service,destination.destination);
    if(!returnRoute.success)return{success:false,status:"BLOCKED",stage:"RETURN_ROUTING",reason:returnRoute.reason};

    const operation=this.engine.create({
      ...source,
      originId:origin,
      destinationId:destination.destination,
      operationType:service,
      environment:source.environment||"TEST"
    });
    return this.engine.run(operation);
  }

  getStatus(){
    return{
      status:this.engine?"READY":"OFFLINE",
      version:this.version,
      destination:this.destination||"CAPABILITY_ROUTED",
      capabilityRouting:!!this.companyRouter
    };
  }
}
if(typeof module!=="undefined")module.exports=WordDarkOperationCoordinator;
if(typeof window!=="undefined")window.WordDarkOperationCoordinator=WordDarkOperationCoordinator;
