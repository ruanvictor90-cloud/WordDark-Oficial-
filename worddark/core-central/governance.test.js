import assert from "node:assert/strict";
import { createWordDarkWorld } from "../main.js";
import { ModuleContract } from "./module-contract.js";
import { ContractRegistry } from "./contract-registry.js";
import { DependencyMap } from "./dependency-map.js";
import { AutonomyPolicy } from "./capability-policy.js";
import { RollbackManager } from "./rollback-manager.js";
import { LifecycleManager } from "./lifecycle-manager.js";

const world=createWordDarkWorld();

const contract=new ModuleContract({id:"TEST-CONTRACT",origin:"A",destination:"B",operations:["TEST"],capability:"B",reversible:true});
assert.equal(contract.validate({origin:"A",destination:"B",type:"TEST",service:"B"}).valid,true);

const contracts=new ContractRegistry();
contracts.register(contract);
assert.equal(contracts.validate({origin:"A",destination:"B",type:"TEST",service:"B"},{contractId:"TEST-CONTRACT"}).valid,true);

const deps=new DependencyMap();
deps.add({module:"B",dependsOn:"A"});
assert.equal(deps.canDeactivate("A").allowed,false);

const rollback=new RollbackManager();
rollback.capture({operationId:"OP-1",moduleId:"M-1",state:{value:1},undo:state=>({restored:state.value})});
assert.equal(rollback.rollback("OP-1","M-1").result.restored,1);

const lifecycle=new LifecycleManager({dependencyMap:deps});
lifecycle.create({id:"TEMP-1",purpose:"TEST"});
assert.equal(lifecycle.transition("TEMP-1","READY").success,true);
assert.equal(lifecycle.evaluate("TEMP-1").success,true);
assert.equal(lifecycle.get("TEMP-1").status,"DELETED");

const policy=new AutonomyPolicy({emergencyStop:world.emergencyStop});
policy.set("M-1",1,{allowedActions:["EXECUTE"],requiresApproval:false});
assert.equal(policy.can("M-1","EXECUTE").allowed,true);

assert.equal(world.contractRegistry.list().length,0);
console.log("WordDark governance tests: OK");
