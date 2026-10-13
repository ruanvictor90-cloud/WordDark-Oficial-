import assert from "node:assert/strict";
import {createPublicationRuntime} from "./publication-runtime.js";

function setup({authorized=true,persisted=true,capabilities=["CONTENT_PUBLISH"],scope="https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload",publisherResult={success:true,status:"UPLOAD_COMPLETED",videoId:"video-1"}}={}){
  const events=[];
  const claims=new Map();
  const publicationStore={
    async claim(key,{requestFingerprint,operationId}){
      if(claims.has(key))return{claimed:false,status:"DUPLICATE_PUBLICATION_REQUEST"};
      claims.set(key,{requestFingerprint,operationId,status:"IN_PROGRESS"});
      return{claimed:true};
    },
    async complete(key,result){claims.set(key,{...claims.get(key),...result});return{updated:true};},
    async consumeQuota(){return{allowed:true};},
    async audit(event){events.push(event);return{recorded:true};}
  };
  const connectionStore={
    async load(){return persisted?{status:"PERSISTED",providerId:"YOUTUBE",accountId:"channel-1",capabilities,scope}:null;},
    async loadTokens(){return{refresh_token:"server-only"};}
  };
  let calls=0;
  const publisher={async publishVideo(args){calls++;assert.equal(Buffer.isBuffer(args.videoBuffer),true);return publisherResult;}};
  const runtime=createPublicationRuntime({
    connectionStore,publicationStore,publisher,
    authenticateOperator:async()=>({authenticated:true,operatorId:"operator-1"}),
    authorizeOperation:async()=>({allowed:authorized}),
    approveOperation:async()=>({allowed:true,approvalId:"approval-1"})
  });
  return{runtime,events,claims,get calls(){return calls;}};
}
const request={
  requestId:"request-1",operationId:"operation-1",providerId:"YOUTUBE",accountId:"channel-1",
  action:"CONTENT_PUBLISH",capability:"CONTENT_PUBLISH",environment:"PROD",
  payload:{title:"Test upload",description:"Test",tags:["test"],privacyStatus:"private"}
};
const media={videoBuffer:Buffer.from("trusted test bytes"),mimeType:"video/mp4"};
const good=setup();
const result=await good.runtime.publishYouTube({request,idempotencyKey:"runtime-key-1",media});
assert.equal(result.status,"UPLOAD_COMPLETED");
assert.equal(result.recorded,true);
assert.equal(good.calls,1);
assert.equal(good.claims.get("runtime-key-1").externalId,"video-1");
assert.equal(good.events.some(e=>e.type==="PUBLICATION_AUTHORIZED"),true);

const denied=setup({authorized:false});
const deniedResult=await denied.runtime.publishYouTube({request,idempotencyKey:"runtime-key-2",media});
assert.equal(deniedResult.status,"PUBLICATION_PERMISSION_DENIED");
assert.equal(denied.calls,0,"Unauthorized operations must never invoke the platform publisher");

const noMedia=setup();
const noMediaResult=await noMedia.runtime.publishYouTube({request,idempotencyKey:"runtime-key-3"});
assert.equal(noMediaResult.status,"TRUSTED_MEDIA_REQUIRED");
assert.equal(noMedia.calls,0);

const wrongProvider=setup();
const wrongProviderResult=await wrongProvider.runtime.publishYouTube({request:{...request,providerId:"INSTAGRAM"},idempotencyKey:"runtime-key-wrong-provider",media});
assert.equal(wrongProviderResult.status,"PUBLICATION_PROVIDER_UNSUPPORTED");
assert.equal(wrongProvider.calls,0);

const wrongAction=setup();
const wrongActionResult=await wrongAction.runtime.publishYouTube({request:{...request,action:"CONTENT_SCHEDULE",capability:"CONTENT_SCHEDULE"},idempotencyKey:"runtime-key-wrong-action",media});
assert.equal(wrongActionResult.status,"PUBLICATION_ACTION_UNSUPPORTED");
assert.equal(wrongAction.calls,0);

const noCapability=setup({capabilities:[]});
const noCapabilityResult=await noCapability.runtime.publishYouTube({request,idempotencyKey:"runtime-key-no-capability",media});
assert.equal(noCapabilityResult.status,"YOUTUBE_PUBLICATION_CAPABILITY_NOT_GRANTED");
assert.equal(noCapability.calls,0);

const noUploadScope=setup({scope:"https://www.googleapis.com/auth/youtube.readonly"});
const noUploadScopeResult=await noUploadScope.runtime.publishYouTube({request,idempotencyKey:"runtime-key-no-upload-scope",media});
assert.equal(noUploadScopeResult.status,"YOUTUBE_UPLOAD_SCOPE_NOT_GRANTED");
assert.equal(noUploadScope.calls,0);

const noConnection=setup({persisted:false});
const noConnectionResult=await noConnection.runtime.publishYouTube({request,idempotencyKey:"runtime-key-4",media});
assert.equal(noConnectionResult.status,"YOUTUBE_CONNECTION_NOT_PERSISTED");
assert.equal(noConnection.calls,0);
assert.equal(noConnection.claims.get("runtime-key-4").status,"YOUTUBE_CONNECTION_NOT_PERSISTED");

const publisherFailure=setup({publisherResult:{success:false,status:"YOUTUBE_UPLOAD_FAILED"}});
const failed=await publisherFailure.runtime.publishYouTube({request,idempotencyKey:"runtime-key-5",media});
assert.equal(failed.status,"YOUTUBE_UPLOAD_FAILED");
assert.equal(failed.recorded,true);
assert.equal(publisherFailure.claims.get("runtime-key-5").status,"YOUTUBE_UPLOAD_FAILED");

const tooLarge=setup();
const large=await tooLarge.runtime.publishYouTube({request,idempotencyKey:"runtime-key-6",media:{videoBuffer:Buffer.alloc(9),mimeType:"video/mp4"}});
const limitedRuntime=createPublicationRuntime({
  connectionStore:{load:async()=>({status:"PERSISTED"}),loadTokens:async()=>({refresh_token:"x"})},
  publicationStore:{claim:async()=>({claimed:true}),complete:async()=>({updated:true}),consumeQuota:async()=>({allowed:true}),audit:async()=>({recorded:true})},
  publisher:{publishVideo:async()=>{throw new Error("Must not be called");}},
  authenticateOperator:async()=>({authenticated:true,operatorId:"operator-1"}),
  authorizeOperation:async()=>({allowed:true}),
  approveOperation:async()=>({allowed:true,approvalId:"approval-1"}),
  maxVideoBytes:8
});
const bounded=await limitedRuntime.publishYouTube({request,idempotencyKey:"runtime-key-7",media:{videoBuffer:Buffer.alloc(9),mimeType:"video/mp4"}});
assert.equal(bounded.status,"VIDEO_TOO_LARGE");
assert.equal(large.status,"UPLOAD_COMPLETED");

assert.throws(()=>createPublicationRuntime({}),/PUBLICATION_CONNECTION_STORE_REQUIRED/);
console.log("publication-runtime.test: OK");
