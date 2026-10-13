/* WordDark — Central External Connection Gateway
 * Toda chamada externa passa por este gateway.
 * Céu executa; o gateway protege a fronteira externa.
 * TEST usa exclusivamente testExecute; PROD exige aprovação explícita.
 */
const ExternalRequest=typeof module==="object"&&module.exports
  ?require("./connection-contract")
  :(typeof window!=="undefined"?window.WordDarkExternalConnectionRequest:null);

class ExternalConnectionGateway {
  constructor({registry=null,logger=null,productionApproval=null,publicationPolicy=null}={}) {
    this.registry=registry||null;
    this.logger=logger||null;
    this.productionApproval=productionApproval;
    // Padrão seguro: publicação manual até existir autorização explícita do serviço confiável.
    this.publicationPolicy=publicationPolicy;
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
    let request;
    try{request=new ExternalRequest(source)}catch(error){return{success:false,status:"INVALID_EXTERNAL_REQUEST",errors:[String(error?.message||error)]};}
    const validation=request.validate();
    if(!validation.valid)return{success:false,status:"INVALID_EXTERNAL_REQUEST",errors:validation.errors};
    return{success:true,request};
  }

  async execute(source={}) {
    const built=this.createRequest(source);
    if(!built.success)return built;
    const request=built.request;
    const requestData=request.toJSON();

    // Publicação automática é opt-in. Sem política autorizadora, a saída é sempre manual.
    const publicationActions=new Set(["CONTENT_PUBLISH","CONTENT_UNPUBLISH","CONTENT_SCHEDULE"]);
    const isPublicationAction=publicationActions.has(String(request.action||"").toUpperCase())||publicationActions.has(String(request.capability||"").toUpperCase());
    if(isPublicationAction){
      if(typeof this.publicationPolicy!=="function"){
        return{success:false,status:"MANUAL_ACTION_REQUIRED",stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId,providerId:request.providerId,manualActionRequired:true,reason:"Publicação automática ainda não foi habilitada; o conteúdo pode ser publicado manualmente."};
      }
      let publicationAuthorization;
      try{publicationAuthorization=await this.publicationPolicy(structuredClone(requestData));}
      catch(error){return{success:false,status:"PUBLICATION_AUTHORIZATION_FAILED",stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId,reason:String(error?.message||error)};}
      if(!publicationAuthorization||publicationAuthorization.allowed!==true||publicationAuthorization.mode!=="AUTOMATIC"||publicationAuthorization.serverAuthorized!==true){
        return{success:false,status:"MANUAL_ACTION_REQUIRED",stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId,providerId:request.providerId,manualActionRequired:true,reason:publicationAuthorization?.reason||"O serviço confiável não autorizou a publicação automática; use o fluxo manual."};
      }
    }

    // Falha fechada: ambiente desconhecido nunca alcança adapter externo.
    if(request.environment==="PROD") {
      if(typeof this.productionApproval!=="function")return{success:false,status:"PROD_APPROVAL_REQUIRED",stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId};
      let approval;
      try{approval=await this.productionApproval(structuredClone(requestData));}
      catch(error){return{success:false,status:"PROD_APPROVAL_FAILED",stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId,reason:String(error?.message||error)};}
      if(!approval||approval.allowed!==true)return{success:false,status:approval?.status||"PROD_NOT_AUTHORIZED",stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId,reason:approval?.reason||"A aprovação de produção não foi concedida."};
    }

    if(!this.registry)return{success:false,status:"CONNECTION_REGISTRY_UNAVAILABLE",operationId:request.operationId};
    // Não reduzir uma capacidade de alto impacto a outra mais fraca.
    const access=this.registry.authorizeContext(request.providerId,request.accountId,request.capability);
    if(!access.allowed)return{success:false,status:access.status,stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId,providerId:request.providerId,accountId:request.accountId,capability:request.capability};

    const adapter=this.adapters.get(request.providerId);
    if(!adapter)return{
      success:false,status:"WAITING_EXTERNAL_CONNECTION",stage:"CENTRAL_DE_CONEXOES",
      operationId:request.operationId,providerId:request.providerId,
      reason:"Adapter externo ainda não conectado. A ponta operacional está pronta."
    };

    const simulated=request.environment==="TEST";
    const execute=simulated?adapter.testExecute:adapter.execute;
    if(typeof execute!=="function")return{
      success:false,status:simulated?"TEST_ADAPTER_UNAVAILABLE":"PROD_ADAPTER_UNAVAILABLE",
      stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId,providerId:request.providerId,
      reason:simulated?"O adapter não possui caminho de simulação; nenhuma chamada real foi feita.":"O adapter de produção não está disponível."
    };

    try{
      this.logger?.log?.("EXTERNAL_CONNECTION_EXECUTION_STARTED",{...requestData,payload:{redacted:true},environment:request.environment});
      const credential=this.registry.getRuntimeCredential(request.providerId,request.accountId);
      const context={account:structuredClone(access.account),credential,environment:request.environment,simulation:simulated};
      const result=await execute.call(adapter,structuredClone(requestData),context);
      this.logger?.log?.("EXTERNAL_CONNECTION_EXECUTION_FINISHED",{request:{...requestData,payload:{redacted:true}},status:result?.status||null,success:result?.success!==false});
      return{success:result?.success!==false,status:result?.status||(simulated?"TEST_EXECUTED":"EXTERNAL_EXECUTED"),operationId:request.operationId,providerId:request.providerId,accountId:request.accountId,environment:request.environment,result};
    }catch(error){
      this.logger?.log?.("EXTERNAL_CONNECTION_EXECUTION_FAILED",{request:{...requestData,payload:{redacted:true}},environment:request.environment,error:String(error?.message||error)});
      return{success:false,status:"EXTERNAL_EXECUTION_FAILED",stage:"CENTRAL_DE_CONEXOES",operationId:request.operationId,providerId:request.providerId,reason:error?.message||"Falha na conexão externa."};
    }
  }

  getStatus(){return{status:this.status,adapters:[...this.adapters.keys()],adapterCount:this.adapters.size,productionApprovalConfigured:typeof this.productionApproval==="function",automaticPublicationConfigured:typeof this.publicationPolicy==="function"};}
}
if(typeof window!=="undefined")window.ExternalConnectionGateway=ExternalConnectionGateway;
if(typeof module!=="undefined"&&module.exports)module.exports=ExternalConnectionGateway;
