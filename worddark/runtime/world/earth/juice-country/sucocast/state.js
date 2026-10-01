/* WordDark — SucoCast State · SC-001 */

class SucoCastState {
  constructor(identity) {
    this.identity = identity;
    this.status = "ONLINE";
    this.version = "SC-0.3";
    this.parentId = "world/earth/juice-country";

    this.core = new SucoCastCore({
      identity: this.identity,
      version: "SC-CORE-0.2",
      configuration: {
        externalOperations: true,
        credentialProvider: "FUTURE_SECURE_BACKEND"
      }
    });

    this.permissionManager = new SucoCastPermissionManager();
    this.eventLog = new SucoCastEventLog();
    this.integrationManager = new SucoCastIntegrationManager();
    this.youtubeAdapter = new SucoCastYouTubeAdapter();
    this.instagramAdapter = new SucoCastInstagramAdapter();
    this.tiktokAdapter = new SucoCastTikTokAdapter();
    this.websiteAdapter = new SucoCastWebsiteAdapter();
    this.externalAppAdapter = new SucoCastExternalAppAdapter();

    [
      this.youtubeAdapter,
      this.instagramAdapter,
      this.tiktokAdapter,
      this.websiteAdapter,
      this.externalAppAdapter
    ].forEach((adapter) => {
      this.integrationManager.register(adapter);
      this.core.registerIntegration(adapter);
    });

    this.registerCoreOperations();

    this.road = {
      outbound: "ROUTE-SUCOCAST-DARKFACTORY",
      inbound: "ROUTE-DARKFACTORY-SUCOCAST"
    };

    this.sectors = [
      {
        sectorId:"SC-SEC-ADM", name:"Administração", status:"ONLINE",
        operations:[
          {operationId:"SC-OP-ADM-001",name:"Receber solicitação",status:"READY"},
          {operationId:"SC-OP-ADM-002",name:"Autorizar operação",status:"READY"},
          {operationId:"SC-OP-ADM-003",name:"Registrar resultado",status:"READY"}
        ]
      },
      {
        sectorId:"SC-SEC-CON", name:"Conteúdo", status:"ONLINE",
        operations:[
          {operationId:"SC-OP-CON-001",name:"Definir pauta",status:"READY"},
          {operationId:"SC-OP-CON-002",name:"Definir requerimento de produção",status:"READY"}
        ]
      },
      {
        sectorId:"SC-SEC-PRO", name:"Produção", status:"ONLINE",
        operations:[
          {operationId:"SC-OP-PRO-001",name:"Solicitar produção",status:"READY"},
          {operationId:"SC-OP-PRO-002",name:"Receber material",status:"READY"},
          {operationId:"SC-OP-PRO-003",name:"Validar material",status:"READY"}
        ]
      },
      {
        sectorId:"SC-SEC-DIS", name:"Distribuição", status:"ONLINE",
        operations:[
          {operationId:"SC-OP-DIS-001",name:"Preparar publicação",status:"READY"},
          {operationId:"SC-OP-DIS-002",name:"Registrar publicação",status:"READY"},
          {operationId:"SC-OP-DIS-003",name:"PUBLICAR_CONTEUDO",status:"READY"}
        ]
      },
      {
        sectorId:"SC-SEC-INT", name:"Inteligência", status:"ONLINE",
        operations:[
          {operationId:"SC-OP-INT-001",name:"Registrar métricas",status:"READY"},
          {operationId:"SC-OP-INT-002",name:"Gerar aprendizado",status:"READY"}
        ]
      },
      {
        sectorId:"SC-SEC-SEG", name:"Segurança", status:"ONLINE",
        operations:[
          {operationId:"SC-OP-SEG-001",name:"Validar identidade",status:"READY"},
          {operationId:"SC-OP-SEG-002",name:"Registrar auditoria",status:"READY"}
        ]
      }
    ];
  }

  registerCoreOperations() {
    const publicationIntegrations = [
      "SC-INTEGRATION-YOUTUBE",
      "SC-INTEGRATION-INSTAGRAM",
      "SC-INTEGRATION-TIKTOK",
      "SC-INTEGRATION-WEBSITE",
      "SC-INTEGRATION-EXTERNAL"
    ];

    this.core.registerOperation({
      operationId:"SC-OP-PRO-004",
      name:"SOLICITAR_PRODUCAO",
      sectorId:"SC-SEC-PRO",
      capability:"content.produce",
      action:"request",
      compatibleIntegrations:[],
      status:"REGISTERED"
    });

    this.core.registerOperation({
      operationId:"SC-OP-DIS-003",
      name:"PUBLICAR_CONTEUDO",
      sectorId:"SC-SEC-DIS",
      capability:"content.publish",
      action:"publish",
      compatibleIntegrations:publicationIntegrations,
      status:"REGISTERED"
    });

    this.core.registerOperation({
      operationId:"SC-OP-DIS-004",
      name:"REGISTRAR_PUBLICACAO",
      sectorId:"SC-SEC-DIS",
      capability:"publication.record",
      action:"record",
      compatibleIntegrations:[],
      status:"REGISTERED"
    });
  }

