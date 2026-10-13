import assert from "node:assert/strict";
import {createYouTubePublisher} from "./youtube-publisher.js";

const calls=[];
const store={loadTokens:async({providerId,accountId})=>{
  assert.equal(providerId,"YOUTUBE");
  assert.equal(accountId,"CHANNEL-001");
  return {refresh_token:"SERVER_ONLY_REFRESH_TOKEN",scope:"https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload"};
}};
const fetchImpl=async(url,options={})=>{
  calls.push({url,options});
  if(url==="https://oauth2.googleapis.com/token")return{ok:true,json:async()=>({access_token:"SHORT_LIVED_ACCESS_TOKEN"})};
  if(String(url).startsWith("https://www.googleapis.com/upload/youtube/v3/videos?"))return{ok:true,headers:{get:name=>name.toLowerCase()==="location"?"https://upload.youtube.googleapis.com/session/opaque":null},json:async()=>({})};
  if(url==="https://upload.youtube.googleapis.com/session/opaque")return{ok:true,json:async()=>({id:"VIDEO-123",status:{privacyStatus:"private"}})};
  throw new Error("Unexpected external URL in test: "+url);
};

const publisher=createYouTubePublisher({
  connectionStore:store,
  clientId:"TEST_CLIENT_ID",
  clientSecret:"TEST_CLIENT_SECRET",
  fetchImpl,
  now:()=>1791849600000
});
const result=await publisher.publishVideo({
  accountId:"CHANNEL-001",
  videoBuffer:Buffer.from("test-video-bytes"),
  mimeType:"video/mp4",
  title:"WordDark test",
  description:"Upload through a mocked provider adapter",
  tags:["WordDark","test"],
  privacyStatus:"private"
});
assert.equal(result.success,true);
assert.equal(result.status,"UPLOAD_COMPLETED");
assert.equal(result.externalId,"VIDEO-123");
assert.equal(result.url,"https://www.youtube.com/watch?v=VIDEO-123");
assert.equal(calls.length,3,"refresh token, create upload session and upload bytes");
assert.equal(calls[0].options.body.get("refresh_token"),"SERVER_ONLY_REFRESH_TOKEN");
assert.equal(calls[1].options.headers.Authorization,"Bearer SHORT_LIVED_ACCESS_TOKEN");
assert.equal(calls[1].options.headers["X-Upload-Content-Length"],String(Buffer.byteLength("test-video-bytes")));
assert.equal(calls[1].options.body.includes("TEST_CLIENT_SECRET"),false);
assert.equal(JSON.stringify(result).includes("TOKEN"),false,"response must not expose tokens");

let networkCalls=0;
const noScope=createYouTubePublisher({
  connectionStore:{loadTokens:async()=>({refresh_token:"SECRET",scope:"https://www.googleapis.com/auth/youtube.readonly"})},
  clientId:"TEST_CLIENT_ID",clientSecret:"TEST_CLIENT_SECRET",
  fetchImpl:async()=>{networkCalls++;throw new Error("must not call API without upload scope");}
});
const denied=await noScope.publishVideo({accountId:"CHANNEL-001",videoBuffer:Buffer.from("x"),title:"No scope"});
assert.equal(denied.status,"YOUTUBE_UPLOAD_SCOPE_REQUIRED");
assert.equal(networkCalls,0);

const missingStore=createYouTubePublisher({
  connectionStore:{loadTokens:async()=>null},clientId:"TEST_CLIENT_ID",clientSecret:"TEST_CLIENT_SECRET",fetchImpl
});
const missing=await missingStore.publishVideo({accountId:"CHANNEL-001",videoBuffer:Buffer.from("x"),title:"Missing token"});
assert.equal(missing.status,"YOUTUBE_ACCOUNT_NOT_AUTHORIZED");

const invalid=await publisher.publishVideo({accountId:"CHANNEL-001",videoBuffer:Buffer.alloc(0),title:"Empty"});
assert.equal(invalid.status,"VIDEO_EMPTY");

let bytesSentToUntrustedHost=0;
const hostileLocationPublisher=createYouTubePublisher({
  connectionStore:{loadTokens:async()=>({refresh_token:"SERVER_ONLY_REFRESH_TOKEN",scope:"https://www.googleapis.com/auth/youtube.upload"})},
  clientId:"TEST_CLIENT_ID",clientSecret:"TEST_CLIENT_SECRET",
  fetchImpl:async(url,options={})=>{
    if(url==="https://oauth2.googleapis.com/token")return{ok:true,json:async()=>({access_token:"SHORT_LIVED_ACCESS_TOKEN"})};
    if(String(url).startsWith("https://www.googleapis.com/upload/youtube/v3/videos?"))return{ok:true,headers:{get:()=> "https://attacker.example/upload"},json:async()=>({})};
    bytesSentToUntrustedHost++;
    throw new Error("Untrusted upload host must never receive media");
  }
});
const hostile=await hostileLocationPublisher.publishVideo({accountId:"CHANNEL-001",videoBuffer:Buffer.from("private-video"),title:"Host check"});
assert.equal(hostile.status,"YOUTUBE_UPLOAD_LOCATION_REJECTED");
assert.equal(bytesSentToUntrustedHost,0,"Video bytes must not be sent to a non-Google host");

console.log("youtube-publisher.test: OK");
