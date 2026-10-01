import { Operation } from "./operation.js";
import { Gate } from "./gate.js";
import { CapabilityRegistry } from "./capabilities.js";
import { Road } from "./road.js";
import { WorldRegistry } from "./registry.js";
import { OperationPipeline } from "./pipeline.js";

export class WordDarkRuntime {
  constructor({central=null}={}){
    this.registry=new WorldRegistry();
    this.capabilities=new CapabilityRegistry();
    this.road=new Road({registry:this.capabilities});
    this.gates=new Map();
    this.modules=new Map();
    this.central=central;
    this.pipeline=new OperationPipeline(this);
    this.status="ONLINE";
  }
  registerModule(module){
    if(!module?.id||typeof module.handle!=="function") throw new Error("INVALID_MODULE");
    this.modules.set(module.id,module);
    this.capabilities.register({id:module.id,name:module.name||module.id,owner:module.owner||module.id,layer:module.layer||"UNKNOWN",handler:module.handle,metadata:module.metadata||{}});
    this.registry.register({id:module.id,type:"MODULE",layer:module.layer,owner:module.owner});
    return module;
  }
  registerCapability(capability){return this.capabilities.register(capability);}
  registerGate(config){const gate=new Gate(config);this.gates.set(gate.gateId,gate);return gate;}
  executeModule(operation,moduleId,context={}){
    const module=this.modules.get(moduleId);
    if(!module) return {success:false,reason:"MODULE_NOT_FOUND",moduleId};
    try{return module.handle(operation,{runtime:this,...context})||{success:false,reason:"MODULE_NO_RESULT"};}
    catch(error){return {success:false,reason:error.message,moduleId};}
  }
  request(input){
    const op=input instanceof Operation?input:new Operation(input);
    const valid=op.validate();
    if(!valid.valid) return op.transition("REJECTED",{errors:valid.errors});
    const gate=this.gates.get(op.gateId);
    if(!gate) return op.transition("REJECTED",{reason:"GATE_NOT_FOUND"});
    const entry=gate.receive({id:op.id,type:op.type});
    if(!entry.success) return op.transition("REJECTED",{reason:entry.reason});
    op.transition("IDENTIFIED",{gateId:gate.gateId});
    if(op.pipeline?.modules?.length) return this.pipeline.run(op);
    const route=this.road.route(op);
    if(!route.success){
      if(this.central?.receiveRequest) this.central.receiveRequest(op,route.reason);
      return op.transition("BLOCKED",{reason:route.reason});
    }
    op.transition("ROUTED",route.delivery);
    const result=this.executeModule(op,route.capability.id,{route:route.delivery});
    if(!result?.success){
      op.checkpoint(route.capability.id,"FAILED",result);
      return op.transition("FAILED",result);
    }
    op.checkpoint(route.capability.id,"PASSED",result);
    return op.transition("COMPLETED",result);
  }
  reenter(operation,moduleId,reason="MODULE_REENTRY"){return this.pipeline.reenter(operation,moduleId,reason);}
  status(){return {status:this.status,modules:this.modules.size,capabilities:this.capabilities.list(),gates:this.gates.size,events:this.registry.events.length};}
}
