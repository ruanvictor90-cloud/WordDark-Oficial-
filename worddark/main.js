import { WordDarkRuntime } from "./core-central/runtime.js";
import { CentralWorld } from "./core-central/central-do-mundo.js";
import { DarkFactory } from "../ceu/dark-factory/factory.js";
import { FactoryExecutors, registerDefaultContentExecutors } from "../ceu/dark-factory/executors.js";
import { Marketing } from "../ceu/marketing/index.js";
import { CentralLibrary } from "./biblioteca/index.js";
import { Security } from "./seguranca/index.js";
import { CentralFinance } from "./financeiro-central/index.js";
import { createWorldCreation } from "./criacao-do-mundo/index.js";

export function createWordDarkWorld(){
 const central=new CentralWorld();
 const runtime=new WordDarkRuntime({central});
 const library=new CentralLibrary();
 const security=new Security();
 const finance=new CentralFinance();
 const creation=createWorldCreation({runtime,library,security});
 central.creation=creation;

 const factory=new DarkFactory();
 const executors=new FactoryExecutors();
 registerDefaultContentExecutors(executors);
 factory.attachExecutors(executors);
 for(const executor of executors.list()) runtime.registerCapability({id:executor.id,name:executor.name,owner:"DARK-FACTORY",layer:"CEU",handler:(op,ctx)=>executors.execute(executor.id,op,ctx),metadata:{type:"FACTORY_EXECUTOR",factory:"DARK-FACTORY"}});
 runtime.registerModule({id:factory.id,name:factory.id,owner:factory.id,layer:"CEU",handle:op=>factory.handle(op)});
 runtime.registerCapability({id:factory.id,name:"Dark Factory",owner:factory.id,layer:"CEU",handler:op=>factory.handle(op),metadata:{type:"FACTORY"}});

 const marketing=new Marketing();
 runtime.registerModule({id:marketing.id,name:marketing.id,owner:marketing.id,layer:"CEU",handle:op=>marketing.handle(op)});
 runtime.registerCapability({id:marketing.id,name:"Marketing",owner:marketing.id,layer:"CEU",handler:op=>marketing.handle(op),metadata:{type:"SECTOR"}});

 runtime.registerGate({gateId:"DARK-FACTORY-GATE",ownerId:"DARK-FACTORY",layer:"CEU"});
 runtime.registerGate({gateId:"MARKETING-GATE",ownerId:"MARKETING",layer:"CEU"});
 runtime.registerGate({gateId:"WORLD-GATE",ownerId:"WORDDARK",layer:"CENTRAL"});
 return {runtime,central,creation,factory,marketing,library,security,finance};
}
export function worldStatus(world){return {runtime:world.runtime.status(),factory:world.factory.status(),marketing:world.marketing.status(),library:world.library.list().length,financeAccounts:world.finance.accounts.size,creation:world.creation.status()};}
