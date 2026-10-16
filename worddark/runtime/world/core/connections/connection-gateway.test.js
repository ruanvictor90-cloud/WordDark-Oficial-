const assert=require("assert");
const Registry=require("./connection-registry");
const Gateway=require("./connection-gateway");

function storage(){
  const data=new Map();
  return{getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
}

(async()=>{
  const store=storage();
  const registry=new Registry(store);
  store.setItem("wd.external.connections",JSON.stringify([
    {providerId:"YOUTUBE",accountId:"ACC-001",status:"CONNECTED",capabilities:["CONTENT_ROUTE","CONTENT_PUBLISH"]},
    {providerId:"YOUTUBE",accountId:"ACC-ROUTE-ONLY",status:"CONNECTED",capabilities:["CONTENT_ROUTE"]},
    {providerId:"YOUTUBE",accountId:"ACC-PENDING",status:"PENDING",capabilities:["CONTENT_PUBLISH"]},
    {providerId:"INSTAGRAM",accountId:"ACC-MALFORMED",status:"CONNECTED",capabilities:["CONTENT_PUBLISH"]}
  ]));
  registry.setRuntimeCredential("YOUTUBE","ACC-001","TEST-CREDENTIAL");
  registry.setRuntimeCredential("YOUTUBE","ACC-ROUTE-ONLY","ROUTE-ONLY-CREDENTIAL");
  registry.setRuntimeCredential("YOUTUBE","ACC-PENDING","PENDING-CREDENTIAL");
  registry.setRuntimeCredential("INSTAGRAM","ACC-MALFORMED","MALFORMED-RESULT-CREDENTIAL");

  const gateway=new Gateway({registry});
  const waiting=await gateway.execute({
    requestId:"REQ-EXT-001",operationId:"OP-EXT-001",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-001"}
  });
  assert.strictEqual(waiting.status,"WAITING_EXTERNAL_CONNECTION");

  const publishWithoutPublishCapability=await gateway.execute({
    requestId:"REQ-EXT-ROUTE-ONLY",operationId:"OP-EXT-ROUTE-ONLY",providerId:"YOUTUBE",accountId:"ACC-ROUTE-ONLY",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-ROUTE-ONLY"}
  });
  assert.strictEqual(publishWithoutPublishCapability.status,"CAPABILITY_NOT_GRANTED");

  const pendingAccount=await gateway.execute({
    requestId:"REQ-EXT-PENDING",operationId:"OP-EXT-PENDING",providerId:"YOUTUBE",accountId:"ACC-PENDING",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-PENDING"}
  });
  assert.strictEqual(pendingAccount.status,"ACCOUNT_NOT_CONNECTED");

  gateway.registerAdapter("YOUTUBE",{execute:async(request,context)=>{
    assert.strictEqual(request.providerId,"YOUTUBE");
    assert.strictEqual(context.credential,"TEST-CREDENTIAL");
    return{success:true,status:"PUBLISHED",externalId:"YT-001"};
  }});

  const done=await gateway.execute({
    requestId:"REQ-EXT-002",operationId:"OP-EXT-002",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-002"}
  });
  assert.strictEqual(done.success,true);
  assert.strictEqual(done.result.status,"PUBLISHED");

  registry.disconnect("YOUTUBE","ACC-001");
  const disconnected=await gateway.execute({
    requestId:"REQ-EXT-003",operationId:"OP-EXT-003",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-003"}
  });
  assert.strictEqual(disconnected.status,"ACCOUNT_NOT_CONNECTED");

  gateway.registerAdapter("INSTAGRAM",{execute:async()=>undefined});
  const malformedAdapterResult=await gateway.execute({
    requestId:"REQ-EXT-MALFORMED",operationId:"OP-EXT-MALFORMED",providerId:"INSTAGRAM",accountId:"ACC-MALFORMED",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-MALFORMED"}
  });
  assert.strictEqual(malformedAdapterResult.success,false);
  assert.strictEqual(malformedAdapterResult.status,"EXTERNAL_EXECUTION_FAILED");
  console.log("connection-gateway.test: OK");
})();
