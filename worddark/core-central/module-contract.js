export const MODULE_CONTRACT_VERSION="1.0.0";

export class ModuleContract{
  constructor({id,origin,destination,operations=["REQUEST"],input=["operation"],output=["result"],capability=null,reversible=false,metadata={}}={}){
    if(!id||!origin||!destination)throw new Error("MODULE_CONTRACT_FIELDS_REQUIRED");
    this.id=id;this.version=MODULE_CONTRACT_VERSION;this.origin=origin;this.destination=destination;
    this.operations=[...operations];this.input=[...input];this.output=[...output];
    this.capability=capability;this.reversible=Boolean(reversible);this.metadata=structuredClone(metadata);this.status="ACTIVE";
  }
  validate(operation={}){
    const errors=[];
    if(operation.origin!==this.origin)errors.push("CONTRACT_ORIGIN_MISMATCH");
    if(operation.destination!==this.destination)errors.push("CONTRACT_DESTINATION_MISMATCH");
    if(operation.type&&!this.operations.includes(operation.type))errors.push("CONTRACT_OPERATION_NOT_ALLOWED");
    if(this.capability&&operation.context?.capability!==this.capability&&operation.service!==this.capability)errors.push("CONTRACT_CAPABILITY_MISMATCH");
    return {valid:errors.length===0,errors,contractId:this.id};
  }
  describe(){return structuredClone(this);}
}
