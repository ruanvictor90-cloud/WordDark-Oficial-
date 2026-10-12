const assert=require("node:assert/strict");const {createSectorEngine}=require("./sector-engine.js");
const sector=createSectorEngine({sectorId:"sky",name:"Céu",now:()=>"2026-10-12T00:00:00.000Z"});
sector.registerCompany({companyId:"factory",name:"Dark Factory"});assert.equal(sector.status().companies,1);
const order=sector.recordWorkOrder({workOrderId:"work-1",companyId:"factory",title:"Prepare subtitles",status:"RECEIVED"});assert.equal(order.sectorId,"sky");
assert.equal(sector.updateWorkOrder({workOrderId:"work-1",status:"PREPARING"}).status,"PREPARING");
assert.throws(()=>sector.recordWorkOrder({workOrderId:"work-2",companyId:"outside",title:"No access",status:"RECEIVED"}),/não pertence/);
assert.equal(sector.auditTrail().length,3);assert.equal(sector.status().externalSideEffectsEnabled,false);console.log("Sector engine tests passed.");
