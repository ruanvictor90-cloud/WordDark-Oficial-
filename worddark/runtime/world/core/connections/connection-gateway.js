/* WordDark — Central External Connection Gateway
 * Todas as conexões externas passam por aqui.
 *
 * Céu executa a operação.
 * Central de Conexões executa apenas a fronteira externa.
 * OAuth, tokens, APIs e adapters de terceiros ficam atrás deste gateway.
 */
const ExternalRequest=typeof module==="object"&&module.exports?require("./connection-contract"):null;

const CAPABILITY_ALIASES=Object.freeze({CONTENT_PUBLISH:"CONTENT_ROUTE",MEDIA_UPLOAD:"MEDIA_UPLOAD"});

class ExternalConnectionGateway {
  constructor({registry=null,logger=null}={}) {
    this.registry=registry||null;
    this.logger=logger||null;
    this.adapters=new Map();
    this.status="ONLINE";
  }

  registerAdapter(providerId,adapter) {
    const id=String(providerId||"").toUpperCase();
    if(!id||!adapter||typeof adapter.execute!=="function")throw new Error("Adapter externo inválido.");
    if(this.adapters.has(id))throw new Error("Adapter externo já registrado: "+id);
    this.adapters.set(id,adapter);
    return{success:true,status:"ADAPTER_REGISTERED",providerId:id};
  }

  removeAdapter(providerId) {
    this.adapters.delete(String(providerId||"").toUpperCase());
    return{success:true,status:"ADAPTER_REMOVED"};
  }

  createRequest(source={}) {
    if(!ExternalRequest)return{success:false,status:"CONTRACT_UNAVAILABLE"};
    const request=new ExternalRequest(source);
    const validation=request.validate();
    if(!validation.valid)return{success:false,status:"INVALID_EXTERNAL_REQUEST",errors:validation.errors};
    return{success:true,request};
  }

  async execute(source={}) {
    const built=this.createRequest(source);
    if(!built.success)return built;
    const request=built.request;
    if(!this.registry)return{success:false,status:"CONNECTION_REGISTRY_UNAVAILABLE",operationId:request.operationId};

    const registryCapability=CAPABILITY_ALIASES[request.capability]||request.capability;
    const access=this.registry.authorizeContext(request.providerId,request.accountId,registryCapability);
    if(!access.allowed)return{success:false,status:access.status,stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId,providerId:request.providerId,accountId:request.accountId,capability:registryCapability};

    const adapter=this.adapters.get(request.providerId);
    if(!adapter)return{
      success:false,status:"WAITING_EXTERNAL_CONNECTION",stage:"CENTRAL_DE_CONEXOES",
      operationId:request.operationId,providerId:request.providerId,
      reason:"Adapter externo ainda não conectado. A ponta operacional está pronta."
    };

    try{
      this.logger?.log?.("EXTERNAL_CONNECTION_EXECUTION_STARTED",request.toJSON());
      const result=await adapter.execute(request.toJSON(),{account:access.account,credential:this.registry.getRuntimeCredential(request.providerId,request.accountId)});
      this.logger?.log?.("EXTERNAL_CONNECTION_EXECUTION_FINISHED",{request:request.toJSON(),result});
      return{success:result?.success!==false,status:result?.status||"EXTERNAL_EXECUTED",operationId:request.operationId,providerId:request.providerId,accountId:request.accountId,result};
    }catch(error){
      this.logger?.log?.("EXTERNAL_CONNECTION_EXECUTION_FAILED",{request:request.toJSON(),error:String(error?.message||error)});
      return{success:false,status:"EXTERNAL_EXECUTION_FAILED",stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId,providerId:request.providerId,reason:error?.message||"Falha na conexão externa."};
    }
  }

  getStatus(){return{status:this.status,adapters:[...this.adapters.keys()],adapterCount:this.adapters.size};}
}
if(typeof window!=="undefined")window.ExternalConnectionGateway=ExternalConnectionGateway;
if(typeof module!=="undefined"&&module.exports)module.exports=ExternalConnectionGateway;
