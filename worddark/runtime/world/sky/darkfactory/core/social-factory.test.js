const assert=require("assert");
const SocialFactory=require("./social-factory");

(async()=>{
  let externalCalls=0;
  const bridge={execute:async operation=>{externalCalls++;return{success:true,status:"MONITORING_READ",operationId:operation.operationId};}};
  const factory=new SocialFactory({connectionBridge:bridge});

  const publish=factory.receive({id:"REQ-PUBLISH-001",network:"YOUTUBE",action:"CONTENT_PUBLISH",accountId:"ACC-001",payload:{contentId:"CONTENT-001"}});
  assert.strictEqual(publish.success,true);
  assert.strictEqual(publish.status,"PLANNED");
  const publishResult=await factory.execute(publish.operationId);
  assert.strictEqual(publishResult.status,"WAITING_MANUAL_PUBLICATION");
  assert.strictEqual(publishResult.manualActionRequired,true);
  assert.strictEqual(externalCalls,0,"automatic publication must not call the external bridge");

  for(const action of ["CONTENT_UNPUBLISH","CONTENT_SCHEDULE"]){
    const planned=factory.receive({id:"REQ-"+action,network:"YOUTUBE",action,accountId:"ACC-001",payload:{}});
    const result=await factory.execute(planned.operationId);
    assert.strictEqual(result.status,"WAITING_MANUAL_PUBLICATION",action+" must remain manual");
  }
  assert.strictEqual(externalCalls,0,"publication-related actions must not call the external bridge");

  const monitor=factory.receive({id:"REQ-MONITOR-001",network:"YOUTUBE",action:"ANALYTICS_READ",accountId:"ACC-001",payload:{}});
  const monitored=await factory.execute(monitor.operationId);
  assert.strictEqual(monitored.success,true);
  assert.strictEqual(monitored.status,"MONITORING_READ");
  assert.strictEqual(externalCalls,1,"monitoring can use the authorized connection bridge");

  const payload={nested:{value:"original"}};
  const create=factory.receive({id:"REQ-CREATE-001",network:"YOUTUBE",action:"CONTENT_CREATE",accountId:"ACC-001",payload});
  payload.nested.value="mutated";
  const snapshot=factory.get(create.operationId);
  assert.strictEqual(snapshot.payload.nested.value,"original","social operation must isolate its input payload");
  snapshot.payload.nested.value="snapshot mutation";
  assert.strictEqual(factory.get(create.operationId).payload.nested.value,"original","operation reads must not expose mutable payload references");

  console.log("social-factory.test: OK");
})().catch(error=>{console.error(error);process.exitCode=1;});
