import { WordDarkRuntime } from "./core-central/runtime.js";
import { DarkFactory } from "../ceu/dark-factory/factory.js";
import { FactoryExecutors, registerDefaultContentExecutors } from "../ceu/dark-factory/executors.js";
import { Marketing } from "../ceu/marketing/index.js";
import { CentralLibrary } from "./biblioteca/index.js";
import { Security } from "./seguranca/index.js";
import { CentralFinance } from "./financeiro-central/index.js";

export function createWordDarkWorld(){
  const runtime=new WordDarkRuntime();
  const library=new CentralLibrary();
  const security=new Security();
  const finance=new CentralFinance();
  const factory=new DarkFactory();
  factory.executors=new FactoryExecutors();
  registerDefaultContentExecutors(factory.executors);
  for(const executor of factory.executors.list()) runtime.registerModule({id:executor.id,owner:"DARK-FACTORY",layer:"CEU",handle:op=>factory.executors.execute(executor.id,op)});
  const marketing=new Marketing();
  runtime.registerModule({id:"MARKETING",owner:"MARKETING",layer:"CEU",handle:op=>marketing.handle(op)});
  runtime.registerGate({gateId:"DARK-FACTORY-GATE",ownerId:"DARK-FACTORY",layer:"CEU"});
  runtime.registerGate({gateId:"MARKETING-GATE",ownerId:"MARKETING",layer:"CEU"});
  return {runtime,factory,marketing,library,security,finance};
}

export function worldStatus(world){return {runtime:world.runtime.status(),factory:world.factory.status(),marketing:world.marketing.status(),library:world.library.list().length,financeAccounts:world.finance.accounts.size};}
