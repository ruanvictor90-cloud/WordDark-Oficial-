const clean = (value, field) => { if (typeof value !== "string" || !value.trim()) throw new TypeError(field + " é obrigatório."); return value.trim(); };
const clone = value => JSON.parse(JSON.stringify(value ?? {}));
const TRANSITIONS=Object.freeze({RECEIVED:["TRIAGED","CANCELLED"],TRIAGED:["PREPARING","CANCELLED"],PREPARING:["REVIEW","CANCELLED"],REVIEW:["PREPARING","APPROVED","CANCELLED"],APPROVED:["DELIVERED"],DELIVERED:[],CANCELLED:[]});
function createCompanyEngine({companyId,name,sectorId,now=()=>new Date().toISOString(),idFactory=()=>"work-"+Math.random().toString(36).slice(2,10)}={}) {
 companyId=clean(companyId,"Identificador da empresa"); name=clean(name,"Nome da empresa"); sectorId=clean(sectorId,"Identificador do setor");
 const workOrders=new Map(),audit=[]; function record(event,data){audit.push({event,at:now(),data:clone(data)});}
 function openWorkOrder(input={}) {
  const title=clean(input.title,"Título da operação"),requesterId=clean(input.requesterId,"Solicitante"),workOrderId=input.workOrderId?clean(input.workOrderId,"Identificador da operação"):idFactory();
  if(workOrders.has(workOrderId)) throw new Error("Identificador de operação duplicado.");
  const item={workOrderId,companyId,companyName:name,sectorId,requesterId,title,category:clean(input.category,"Categoria"),description:typeof input.description==="string"?input.description.trim():"",budget:input.budget??null,deadline:input.deadline||null,recurrence:input.recurrence||"ONE_TIME",status:"RECEIVED",approvalRequired:true,executionEnabled:false,createdAt:now(),updatedAt:now()};
  workOrders.set(workOrderId,item);record("WORK_ORDER_OPENED",item);return clone(item);
 }
 function transitionWorkOrder(workOrderId,nextStatus,actorId,approval={}) {
  workOrderId=clean(workOrderId,"Identificador da operação");nextStatus=clean(nextStatus,"Próximo estado");actorId=clean(actorId,"Responsável pela alteração");
  const item=workOrders.get(workOrderId);if(!item)throw new Error("Operação não encontrada nesta empresa.");
  if(!Object.hasOwn(TRANSITIONS,item.status)||!TRANSITIONS[item.status].includes(nextStatus))throw new Error("Transição de estado não permitida: "+item.status+" → "+nextStatus+".");
  if(nextStatus==="APPROVED"&&approval.confirmed!==true)throw new Error("A aprovação explícita é obrigatória.");
  const updated={...item,status:nextStatus,updatedAt:now(),lastActorId:actorId};
  if(nextStatus==="APPROVED"){updated.approvedBy=actorId;updated.approvedAt=now();}if(nextStatus==="DELIVERED")updated.deliveredBy=actorId;
  updated.executionEnabled=false;workOrders.set(workOrderId,updated);record("WORK_ORDER_STATUS_CHANGED",{workOrderId,from:item.status,to:nextStatus,actorId});return clone(updated);
 }
 return Object.freeze({openWorkOrder,transitionWorkOrder,getWorkOrder(id){const x=workOrders.get(id);return x?clone(x):null;},listWorkOrders(){return [...workOrders.values()].map(clone);},auditTrail(){return audit.map(clone);},status(){return {engine:"WORDDARK_COMPANY",companyId,name,sectorId,workOrders:workOrders.size,externalSideEffectsEnabled:false};}});
}
module.exports={createCompanyEngine};
