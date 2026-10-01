import { Operation } from "./operation.js";
import { Gate } from "./gate.js";
import { CapabilityRegistry } from "./capabilities.js";
import { Road } from "./road.js";
import { WorldRegistry } from "./registry.js";

export class WordDarkRuntime {
  constructor(){this.registry=new WorldRegistry();this.capabilities=new CapabilityRegistry();this.road=new Road({registry:this.capabilities});this.gates=new Map();this.modules=new Map();this.status="ONLINE";}
  registerModule(module){if(!module?.id||typeof module.handle!=="function")throw new Error("INVALID_MODULE");this.modules.set(module.id,module);this.capabilities.register({id:module.id,name:module.name||module.id,owner:module.owner||module.id,layer:module.layer||"UNKNOWN",handler:module.handle,metadata:module.metadata||{}});this.registry.register({id:module.id,type:"MODULE",layer:module.layer,owner:module.owner});return module;}
  registerGate(config){const gate=new Gate(config);this.gates.set(gate.gateId,gate);return gate;}
  request(input){const op=input instanceof Operation?input:new Operation(input);const valid=op.validate();if(!valid.valid)return op.transition("REJECTED",{errors:valid.errors});const gate=this.gates.get(input.gateId);if(!gate)return op.transition("REJECTED",{reason:"GATE_NOT_FOUND"});const entry=gate.receive({id:op.id,type:"REQUEST"});if(!entry.success)return op.transition("REJECTED",{reason:entry.reason});op.transition("IDENTIFIED",{gateId:gate.gateId});const route=this.road.route(op);if(!route.success)return op.transition("BLOCKED",{reason:route.reason});op.transition("ROUTED",route.delivery);const result=route.capability.handler(op,{runtime:this});if(!result?.success){op.checkpoint(route.capability.id,"FAILED",result);return op.transition("FAILED",result);}op.checkpoint(route.capability.id,"PASSED",result);return op.transition("COMPLETED",result);}
  reenter(operation,moduleId,reason="MODULE_REENTRY"){if(!(operation instanceof Operation))throw new Error("OPERATION_REQUIRED");const module=this.modules.get(moduleId);if(!module)throw new Error("MODULE_NOT_FOUND");operation.reenter(moduleId,reason);const result=module.handle(operation,{runtime:this,reentry:true});if(result?.success){operation.checkpoint(moduleId,"PASSED",result);return operation.transition("COMPLETED",result);}operation.checkpoint(moduleId,"FAILED",result);return operation.transition("FAILED",result||{reason:"REENTRY_FAILED"});}
  status(){return {status:this.status,modules:this.modules.size,capabilities:this.capabilities.list(),gates:this.gates.size,events:this.registry.events.length};}
}
