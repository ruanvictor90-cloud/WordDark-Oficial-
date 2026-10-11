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
  store.setItem("wd.external.connections",JSON.stringify([{
    providerId:"YOUTUBE",accountId:"ACC-001",status:"CONNECTED",capabilities:["CONTENT_ROUTE","CONTENT_PUBLISH"]
  }]));
  registry.setRuntimeCredential("YOUTUBE","ACC-001","TEST-CREDENTIAL");

  const gateway=new Gateway({registry});
  const waiting=await gateway.execute({
    requestId:"REQ-EXT-001",operationId:"OP-EXT-001",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-001"}
  });
  assert.strictEqual(waiting.status,"WAITING_EXTERNAL_CONNECTION");

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
  console.log("connection-gateway.test: OK");
})();
