import assert from "node:assert/strict";
import {createDarknetWorldIntegration} from "./darknet-world-integration.js";
let submissions=0,authCalls=0,auditCalls=0;
const integration=createDarknetWorldIntegration({
 enabled:true,
 operationCenter:{submit:input=>{submissions++;assert.equal(input.requesterId,"DARKNET");return{success:true,status:"QUEUED"};},getStatus:()=>({status:"HEALTHY"})},
 capabilityCatalog:{ACTION_CAPABILITIES:{PUBLISH_CONTENT:"CONTENT_PUBLICATION"}},
 authorizeRequest:async()=>{authCalls++;return{allowed:true,approvalId:"APPROVED-1"};},
 audit:async()=>{auditCalls++;}
});
const result=await integration.request({requestId:"DNET-E2E-1",sector:"ceu",action:"REQUEST_OPERATION",payload:{need:"Preparar conteúdo"}});
assert.equal(result.status,"QUEUED");
assert.equal(submissions,1);
assert.equal(authCalls,2,"bridge and world adapter independently authorize");
assert.equal(auditCalls,2,"both boundary decisions are audited");
const disabled=createDarknetWorldIntegration();
assert.equal((await disabled.request({requestId:"DNET-OFF",sector:"terra",action:"SUBMIT_NEED",payload:{need:"pedido"}})).status,"DARKNET_WORLD_BRIDGE_DISABLED");
assert.equal(disabled.getStatus().network,false);
console.log("darknet-world-integration.test: OK");
