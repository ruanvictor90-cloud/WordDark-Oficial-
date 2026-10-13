const assert=require("assert");
const Registry=require("./connection-registry");
const Gateway=require("./connection-gateway");
const ExternalRequest=require("./connection-contract");

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

  let realCalls=0;
  gateway.registerAdapter("YOUTUBE",{
    execute:async()=>{realCalls++;return{success:true,status:"REAL_PUBLISH"};},
    testExecute:async(request,context)=>{
      assert.strictEqual(request.providerId,"YOUTUBE");
      assert.strictEqual(context.credential,"TEST-CREDENTIAL");
      assert.strictEqual(context.environment,"TEST");
      assert.strictEqual(context.simulation,true);
      return{success:true,status:"TEST_SIMULATED",externalId:"SIM-001"};
    }
  });

  const done=await gateway.execute({
    requestId:"REQ-EXT-002",operationId:"OP-EXT-002",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-002"}
  });
  assert.strictEqual(done.success,true);
  assert.strictEqual(done.status,"TEST_SIMULATED");
  assert.strictEqual(realCalls,0,"TEST must never call the real adapter");

  const blockedProd=await gateway.execute({
    requestId:"REQ-EXT-003",operationId:"OP-EXT-003",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",environment:"PROD",payload:{contentId:"CONTENT-003"}
  });
  assert.strictEqual(blockedProd.status,"PROD_APPROVAL_REQUIRED");
  assert.strictEqual(realCalls,0,"PROD must be blocked without an explicit approval provider");

  const approvedGateway=new Gateway({registry,productionApproval:async request=>({
    allowed:request.operationId==="OP-EXT-004",reference:"APPROVAL-004"
  })});
  approvedGateway.registerAdapter("YOUTUBE",{
    execute:async(request,context)=>{
      realCalls++;
      assert.strictEqual(context.environment,"PROD");
      assert.strictEqual(context.simulation,false);
      return{success:true,status:"PROD_STUB_EXECUTED"};
    },
    testExecute:async()=>{throw new Error("PROD must not use testExecute");}
  });
  const deniedProd=await approvedGateway.execute({
    requestId:"REQ-EXT-005",operationId:"OP-EXT-005",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",environment:"PROD",payload:{contentId:"CONTENT-005"}
  });
  assert.strictEqual(deniedProd.status,"PROD_NOT_AUTHORIZED");
  assert.strictEqual(realCalls,0);

  const allowedProd=await approvedGateway.execute({
    requestId:"REQ-EXT-004",operationId:"OP-EXT-004",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",environment:"PROD",payload:{contentId:"CONTENT-004"}
  });
  assert.strictEqual(allowedProd.status,"PROD_STUB_EXECUTED");
  assert.strictEqual(realCalls,1);

  const missingCapability=await gateway.execute({
    requestId:"REQ-EXT-006",operationId:"OP-EXT-006",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"ACCOUNT_MANAGE",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-006"}
  });
  assert.strictEqual(missingCapability.status,"CAPABILITY_NOT_GRANTED","A weaker capability must not authorize a stronger action");
  assert.strictEqual(realCalls,1);

  const sourcePayload={nested:{value:"original"}};
  const request=new ExternalRequest({
    requestId:"REQ-CLONE",operationId:"OP-CLONE",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",payload:sourcePayload
  });
  sourcePayload.nested.value="mutated";
  assert.strictEqual(request.payload.nested.value,"original","Request must clone input payload");
  const json=request.toJSON();
  json.payload.nested.value="mutated-again";
  assert.strictEqual(request.payload.nested.value,"original","toJSON must not leak mutable payload references");
  assert.strictEqual(new ExternalRequest({requestId:"BAD-ENV",operationId:"BAD-ENV",providerId:"YOUTUBE",accountId:"ACC-001",capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",environment:"PRODUCTION"}).validate().valid,false);

  registry.disconnect("YOUTUBE","ACC-001");
  const disconnected=await gateway.execute({
    requestId:"REQ-EXT-007",operationId:"OP-EXT-007",providerId:"YOUTUBE",accountId:"ACC-001",
    capability:"CONTENT_PUBLISH",action:"CONTENT_PUBLISH",payload:{contentId:"CONTENT-007"}
  });
  assert.strictEqual(disconnected.status,"ACCOUNT_NOT_CONNECTED");
  console.log("connection-gateway.test: OK");
})().catch(error=>{console.error(error);process.exitCode=1;});