  publishContent(integrationId, content) {
    const operationId="SC-OP-DIS-003";
    const actor=this.identity.identityId;
    const integration=this.core.getIntegration(integrationId);

    this.eventLog.add("CONTENT_PUBLICATION_REQUESTED",{
      actor,operationId,integrationId
    });

    if (!integration) {
      return {success:false,status:"FAILED",reason:"Integração não encontrada.",operationId,integrationId};
    }

    if (!this.permissionManager.can(actor,"content.publish")) {
      this.eventLog.add("CONTENT_PUBLICATION_REJECTED",{actor,capability:"content.publish",integrationId});
      return {success:false,status:"REJECTED",reason:"Capacidade não autorizada: content.publish",operationId,integrationId};
    }

    const operation=this.core.getOperation(operationId);
    if (!operation.compatibleIntegrations.includes(integrationId)) {
      return {success:false,status:"REJECTED",reason:"Integração incompatível com PUBLICAR_CONTEUDO.",operationId,integrationId};
    }

    const result=this.integrationManager.execute(integrationId,operation.action,content || {});
    this.eventLog.add(result.success ? "CONTENT_PUBLICATION_CONFIRMED":"CONTENT_PUBLICATION_FAILED",{
      actor,integrationId,result
    });

    return Object.assign({operationId,integrationId},result);
  }

  simulateYouTubePublication(content) {
    return this.publishContent("SC-INTEGRATION-YOUTUBE",content);
  }

  requestProductionThroughFactory(communication, content, actor, requirements) {
    if (!communication) {
      return {success:false,status:"REJECTED",reason:"Communication é obrigatória."};
    }

    const payload = {
      contentId: content && content.contentId ? content.contentId : null,
      title: content && content.title ? content.title : null,
      type: content && content.type ? content.type : "VIDEO",
      body: content && content.body ? content.body : null,
      asset: content && content.asset ? content.asset : null,
      metadata: content && content.metadata ? content.metadata : null,
      requirements: requirements || null
    };

    const request=new DarkFactoryRequest({
      requester:actor || this.identity.identityId,
      origin:"state/sucocast",
      destination:"darkfactory",
      task:"Produzir e editar conteúdo conforme requerimento do SucoCast",
      taskType:"content.produce",
      permission:"approved",
      payload:payload
    });

    request.authorize();
    const factoryResponse=communication.send(request);

    this.eventLog.add(
      factoryResponse.success ? "FACTORY_PRODUCTION_REQUESTED":"FACTORY_PRODUCTION_REJECTED",
      {requestId:request.id,result:factoryResponse}
    );

    if (!factoryResponse.success) {
      return {
        success:false,
        status:factoryResponse.status || "REJECTED",
        requestId:request.id,
        factoryResponse
      };
    }

    const factoryResult=factoryResponse.result || {};
    this.eventLog.add("FACTORY_PRODUCTION_RETURNED",{
      requestId:request.id,
      productionId:factoryResult.productionId || null,
      contentId:factoryResult.contentId || payload.contentId
    });

    return {
      success:true,
      status:factoryResult.status || "PRODUCTION_ACCEPTED",
      requestId:request.id,
      requestMessageId:factoryResponse.requestMessageId || null,
      responseMessageId:factoryResponse.responseEnvelope
        ? factoryResponse.responseEnvelope.messageId : null,
      productionId:factoryResult.productionId || null,
      contentId:factoryResult.contentId || payload.contentId,
      producedContent:factoryResult
    };
  }

  createTestRequest() {
    const request=new DarkFactoryRequest({
      requester:this.identity.identityId,
      origin:"state/sucocast",
      destination:"darkfactory",
      task:"Teste operacional do Estado SucoCast",
      taskType:"test",
      permission:"approved"
    });
    request.authorize();
    return request;
  }

  getSector(sectorId) {
    return this.sectors.find((sector)=>sector.sectorId===sectorId) || null;
  }

  listSectors() {
    return this.sectors.map((sector)=>({
      sectorId:sector.sectorId,
      name:sector.name,
      status:sector.status,
      operationCount:sector.operations.length
    }));
  }

  getOperationCount() {
    return this.sectors.reduce((total,sector)=>total+sector.operations.length,0);
  }

  getStatus() {
    return {
      identityId:this.identity.identityId,
      name:this.identity.name,
      version:this.version,
      status:this.status,
      parentId:this.parentId,
      sectorCount:this.sectors.length,
      operationCount:this.getOperationCount()
    };
  }
}

if(typeof window!=="undefined") window.SucoCastState=SucoCastState;
if(typeof module!=="undefined" && module.exports) module.exports=SucoCastState;
