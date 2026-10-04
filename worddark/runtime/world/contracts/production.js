/* WordDark — Global Production Contract
 * Produção = objetivo composto. O mundo decompõe em operações executáveis.
 */
class WordDarkProduction {
  constructor(source={}) {
    this.productionId=source.productionId||null;
    this.requesterId=source.requesterId||null;
    this.originId=source.originId||null;
    this.clientId=source.clientId||null;
    this.goal=source.goal||source.objective||null;
    this.resourceId=source.resourceId||null;
    this.destinationId=source.destinationId||null;
    this.quantity=Number.isFinite(source.quantity)?source.quantity:1;
    this.requirements=source.requirements||{};
    this.context=source.context||{};
    this.options=source.options||{};
    this.status=source.status||"CREATED";
    this.operations=Array.isArray(source.operations)?[...source.operations]:[];
    this.createdAt=source.createdAt||new Date().toISOString();
    this.updatedAt=source.updatedAt||this.createdAt;
  }
  static get STATUSES(){return ["CREATED","PLANNED","EXECUTING","WAITING","PARTIAL","COMPLETED","FAILED","CANCELLED"];}
  validate(){
    const errors=[];
    if(!this.productionId)errors.push("productionId é obrigatório.");
    if(!this.requesterId)errors.push("requesterId é obrigatório.");
    if(!this.originId)errors.push("originId é obrigatório.");
    if(!this.goal)errors.push("goal é obrigatório.");
    if(!WordDarkProduction.STATUSES.includes(this.status))errors.push("status de produção inválido.");
    if(this.quantity<1)errors.push("quantity deve ser maior que zero.");
    return{valid:errors.length===0,errors};
  }
  addOperation(operation){
    const id=operation?.operationId||operation?.id;
    if(id&&!this.operations.includes(id))this.operations.push(id);
    this.updatedAt=new Date().toISOString();
    return id;
  }
  transition(status,data=null){
    if(!WordDarkProduction.STATUSES.includes(status))throw new Error("Status de produção inválido: "+status);
    this.status=status;
    this.updatedAt=new Date().toISOString();
    if(data)this.result=data;
    return this;
  }
  toJSON(){
    return {productionId:this.productionId,requesterId:this.requesterId,originId:this.originId,clientId:this.clientId,
      goal:this.goal,resourceId:this.resourceId,destinationId:this.destinationId,quantity:this.quantity,
      requirements:this.requirements,context:this.context,options:this.options,status:this.status,
      operations:[...this.operations],result:this.result||null,createdAt:this.createdAt,updatedAt:this.updatedAt};
  }
}
if(typeof module!=="undefined")module.exports=WordDarkProduction;
if(typeof window!=="undefined")window.WordDarkProduction=WordDarkProduction;