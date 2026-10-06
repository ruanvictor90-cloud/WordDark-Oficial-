const assert=require("assert");

const WordDarkOperationEngine=require("./operation-engine");
const WordDarkOperationCoordinator=require("./operation-coordinator");
const WordDarkProductionEngine=require("./production-engine");
const Planner=require("./production-planner");
const Center=require("./operation-center");
const CompanyRegistry=require("./company-registry").WordDarkCompanyRegistry;
const {registerCoreCompanies}=require("./company-registry-seed");
const {WordDarkCompanyIntentRouter}=require("./company-intent-router");
const Road=require("./road");
const Route=require("../contracts/route");
const Communication=require("./communication");
const OperationRegistry=require("./operation-registry");
const {WordDarkLocalLibrary:LocalLibrary}=require("../library/local-library");
const {WordDarkCentralLibrary:CentralLibrary}=require("../library/central-library");
const Memory=require("./operational-memory");
const EnvironmentGuard=require("./environment-guard");
const Environment=require("../contracts/environment");
const EmergencyStop=require("./emergency-stop-manager");
const Security=require("../security/security-manager");
const Identity=require("../contracts/identity");
const Access=require("../contracts/access");
const DarkFactory=require("../sky/darkfactory/core/factory");
const DarkFactoryBridge=require("../sky/darkfactory/core/operation-bridge");
const DarkFactoryRequest=require("../sky/darkfactory/core/request");
const ServiceRegistry=require("../sky/darkfactory/core/service-registry");
const ContentExecutor=require("../sky/darkfactory/core/content-publication-executor");
const ContentModules=require("../sky/darkfactory/core/content-module-registry");
const ContentFactory=require("../sky/darkfactory/core/content-factory");

global.WordDarkCapabilityCatalog=require("./capability-catalog");
global.WordDarkRoute=Route;
global.DarkFactoryRequest=DarkFactoryRequest;

const road=new Road();
const registry=new CompanyRegistry();
registerCoreCompanies(registry);
const router=new WordDarkCompanyIntentRouter({companyRegistry:registry});

const security=new Security();
const identity=new Identity({identityId:"OP-001-RUAN",type:"UNIT",parentId:"ADM-RUAN",metadata:{name:"OP-001"}});
security.registerIdentity(identity);
security.grant(new Access({
  identityId:"OP-001-RUAN",
  capability:"CONTENT_CREATE",
  action:"request",
  environment:"TEST",
  scope:"world/sky/darkfactory"
}));

const localLibrary=new LocalLibrary({libraryId:"OP001-LOCAL",ownerId:"OP-001-RUAN"});
const centralLibrary=new CentralLibrary({libraryId:"OP001-CENTRAL"});
const memory=new Memory({library:centralLibrary});
const opRegistry=new OperationRegistry({localLibrary,centralLibrary,operationalMemory:memory});
const guard=new EnvironmentGuard({
  environments:{
    TEST:new Environment({name:"TEST"}),
    PROD:new Environment({name:"PROD"})
  }
});
const emergencyStop=new EmergencyStop();

const services=new ServiceRegistry();
const executor=new ContentExecutor();
services.register({
  serviceId:"DF-SERVICE-CONTENT-PRODUCE",
  name:"Content Production",
  type:"content.produce",
  status:"READY",
  executor
});

const modules=new ContentModules();
["SCRIPT","ASSET","EDIT","AUDIO","RENDER","VALIDATE"].forEach(id=>{
  modules.register(id,async context=>({
    success:true,
    status:"MODULE_COMPLETED",
    module:id,
    contentId:context.operation.contentId
  }));
});

const contentFactory=new ContentFactory({executor,moduleRegistry:modules});
const factory=new DarkFactory({registry:services,contentFactory});
const communication=new Communication({road,registry:opRegistry});
const bridge=new DarkFactoryBridge({factory,communication});

const engine=new WordDarkOperationEngine({
  security,
  environmentGuard:guard,
  registry:opRegistry,
  emergencyStop,
  operationalMemory:memory,
  route:op=>bridge.route(op),
  execute:op=>bridge.execute(op)
});

const coordinator=new WordDarkOperationCoordinator({
  engine,
  road,
  companyRouter:router
});

const productionEngine=new WordDarkProductionEngine({
  operationCoordinator:coordinator,
  planner:Planner
});

const center=new Center({
  operationCoordinator:coordinator,
  productionEngine,
  planner:Planner,
  requesterId:"OP-001-RUAN",
  defaultOrigin:"world/earth/official",
  defaultEnvironment:"TEST"
});

const result=center.submit({
  productionId:"OP-001",
  requesterId:"OP-001-RUAN",
  originId:"world/earth/official",
  clientId:"WORDDARK-OFFICIAL",
  goal:"Produzir o primeiro conteúdo oficial do WordDark",
  resourceId:"WORDDARK-CONTENT-001",
  requirements:{
    content:true,
    contentId:"WORDDARK-CONTENT-001",
    format:"VIDEO"
  },
  options:{
    environment:"TEST",
    parameters:{
      content:true,
      contentId:"WORDDARK-CONTENT-001",
      title:"O que é o WordDark?",
      type:"VIDEO",
      task:"Produzir o primeiro conteúdo oficial do WordDark"
    }
  }
});

assert.strictEqual(result.success,true,JSON.stringify(result,null,2));
assert.strictEqual(result.status,"COMPLETED");
assert.strictEqual(result.productionId,"OP-001");
assert.ok(road.listRoutes().length>=2,"As rotas de ida e retorno deveriam existir.");
assert.ok(road.listDeliveries().length>=2,"A Rodovia deveria transportar ida e retorno.");
assert.strictEqual(communication.getStatus().pending,0,"Não pode restar pedido pendente.");
assert.ok(opRegistry.list().length>0,"A operação deveria ficar registrada.");
assert.ok(centralLibrary.count()>0,"O circuito deveria registrar memória na biblioteca central.");
console.log("OP-001 integration: ok");
