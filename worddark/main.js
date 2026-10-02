import { WordDarkRuntime } from "./core-central/runtime.js";
import { CentralWorld } from "./core-central/central-do-mundo.js";
import { DarkFactory } from "../ceu/dark-factory/factory.js";
import { FactoryExecutors, registerDefaultContentExecutors } from "../ceu/dark-factory/executors.js";
import { Marketing } from "../ceu/marketing/index.js";
import { CentralLibrary, LocalLibrary } from "./biblioteca/index.js";
import { SectorLibraryManager } from "./biblioteca/knowledge-flow.js";
import { Security } from "./seguranca/index.js";
import { CentralFinance } from "./financeiro-central/index.js";
import { createWorldCreation } from "./criacao-do-mundo/index.js";
import { AuditLog } from "./auditoria/index.js";
import { PermissionManager } from "./permissoes/index.js";
import { ProductionRights } from "./direitos-producoes/index.js";
import { MemoryPersistence } from "./core-central/persistence.js";
import { VersionHistory } from "./core-central/versioning.js";
import { ErrorRecovery } from "./core-central/error-recovery.js";
import { EmergencyStop } from "./core-central/emergency-stop.js";
import { OperationDiagnostics } from "./core-central/diagnostics.js";
import { OperationRegistry } from "./core-central/operation-registry.js";
import { CommunicationBus } from "./core-central/communication.js";
import { IntegrationRegistry } from "./core-central/integrations.js";
import { createExternalConnectionHub } from "./core-central/external-connection-hub.js";
import { createTerra } from "../terra/index.js";
import { ChannelOperationContract } from "./core-central/channel-contract.js";
import { AccountManager } from "./core-central/account-manager.js";
import { WorldStructureClassifier } from "./core-central/world-structure.js";
import { AccountOperationsManager } from "./core-central/account-operations-manager.js";
import { CentralOrchestrator } from "./core-central/central-orchestrator.js";
import { CentralAutomationController } from "./core-central/central-automation-controller.js";
import { ContractRegistry } from "./core-central/contract-registry.js";
import { DependencyMap } from "./core-central/dependency-map.js";
import { AutonomyPolicy } from "./core-central/capability-policy.js";
import { RollbackManager } from "./core-central/rollback-manager.js";
import { LifecycleManager } from "./core-central/lifecycle-manager.js";
import { WorldCouncil } from "./core-central/council.js";
import { WorldSchool } from "./core-central/school.js";
import { ContentLifecycle } from "./core-central/content-lifecycle.js";
import { PostingLine } from "./core-central/posting-line.js";
import { CentralControl } from "./core-central/central-control.js";

