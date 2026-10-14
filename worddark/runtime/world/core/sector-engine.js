const clean = (value, field) => { if (typeof value !== "string" || !value.trim()) throw new TypeError(field + " é obrigatório."); return value.trim(); };
const clone = value => JSON.parse(JSON.stringify(value ?? {}));
function createSectorEngine({sectorId,name,owner="worddark",now=()=>new Date().toISOString()}={}) {
 sectorId=clean(sectorId,"Identificador do setor"); name=clean(name,"Nome do setor"); owner=clean(owner,"Responsável pelo setor");
 const companies=new Map(), workOrders=new Map(), audit=[];
 function record(event,data){audit.push({event,at:now(),data:clone(data)});}
 function registerCompany(input={}) {
  const companyId=clean(input.companyId,"Identificador da empresa"), companyName=clean(input.name,"Nome da empresa");
  if(companies.has(companyId)) throw new Error("Empresa já registrada neste setor.");
  const company={companyId,name:companyName,sectorId,status:"ACTIVE",registeredAt:now()}; companies.set(companyId,company); record("COMPANY_REGISTERED",company); return clone(company);
 }
 function recordWorkOrder(input={}) {
  const workOrderId=clean(input.workOrderId,"Identificador da operação"), companyId=clean(input.companyId,"Identificador da empresa");
  if(!companies.has(companyId)) throw new Error("A empresa não pertence a este setor.");
  const snapshot={workOrderId,companyId,sectorId,title:clean(input.title,"Título da operação"),status:clean(input.status,"Estado da operação"),updatedAt:now()};
  workOrders.set(workOrderId,snapshot); record("WORK_ORDER_RECORDED",snapshot); return clone(snapshot);
 }
 function updateWorkOrder(input={}) {
  const workOrderId=clean(input.workOrderId,"Identificador da operação"), existing=workOrders.get(workOrderId);
  if(!existing) throw new Error("Operação não encontrada neste setor.");
  const next={...existing,status:clean(input.status,"Estado da operação"),updatedAt:now()}; workOrders.set(workOrderId,next); record("WORK_ORDER_STATUS_CHANGED",next); return clone(next);
 }
 return Object.freeze({registerCompany,recordWorkOrder,updateWorkOrder,getCompany(id){const x=companies.get(id);return x?clone(x):null;},listCompanies(){return [...companies.values()].map(clone);},listWorkOrders(){return [...workOrders.values()].map(clone);},auditTrail(){return audit.map(clone);},status(){return {engine:"WORDDARK_SECTOR",sectorId,name,owner,companies:companies.size,workOrders:workOrders.size,externalSideEffectsEnabled:false};}});
}
module.exports={createSectorEngine};
