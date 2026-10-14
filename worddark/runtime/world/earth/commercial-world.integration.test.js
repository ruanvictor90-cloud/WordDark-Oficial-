const assert = require("node:assert/strict");
const { createCommercialEngine } = require("./commercial-engine.js");

async function main() {
  const { createCommercialOrderOperationBridge } = await import("../core/commercial-order-operation-bridge.js");
  const { createEarthCommercialIntakeAdapter } = await import("../core/earth-commercial-intake-adapter.js");
  const { createEarthEngine } = require("./earth-engine.js");

  const Road = require("../core/road.js");
  const CompanyRegistry = require("../core/company-registry.js").WordDarkCompanyRegistry;
  const { registerCoreCompanies } = require("../core/company-registry-seed.js");
  const { WordDarkCompanyIntentRouter } = require("../core/company-intent-router.js");
  const Security = require("../security/security-manager.js");
  const Identity = require("../contracts/identity.js");
  const Access = require("../contracts/access.js");
  const OperationEngine = require("../core/operation-engine.js");
  const OperationCoordinator = require("../core/operation-coordinator.js");
  const Center = require("../core/operation-center.js");
  const OperationRegistry = require("../core/operation-registry.js").WordDarkOperationRegistry;
  const LocalLibrary = require("../library/local-library.js").WordDarkLocalLibrary;
  const CentralLibrary = require("../library/central-library.js").WordDarkCentralLibrary;
  const Memory = require("../core/operational-memory.js");
  const EnvironmentGuard = require("../core/environment-guard.js");
  const Environment = require("../contracts/environment.js");
  const EmergencyStop = require("../core/emergency-stop-manager.js");
  const Route = require("../contracts/route.js");
  const Communication = require("../core/communication.js");
  const DarkFactory = require("../sky/darkfactory/core/factory.js");
  const DarkFactoryBridge = require("../sky/darkfactory/core/operation-bridge.js");
  const DarkFactoryRequest = require("../sky/darkfactory/core/request.js");
  const RequestClass = typeof DarkFactoryRequest === "function" ? DarkFactoryRequest : DarkFactoryRequest.DarkFactoryRequest;
  const ServiceRegistry = require("../sky/darkfactory/core/service-registry.js");
  const ContentExecutor = require("../sky/darkfactory/core/content-publication-executor.js");
  const ContentModules = require("../sky/darkfactory/core/content-module-registry.js");
  const ContentFactory = require("../sky/darkfactory/core/content-factory.js");

  global.WordDarkCapabilityCatalog = require("../core/capability-catalog.js");
  global.WordDarkRoute = Route;
  global.DarkFactoryRequest = RequestClass;

  const actorId = "COMMERCIAL-INTEGRATION-OPERATOR";
  const road = new Road();
  const companies = new CompanyRegistry();
  registerCoreCompanies(companies);
  const router = new WordDarkCompanyIntentRouter({ companyRegistry: companies });
  const security = new Security();
  security.registerIdentity(new Identity({ identityId: actorId, type: "UNIT", metadata: { name: "commercial-integration-test" } }));
  security.grant(new Access({
    identityId: actorId,
    capability: "CONTENT_CREATE",
    action: "request",
    environment: "TEST",
    scope: "WD-COMP-DARK-FACTORY"
  }));

  const localLibrary = new LocalLibrary({ libraryId: "COMMERCIAL-LOCAL", ownerId: actorId });
  const centralLibrary = new CentralLibrary({ libraryId: "COMMERCIAL-CENTRAL" });
  const memory = new Memory({ library: centralLibrary });
  const operationRegistry = new OperationRegistry({ localLibrary, centralLibrary, operationalMemory: memory });
  const environmentGuard = new EnvironmentGuard({
    environments: { TEST: new Environment({ name: "TEST" }), PROD: new Environment({ name: "PROD" }) }
  });
  const emergencyStop = new EmergencyStop();
  const services = new ServiceRegistry();
  const executor = new ContentExecutor();
  services.register({
    serviceId: "DF-SERVICE-CONTENT-PRODUCE",
    name: "Content Production",
    type: "content.produce",
    status: "READY",
    executor
  });
  const modules = new ContentModules();
  ["SCRIPT", "ASSET", "EDIT", "AUDIO", "RENDER", "VALIDATE"].forEach(id => {
    modules.register(id, async context => ({
      success: true,
      status: "MODULE_COMPLETED",
      module: id,
      contentId: context.operation.contentId
    }));
  });
  const contentFactory = new ContentFactory({ executor, moduleRegistry: modules });
  const factory = new DarkFactory({ registry: services, contentFactory });
  const communication = new Communication({ road, registry: operationRegistry });
  const factoryBridge = new DarkFactoryBridge({ factory, communication, requestClass: RequestClass });
  const engine = new OperationEngine({
    security,
    environmentGuard,
    registry: operationRegistry,
    emergencyStop,
    operationalMemory: memory,
    route: operation => factoryBridge.route(operation),
    execute: operation => factoryBridge.execute(operation)
  });
  const coordinator = new OperationCoordinator({ engine, road, companyRouter: router });
  const center = new Center({
    operationCoordinator: coordinator,
    requesterId: actorId,
    defaultOrigin: "world/earth/commercial",
    defaultEnvironment: "TEST"
  });

  const commercial = createCommercialEngine({ companyId: "commercial-test", idFactory: (() => { let n = 0; return () => String(++n); })() });
  commercial.addCatalogItem({
    itemId: "offer-content-basic",
    name: "Pacote de conteúdo básico",
    category: "CONTENT",
    description: "Entrega manual para teste integrado",
    price: 75
  });

  const earth = createEarthEngine({ idFactory: () => "demand-commercial-integration" });
  const demand = earth.captureDemand({
    requester: "Cliente de demonstração",
    need: "Criar conteúdo para redes sociais",
    category: "CONTENT",
    budget: 100,
    recurrence: "ONE_TIME",
    businessContext: { source: "commercial-world.integration" }
  });
  const auditEvents = [];
  const idempotency = new Map();
  const idempotencyStore = {
    async executeOnce(key, callback) {
      if (idempotency.has(key)) return idempotency.get(key);
      const value = await callback();
      idempotency.set(key, value);
      return value;
    }
  };
  const intake = createEarthCommercialIntakeAdapter({
    earthEngine: earth,
    commercialEngine: commercial,
    authenticateOperator: async () => ({ authenticated: true, actorId, sessionId: "commercial-test-session" }),
    authorizeIntake: async () => ({ allowed: true }),
    resolveRequester: async source => ({ requesterId: "client-demo", name: source.requester, channel: "MANUAL" }),
    audit: async event => { auditEvents.push(event); },
    idempotencyStore,
    enabled: true
  });
  const intakeResult = await intake.intake({ requestId: "commercial-intake-request-1", demandId: demand.demandId });
  assert.equal(intakeResult.status, "LEAD_CREATED");
  const lead = commercial.getLead(intakeResult.leadId);
  assert.equal(lead.sourceDemandId, demand.demandId);
  assert.equal(lead.businessContext.source, "commercial-world.integration");
  assert.equal(earth.getDemand(demand.demandId).status, "LEAD_CREATED");

  const duplicateIntake = await intake.intake({ requestId: "commercial-intake-request-2", demandId: demand.demandId });
  assert.deepEqual(duplicateIntake, intakeResult);
  assert.equal(commercial.listLeads().length, 1);

  commercial.qualifyLead(lead.leadId, actorId);
  const proposal = commercial.createProposal({
    proposalId: "proposal-commercial-integration",
    leadId: lead.leadId,
    title: "Pacote de conteúdo básico",
    scope: "3 textos de publicação, 1 roteiro curto, 1 bio/descrição de perfil e 1 rodada de ajustes",
    amount: 75
  });
  commercial.decideProposal(proposal.proposalId, "ACCEPTED", "client-demo");
  const order = commercial.openOrder(proposal.proposalId);

  const coreSubmissions = [];
  const bridge = createCommercialOrderOperationBridge({
    commercialEngine: commercial,
    operationCenter: { submit(input) { const response = center.submit(input); coreSubmissions.push({ input, response }); return response; } },
    authenticateOperator: async () => ({ authenticated: true, actorId, sessionId: "commercial-test-session" }),
    authorizeDispatch: async ({ approvalId }) => ({ allowed: true, approved: true, approvalId }),
    resolveAction: async () => "CREATE_CONTENT",
    audit: async event => { auditEvents.push(event); },
    idempotencyStore,
    enabled: true
  });

  const result = await bridge.dispatch({
    requestId: "commercial-integration-request-1",
    orderId: order.orderId,
    approvalId: "commercial-integration-approval-1"
  });

  assert.equal(result.success, true, JSON.stringify({ result, coreSubmissions, coreOperations: operationRegistry.list() }, null, 2));
  assert.equal(result.environment, "TEST");
  assert.equal(result.dispatched, true);
  assert.ok(result.operationId, "A operação precisa ter ID rastreável.");
  assert.equal(result.orderStatus, "REVIEW", "Uma entrega concluída deve aguardar revisão humana.");
  assert.equal(commercial.getOrder(order.orderId).status, "REVIEW");
  assert.ok(road.listRoutes().length >= 2, "A Rodovia deve registrar rota de ida e retorno.");
  assert.ok(road.listDeliveries().length >= 2, "A Rodovia deve transportar a solicitação e o retorno.");
  assert.equal(communication.getStatus().pending, 0, "Não pode restar solicitação pendente.");
  assert.ok(operationRegistry.list().length > 0, "A operação deve ser registrada.");
  const coreOperation = operationRegistry.list().find(item => item.resourceId === order.orderId);
  assert.ok(coreOperation, "A operação central deve manter o vínculo com o pedido comercial.");
  assert.equal(coreOperation.clientId, "client-demo", "A identidade do cliente não pode ser perdida na tradução da linguagem universal.");
  assert.equal(coreOperation.context.source, "TERRA_COMMERCIAL_ORDER", "A origem comercial e a aprovação precisam acompanhar a operação.");
  assert.equal(coreOperation.context.approvalId, "commercial-integration-approval-1");
  assert.ok(centralLibrary.count() > 0, "A operação deve deixar registro na Biblioteca Central.");
  assert.ok(auditEvents.some(event => event.event === "COMMERCIAL_ORDER_DISPATCH_AUTHORIZED"));
  assert.ok(auditEvents.some(event => event.event === "COMMERCIAL_ORDER_CORE_ACCEPTED"));

  const duplicate = await bridge.dispatch({
    requestId: "commercial-integration-request-2",
    orderId: order.orderId,
    approvalId: "commercial-integration-approval-1"
  });
  assert.deepEqual(duplicate, result, "A repetição não pode criar uma segunda operação.");
  assert.equal(road.listDeliveries().length, 2, "A repetição não pode duplicar o transporte.");

  console.log("commercial-world.integration: OK");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
