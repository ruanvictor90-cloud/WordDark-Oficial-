const assert=require("assert");
const SocialFactory=require("./social-factory");

(async()=>{
  let externalCalls=0;
  const bridge={execute:async operation=>{externalCalls++;if(["CONTENT_PUBLISH","CONTENT_UNPUBLISH","CONTENT_SCHEDULE"].includes(operation.action))return{success:false,status:"MANUAL_ACTION_REQUIRED",operationId:operation.operationId};return{success:true,status:"MONITORING_READ",operationId:operation.operationId};}};
  const factory=new SocialFactory({connectionBridge:bridge});

  const publish=factory.receive({id:"REQ-PUBLISH-001",network:"YOUTUBE",action:"CONTENT_PUBLISH",accountId:"ACC-001",payload:{contentId:"CONTENT-001"}});
  assert.strictEqual(publish.success,true);
  assert.strictEqual(publish.status,"PLANNED");
  const publishResult=await factory.execute(publish.operationId);
  assert.strictEqual(publishResult.status,"WAITING_MANUAL_PUBLICATION");
  assert.strictEqual(publishResult.manualActionRequired,true);
  assert.strictEqual(externalCalls,1,"publication must be routed to the central gateway for policy decision, not directly to a platform adapter");

  for(const action of ["CONTENT_UNPUBLISH","CONTENT_SCHEDULE"]){
    const planned=factory.receive({id:"REQ-"+action,network:"YOUTUBE",action,accountId:"ACC-001",payload:{}});
    const result=await factory.execute(planned.operationId);
    assert.strictEqual(result.status,"WAITING_MANUAL_PUBLICATION",action+" must remain manual");
  }
  assert.strictEqual(externalCalls,3,"all publication-related actions must go through the central policy gateway");

  const monitor=factory.receive({id:"REQ-MONITOR-001",network:"YOUTUBE",action:"ANALYTICS_READ",accountId:"ACC-001",payload:{}});
  const monitored=await factory.execute(monitor.operationId);
  assert.strictEqual(monitored.success,true);
  assert.strictEqual(monitored.status,"MONITORING_READ");
  assert.strictEqual(externalCalls,4,"monitoring can use the authorized connection bridge");

  const payload={nested:{value:"original"}};
  const create=factory.receive({id:"REQ-CREATE-001",network:"YOUTUBE",action:"CONTENT_CREATE",accountId:"ACC-001",payload});
  payload.nested.value="mutated";
  const snapshot=factory.get(create.operationId);
  assert.strictEqual(snapshot.payload.nested.value,"original","social operation must isolate its input payload");
  snapshot.payload.nested.value="snapshot mutation";
  assert.strictEqual(factory.get(create.operationId).payload.nested.value,"original","operation reads must not expose mutable payload references");


  const manualFactory=new SocialFactory();
  const noBridge=manualFactory.receive({id:"REQ-MANUAL-FALLBACK",network:"YOUTUBE",action:"CONTENT_PUBLISH",accountId:"ACC-001",payload:{contentId:"CONTENT-MANUAL"}});
  const manualFallback=await manualFactory.execute(noBridge.operationId);
  assert.strictEqual(manualFallback.status,"WAITING_MANUAL_PUBLICATION");
  assert.strictEqual(manualFallback.manualActionRequired,true,"no API connection must preserve manual publication fallback");
\n  console.log("social-factory.test: OK");
})().catch(error=>{console.error(error);process.exitCode=1;});
