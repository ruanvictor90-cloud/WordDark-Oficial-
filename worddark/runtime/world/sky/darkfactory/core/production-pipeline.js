/* WordDark — Dark Factory Production Pipeline · DF-0.7 */
class DarkFactoryProductionPipeline {
  constructor(options){options=options||{};this.registry=options.registry||null;this.validator=options.validator||null;this.emergencyStop=options.emergencyStop||null;}
  run(request){
    if(!request) return {success:false,status:"REJECTED",reason:"Requerimento ausente."};
    const operationId=request.operationId||(request.payload&&request.payload.operationId)||null;
    const stopped=()=>{
      if(!this.emergencyStop||!operationId||typeof this.emergencyStop.assertRunning!=="function") return null;
      const check=this.emergencyStop.assertRunning(operationId);
      return check.allowed?null:check;
    };
    const before=stopped();
    if(before) return {success:false,status:"CANCELLED",reason:"EMERGENCY_STOP_ACTIVE",stopId:before.stopId||null,sectorId:before.sectorId||null};

    const type=request.taskType||(request.payload&&request.payload.taskType);
    const service=this.registry&&this.registry.resolve(type);
    if(!service) return {success:false,status:"REJECTED",reason:"Serviço não disponível.",type:type};
    const result=service.executor.execute(request,{emergencyStop:this.emergencyStop});
    const afterExecution=stopped();
    if(afterExecution) return {success:false,status:"CANCELLED",reason:"EMERGENCY_STOP_ACTIVE",stopId:afterExecution.stopId||null,sectorId:afterExecution.sectorId||null};
    if(!result||result.success!==true) return result||{success:false,status:"FAILED",reason:"Executor sem resultado."};
    if(this.validator){
      const beforeValidation=stopped();
      if(beforeValidation) return {success:false,status:"CANCELLED",reason:"EMERGENCY_STOP_ACTIVE",stopId:beforeValidation.stopId||null,sectorId:beforeValidation.sectorId||null};
      const check=this.validator.validate(result,request);
      if(!check.valid)return {success:false,status:"REJECTED",reason:"Validação da produção falhou.",errors:check.errors||[]};
      const afterValidation=stopped();
      if(afterValidation) return {success:false,status:"CANCELLED",reason:"EMERGENCY_STOP_ACTIVE",stopId:afterValidation.stopId||null,sectorId:afterValidation.sectorId||null};
    }
    return {success:true,status:"COMPLETED",serviceId:service.serviceId,result:result};
  }
}
if(typeof module!=="undefined") module.exports=DarkFactoryProductionPipeline;
if(typeof window!=="undefined") window.DarkFactoryProductionPipeline=DarkFactoryProductionPipeline;
