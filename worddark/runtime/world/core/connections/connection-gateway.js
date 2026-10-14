/* WordDark — Central External Connection Gateway
 * Todas as conexões externas passam por aqui.
 *
 * Céu executa a operação.
 * Central de Conexões executa apenas a fronteira externa.
 * OAuth, tokens, APIs e adapters de terceiros ficam atrás deste gateway.
 */
const ExternalRequest=typeof module==="object"&&module.exports?require("./connection-contract"):null;

const ACTION_CAPABILITIES=Object.freeze({CONTENT_PUBLISH:"CONTENT_PUBLICATION",CONTENT_UNPUBLISH:"CONTENT_PUBLICATION",CONTENT_SCHEDULE:"CONTENT_PUBLICATION",SEARCH_KNOWLEDGE:"KNOWLEDGE_RESEARCH",FETCH_KNOWLEDGE:"KNOWLEDGE_RESEARCH"});
const SECRET_KEYS=/(?:token|secret|credential|authorization|ciphertext|password|api[-_]?key|client[-_]?secret)/i;

/** Restrict provider data before it leaves the trusted adapter boundary. */
function sanitizeExternalValue(value,depth=0){
  if(depth>8)return null;
  if(Array.isArray(value))return value.slice(0,100).map(item=>sanitizeExternalValue(item,depth+1));
  if(!value||typeof value!=="object"){
    if(typeof value==="string")return value.slice(0,20000);
    if(typeof value==="number"&&!Number.isFinite(value))return null;
    if(typeof value==="function"||typeof value==="symbol"||typeof value==="bigint")return null;
    return value;
  }
  const output={};
  for(const [key,item] of Object.entries(value)){
    if(SECRET_KEYS.test(key))continue;
    output[key]=sanitizeExternalValue(item,depth+1);
  }
  return output;
}

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

    const requiredCapability=ACTION_CAPABILITIES[request.action];
    if(requiredCapability&&request.capability!==requiredCapability)return{success:false,status:"ACTION_CAPABILITY_MISMATCH",operationId:request.operationId,action:request.action,capability:request.capability};
    const registryCapability=request.capability;
    const access=this.registry.authorizeContext(request.providerId,request.accountId,registryCapability);
    if(!access.allowed)return{success:false,status:access.status,stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId,providerId:request.providerId,accountId:request.accountId,capability:registryCapability};

    const adapter=this.adapters.get(request.providerId);
    if(!adapter)return{
      success:false,status:"WAITING_EXTERNAL_CONNECTION",stage:"CENTRAL_DE_CONEXOES",
      operationId:request.operationId,providerId:request.providerId,
      reason:"Adapter externo ainda não conectado. A ponta operacional está pronta."
    };

    const auditContext={operationId:request.operationId,providerId:request.providerId,action:request.action,capability:registryCapability};
    try{
      // Logs contain only routing metadata, never request payloads, credentials, or provider responses.
      this.logger?.log?.("EXTERNAL_CONNECTION_EXECUTION_STARTED",auditContext);
      const rawResult=await adapter.execute(request.toJSON(),{account:access.account,credential:this.registry.getRuntimeCredential(request.providerId,request.accountId)});
      const result=sanitizeExternalValue(rawResult);
      this.logger?.log?.("EXTERNAL_CONNECTION_EXECUTION_FINISHED",{...auditContext,status:String(result?.status||"EXTERNAL_EXECUTED"),success:result?.success!==false});
      return{success:result?.success!==false,status:result?.status||"EXTERNAL_EXECUTED",operationId:request.operationId,providerId:request.providerId,accountId:request.accountId,result};
    }catch{
      // Do not echo exception text: SDK errors can contain headers, URLs, or credential fragments.
      this.logger?.log?.("EXTERNAL_CONNECTION_EXECUTION_FAILED",{...auditContext,status:"EXTERNAL_EXECUTION_FAILED"});
      return{success:false,status:"EXTERNAL_EXECUTION_FAILED",stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId,reason:"Falha na conexão externa. Consulte a auditoria segura para detalhes."};
    }
  }

  getStatus(){return{status:this.status,adapters:[...this.adapters.keys()],adapterCount:this.adapters.size};}
}
if(typeof window!=="undefined")window.ExternalConnectionGateway=ExternalConnectionGateway;
if(typeof module!=="undefined"&&module.exports)module.exports=ExternalConnectionGateway;
