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
    providerId:"YOUTUBE",accountId:"ACC-001",status:"CONNECTED",capabilities:["CONTENT_ROUTE","CONTENT_PUBLICATION"]
  },{
    providerId:"RESEARCH_API",accountId:"RESEARCH-001",status:"CONNECTED",capabilities:["KNOWLEDGE_RESEARCH"]
  }]));
  registry.setRuntimeCredential("YOUTUBE","ACC-001","TEST-CREDENTIAL");
  registry.setRuntimeCredential("RESEARCH_API","RESEARCH-001","RESEARCH-CREDENTIAL");

  const logs=[];
  const gateway=new Gateway({registry,logger:{log:(event,metadata)=>logs.push({event,metadata})}});
  const waiting=await gateway.execute({
    requestId:"REQ-EXT-001",operationId:"OP-EXT-001",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLICATION",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-001"}
  });
  assert.strictEqual(waiting.status,"WAITING_EXTERNAL_CONNECTION");

  gateway.registerAdapter("YOUTUBE",{execute:async(request,context)=>{
    assert.strictEqual(request.providerId,"YOUTUBE");
    assert.strictEqual(context.credential,"TEST-CREDENTIAL");
    return{success:true,status:"PUBLISHED",externalId:"YT-001",access_token:"MUST_NOT_ESCAPE",metadata:{refresh_token:"MUST_NOT_ESCAPE",title:"Safe title"}};
  }});

  const done=await gateway.execute({
    requestId:"REQ-EXT-002",operationId:"OP-EXT-002",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLICATION",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-002",client_secret:"NEVER_LOG"}
  });
  assert.strictEqual(done.success,true);
  assert.strictEqual(done.result.status,"PUBLISHED");
  assert.strictEqual(done.result.access_token,undefined);
  assert.strictEqual(done.result.metadata.refresh_token,undefined);
  assert.strictEqual(done.result.metadata.title,"Safe title");
  assert(!JSON.stringify(logs).includes("TEST-CREDENTIAL"));
  assert(!JSON.stringify(logs).includes("NEVER_LOG"));
  assert(!JSON.stringify(logs).includes("MUST_NOT_ESCAPE"));

  const researchDenied=await gateway.execute({
    requestId:"REQ-RESEARCH-DENIED",operationId:"OP-RESEARCH-DENIED",providerId:"RESEARCH_API",accountId:"RESEARCH-001",
    capability:"CONTENT_PUBLICATION",action:"SEARCH_KNOWLEDGE",payload:{query:"test"}
  });
  assert.strictEqual(researchDenied.status,"ACTION_CAPABILITY_MISMATCH");
  gateway.registerAdapter("RESEARCH_API",{execute:async(request,context)=>{
    assert.strictEqual(request.action,"SEARCH_KNOWLEDGE");
    assert.strictEqual(context.credential,"RESEARCH-CREDENTIAL");
    return {success:true,status:"SEARCH_COMPLETED",results:[{id:"DOC-1",url:"https://example.org/doc",title:"Research",content:"Useful",rights:"PUBLIC"}]};
  }});
  const research=await gateway.execute({
    requestId:"REQ-RESEARCH-001",operationId:"OP-RESEARCH-001",providerId:"RESEARCH_API",accountId:"RESEARCH-001",
    capability:"KNOWLEDGE_RESEARCH",action:"SEARCH_KNOWLEDGE",payload:{query:"test"}
  });
  assert.strictEqual(research.success,true);
  assert.strictEqual(research.result.results[0].id,"DOC-1");

  registry.disconnect("YOUTUBE","ACC-001");
  const disconnected=await gateway.execute({
    requestId:"REQ-EXT-003",operationId:"OP-EXT-003",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLICATION",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-003"}
  });
  assert.strictEqual(disconnected.status,"ACCOUNT_NOT_CONNECTED");
  console.log("connection-gateway.test: OK");
})();