export function createWordDarkWorld(){
 const central=new CentralWorld();
 const channelContract=new ChannelOperationContract({id:"CHANNEL-OPERATION-CONTRACT",name:"Central de Operações"});
 const accountManager=new AccountManager({accountId:"ACCOUNT-LOCAL",accountName:"Minha Conta"});
 const structureClassifier=new WorldStructureClassifier();
 const accountOperations=new AccountOperationsManager({accountManager});
 const audit=new AuditLog();
 const emergencyStop=new EmergencyStop();
 const automation=new CentralAutomationController({accountManager,emergencyStop});
 const contractRegistry=new ContractRegistry({audit});
 const dependencyMap=new DependencyMap({audit});
 const rollback=new RollbackManager({audit});
 const lifecycle=new LifecycleManager({dependencyMap,audit});
 const runtime=new WordDarkRuntime({central,emergencyStop,contractRegistry});
 const centralOrchestrator=new CentralOrchestrator({centralManager:accountOperations,runtime,automation});
 const library=new CentralLibrary();
 const security=new Security({audit});
 const finance=new CentralFinance();
 const permissions=new PermissionManager();
 const autonomy=new AutonomyPolicy({permissionManager:permissions,emergencyStop,audit});
 const rights=new ProductionRights();
 const persistence=new MemoryPersistence();
 const versions=new VersionHistory();
 const errors=new ErrorRecovery();
 const diagnostics=new OperationDiagnostics({registry:runtime.registry});
 const localLibrary=new LocalLibrary({libraryId:"WORDDARK-LOCAL-CORE",ownerId:"WORDDARK",metadata:{scope:"CORE_OPERATIONAL_MEMORY"}});
 const sectorLibraries=new SectorLibraryManager({centralLibrary:library,audit});
 const council=new WorldCouncil({audit,sectorLibraries,centralLibrary:library});
 const school=new WorldSchool({sectorLibraries,centralLibrary:library,audit});
 school.registerExternalSource({id:"WORLD-WEB",name:"Conhecimento Externo",type:"WEB_SEARCH",status:"AUTHORIZATION_REQUIRED"});
 school.registerExternalSource({id:"WORLD-TRENDS",name:"Sinais de Tendência",type:"TREND_MONITOR",status:"AUTHORIZATION_REQUIRED"});
 const contentLifecycle=new ContentLifecycle({audit});
 const postingLine=new PostingLine({audit});
 const centralControl=new CentralControl({council,school,postingLine,automation,audit});
 sectorLibraries.registerSector({sectorId:"WORDDARK-CORE",ownerId:"WORDDARK",metadata:{role:"CORE_OPERATIONAL_MEMORY"}});
 const operationRegistry=new OperationRegistry({localLibrary,centralLibrary:library,audit});
 const communication=new CommunicationBus({road:runtime.road,registry:operationRegistry,contractRegistry});
 const integrations=new IntegrationRegistry({audit});
 const externalConnections=createExternalConnectionHub({integrationRegistry:integrations,audit});
 const {terra}=createTerra({runtime});
 const creation=createWorldCreation({runtime,library,security});
 central.creation=creation;

 const factory=new DarkFactory();
 const executors=new FactoryExecutors();
 registerDefaultContentExecutors(executors);
 factory.attachExecutors(executors);
 factory.attachRuntime(runtime);
 for(const executor of executors.list()) runtime.registerCapability({id:executor.id,name:executor.name,owner:"DARK-FACTORY",layer:"CEU",handler:(op,ctx)=>executors.execute(executor.id,op,ctx),metadata:{type:"FACTORY_EXECUTOR",factory:"DARK-FACTORY"}});
 runtime.registerModule({id:factory.id,name:factory.id,owner:factory.id,layer:"CEU",handle:op=>factory.handle(op)});
 runtime.registerCapability({id:factory.id,name:"Dark Factory",owner:factory.id,layer:"CEU",handler:op=>factory.handle(op),metadata:{type:"SKY_DOMAIN",structure:"DOMAIN>REGION>NUCLEUS>DISTRICT"}});

 const marketing=new Marketing();
 runtime.registerModule({id:marketing.id,name:marketing.id,owner:marketing.id,layer:"CEU",handle:op=>marketing.handle(op)});
 runtime.registerCapability({id:marketing.id,name:"Marketing",owner:marketing.id,layer:"CEU",handler:op=>marketing.handle(op),metadata:{type:"SKY_DOMAIN",structure:"DOMAIN>REGION>NUCLEUS>DISTRICT"}});

 runtime.registerGate({gateId:"DARK-FACTORY-GATE",ownerId:"DARK-FACTORY",layer:"CEU"});
 runtime.registerGate({gateId:"MARKETING-GATE",ownerId:"MARKETING",layer:"CEU"});
 runtime.registerGate({gateId:"WORLD-GATE",ownerId:"WORDDARK",layer:"CENTRAL"});
 dependencyMap.add({module:"CENTRAL-ORCHESTRATOR",dependsOn:"CENTRAL-AUTOMATION-CONTROLLER",reason:"AUTOMATION_DISPATCH"});
 dependencyMap.add({module:"CENTRAL-ORCHESTRATOR",dependsOn:"WORDDARK-RUNTIME",reason:"OPERATION_EXECUTION"});
 dependencyMap.add({module:"CENTRAL-AUTOMATION-CONTROLLER",dependsOn:"EMERGENCY-STOP",reason:"SAFETY_GATE"});
 autonomy.set("CENTRAL-AUTOMATION-CONTROLLER",1,{allowedActions:["QUEUE","APPROVE","DISPATCH"],requiresApproval:true});
 autonomy.set("DARK-FACTORY",1,{allowedActions:["EXECUTE"],requiresApproval:true});
 autonomy.set("MARKETING",1,{allowedActions:["EXECUTE"],requiresApproval:true});
 return {
  runtime,central,creation,factory,marketing,terra,channelContract,library,localLibrary,sectorLibraries,security,finance,
  operationRegistry,communication,contractRegistry,dependencyMap,autonomy,rollback,lifecycle,integrations,externalConnections,accountManager,accountOperations,centralOrchestrator,structureClassifier,automation,council,school,contentLifecycle,postingLine,centralControl,
  audit,permissions,rights,persistence,versions,errors,emergencyStop,diagnostics
 };
}
export function worldStatus(world){return {runtime:world.runtime.status(),terra:world.terra.status(),factory:world.factory.status(),marketing:world.marketing.status(),library:world.library.list().length,financeAccounts:world.finance.accounts.size,creation:world.creation.status(),structure:world.structureClassifier.status(),central:world.centralOrchestrator.status(),automation:world.automation.status(),emergencyStop:world.emergencyStop.globalStatus,externalConnections:world.externalConnections.status(),centralControl:world.centralControl.status(),contentLifecycle:world.contentLifecycle.list().length};}
