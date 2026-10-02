/* WordDark — Social Factory · DF-0.8
 * Platform-neutral social execution layer.
 *
 * Dark Factory owns:
 * - request normalization
 * - validation
 * - capability matching
 * - execution plan
 * - partial re-entry
 * - result/audit envelope
 *
 * Central de Conexões owns:
 * - OAuth / tokens
 * - platform APIs
 * - external network communication
 */
import {SocialOperation,SOCIAL_ACTIONS} from "./social-operation.js";

export class SocialFactory {
  constructor({connectionBridge=null,logger=null}={}){
    this.connectionBridge=connectionBridge;
    this.logger=logger;
    this.status="ONLINE";
    this.operations=new Map();
  }

  receive(request){
    if(!request)return this.reject(null,"REQUEST_REQUIRED");
    const normalized=this.normalize(request);
    const errors=this.validate(normalized);
    if(errors.length)return this.reject(normalized,"INVALID_REQUEST",errors);
    const operation=new SocialOperation({
      requestId:normalized.id||normalized.requestId,
      network:normalized.network,
      action:normalized.action,
      accountId:normalized.accountId,
      payload:normalized.payload,
      options:normalized.options
    });
    const validation=operation.validate();
    if(!validation.valid)return this.reject(operation,"INVALID_OPERATION",validation.errors);
    this.operations.set(operation.operationId,operation);
    return this.plan(operation);
  }

  normalize(request){
    const p=request.payload||{};
    return {
      id:request.id||request.requestId||null,
      network:String(request.network||p.network||"").toUpperCase(),
      action:String(request.action||request.taskType||p.action||"").toUpperCase(),
      accountId:request.accountId||p.accountId||null,
      payload:p,
      options:request.options||p.options||{}
    };
  }

  validate(r){
    const errors=[];
    if(!r.id)errors.push("ID da solicitação obrigatório.");
    if(!r.network)errors.push("Rede social obrigatória.");
    if(!r.action)errors.push("Ação obrigatória.");
    if(!r.accountId)errors.push("Conta externa obrigatória.");
    return errors;
  }

  plan(operation){
    operation.status="PLANNED";
    const result={
      success:true,status:"PLANNED",stage:"DARK_FACTORY_SOCIAL",
      operationId:operation.operationId,requestId:operation.requestId,
      network:operation.network,action:operation.action,
      accountId:operation.accountId,
      requiredCapability:operation.action,
      handoff:{
        destination:"CENTRAL_DE_CONEXOES",
        responsibility:"EXTERNAL_EXECUTION",
        contract:"SOCIAL_CAPABILITY_BRIDGE"
      },
      payload:operation.payload,
      options:operation.options,
      reentry:{enabled:true,operationId:operation.operationId}
    };
    this.log("SOCIAL_OPERATION_PLANNED",result);
    return result;
  }

  async execute(operationId){
    const operation=this.operations.get(operationId);
    if(!operation)return {success:false,status:"NOT_FOUND",reason:"Operação não encontrada."};
    if(!this.connectionBridge?.execute)return {
      success:false,status:"WAITING_EXTERNAL_CONNECTION",stage:"CENTRAL_DE_CONEXOES",
      operationId,reason:"Nenhuma ponte de conexão externa disponível."
    };
    operation.status="WAITING_EXTERNAL";
    try{
      const result=await this.connectionBridge.execute(operation.toJSON());
      operation.status=result?.success===false?"FAILED":"COMPLETED";
      return {...result,operationId,requestId:operation.requestId};
    }catch(error){
      operation.status="FAILED";
      return {success:false,status:"FAILED",operationId,requestId:operation.requestId,
        stage:"CENTRAL_DE_CONEXOES",reason:error?.message||"EXTERNAL_EXECUTION_FAILED"};
    }
  }

  reenter(operationId,patch={}){
    const operation=this.operations.get(operationId);
    if(!operation)return {success:false,status:"NOT_FOUND"};
    Object.assign(operation,patch);
    operation.status="PENDING";
    return this.plan(operation);
  }

  get(operationId){const op=this.operations.get(operationId);return op?op.toJSON():null;}
  list(){return [...this.operations.values()].map(o=>o.toJSON());}
  log(event,data){try{this.logger?.log?.(event,data)}catch{}}
  reject(request,reason,errors=[]){return {success:false,status:"REJECTED",stage:"DARK_FACTORY_SOCIAL",reason,errors,requestId:request?.id||request?.requestId||null};}
}

if(typeof window!=="undefined")window.SocialFactory=SocialFactory;
if(typeof module!=="undefined"&&module.exports)module.exports=SocialFactory;
