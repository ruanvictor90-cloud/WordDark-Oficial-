import { ProductionRights, RIGHTS_STATUS } from "./index.js";

const rights=new ProductionRights();
rights.registerProduction({productionId:"P-1",title:"Teste",ownerId:"CLIENT-1"});
rights.addAsset("P-1",{assetId:"AUDIO-1",type:"AUDIO",rightsStatus:RIGHTS_STATUS.BLOCKED});
if(rights.canPublish("P-1").allowed) throw new Error("BLOCKED_PRODUCTION_WAS_ALLOWED");

rights.addAsset("P-1",{assetId:"VIDEO-1",type:"VIDEO",rightsStatus:RIGHTS_STATUS.CLEARED});
if(rights.canPublish("P-1").status!=="BLOCKED") throw new Error("BLOCKED_ASSET_NOT_PRESERVED");

const clean=rights.registerProduction({productionId:"P-2",title:"Limpa",ownerId:"CLIENT-1"});
rights.addAsset(clean.productionId,{assetId:"V-2",type:"VIDEO",rightsStatus:RIGHTS_STATUS.CLEARED});
if(!rights.canPublish("P-2").allowed) throw new Error("CLEARED_PRODUCTION_WAS_BLOCKED");

console.log("production-rights: ok");
