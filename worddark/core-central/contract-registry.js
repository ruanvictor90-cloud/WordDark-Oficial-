import { ModuleContract } from "./module-contract.js";

export class ContractRegistry{
  constructor({audit=null}={}){this.contracts=new Map();this.audit=audit;}
  register(contract){
    const item=contract instanceof ModuleContract?contract:new ModuleContract(contract);
    this.contracts.set(item.id,item);this.audit?.record?.("CONTRACT_REGISTERED",item.describe());return item.describe();
  }
  get(id){const c=this.contracts.get(id);return c?c.describe():null;}
  find({origin,destination,operationType=null}={}){
    return [...this.contracts.values()].filter(c=>c.origin===origin&&c.destination===destination&&(!operationType||c.operations.includes(operationType))).map(c=>c.describe());
  }
  validate(operation,{contractId=null}={}){
    const contract=contractId?this.contracts.get(contractId):this.find({origin:operation.origin,destination:operation.destination,operationType:operation.type})[0];
    if(!contract)return {valid:false,reason:"CONTRACT_NOT_FOUND",errors:["MODULE_EXCHANGE_CONTRACT_REQUIRED"]};
    return contract.validate(operation);
  }
  list(){return [...this.contracts.values()].map(c=>c.describe());}
}
