/* WordDark Lab — End-to-end runtime prototype
 * This is a laboratory composition layer. It does not replace main runtime.
 */
const Id = require("./id");
const {Client,Channel,Project,User,Service}=require("./entities");
const {WordDarkLabPermissionSet}=require("./permissions");
const Operation=require("./operation");
const Result=require("./result");
const {WordDarkLabRouter}=require("./route");
const ServiceRegistry=require("./service");
const Recovery=require("./error-recovery");
const Inbox=require("./inbox");
const Versioning=require("./versioning");

class WordDarkLabRuntime {
  constructor(){
    this.registry=new Map(); this.permissions=new WordDarkLabPermissionSet();
    this.router=new WordDarkLabRouter(); this.services=new ServiceRegistry();
    this.recovery=new Recovery(); this.inbox=new Inbox(); this.versioning=new Versioning();
    this.gates=new Map(); this.events=[]; this.resultSequence=0;
  }
  register(entity){
    this.registry.set(entity.id,entity);
    if(entity instanceof Service) this.services.register(entity);
    return entity;
  }
  addGate(g){this.gates.set(g.gateId,g);return g;}
  log(event,data={}){this.events.push({event,timestamp:new Date().toISOString(),data});}
  process(operation,gateId,returnGateId=null){
    try{
      if(!operation.validate().valid)throw new Error(operation.validate().errors.join(" "));
      const gate=this.gates.get(gateId); if(!gate)throw new Error("GATE_NOT_FOUND");
      const user=this.registry.get(operation.requesterId);
      if(!user)throw new Error("REQUESTER_NOT_FOUND");
      const gateResult=gate.receive({profile:user.profile,context:{clientId:operation.clientId,resourceId:operation.resourceId}});
      if(!gateResult.success)throw new Error(gateResult.reason);
      if(!this.permissions.authorize({profile:user.profile,capability:"content.produce",action:"request",resourceId:operation.resourceId,clientId:operation.clientId,environment:operation.environment}))throw new Error("ACCESS_DENIED");
      const route=this.router.resolve(operation);if(!route)throw new Error("ROUTE_NOT_FOUND");
      operation.transition("RECEIVED");operation.transition("VALIDATED");operation.transition("EXECUTING");
      this.log("EXECUTION_STARTED",{operationId:operation.operationId,routeId:route.routeId});
      const execution=this.services.execute(operation.serviceId,operation);
      if(!execution.success)throw new Error(execution.reason||"SERVICE_FAILED");
      operation.transition("COMPLETED");operation.addHistory("EXECUTION_FINISHED",execution);
      const result=new Result({resultId:Id.create("RESULT",341),operationId:operation.operationId,status:"READY",report:execution});
      this.versioning.create(operation.operationId,operation.toJSON());
      this.inbox.notify({type:"RESULT_READY",operationId:operation.operationId});
      this.log("EXECUTION_FINISHED",{operationId:operation.operationId,resultId:result.resultId});
      return {success:true,status:"PROCESSED",operation,result};
    }catch(error){
      const record=this.recovery.capture(operation,error,"RUNTIME");
      this.inbox.pend({type:"OPERATION_ERROR",operationId:operation.operationId,errorId:record.errorId});
      this.log("EXECUTION_FAILED",{operationId:operation.operationId,errorId:record.errorId});
      return {success:false,status:"FAILED",error:record};
    }
  }
}
module.exports=WordDarkLabRuntime;
if(typeof window!=="undefined")window.WordDarkLabRuntime=WordDarkLabRuntime;
