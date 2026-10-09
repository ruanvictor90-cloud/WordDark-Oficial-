import {createCloudConnectionStore} from "./connection-store.js";
import http from "node:http";
import {URL} from "node:url";

const PORT=Number(process.env.PORT||8080);
const CLIENT_ID=process.env.GOOGLE_CLIENT_ID||"";
const CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET||"";
const REDIRECT_URI=process.env.GOOGLE_REDIRECT_URI||"";
const ALLOWED_ORIGIN=process.env.WORDDARK_ALLOWED_ORIGIN||"";
const STORE_CONFIGURED=Boolean(process.env.GOOGLE_CLOUD_PROJECT&&process.env.GOOGLE_KMS_KEY_NAME);
let connectionStorePromise=null;
function connectionStore(){if(!connectionStorePromise)connectionStorePromise=createCloudConnectionStore();return connectionStorePromise;}

function json(res,status,body){
  res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ALLOWED_ORIGIN||"null","Access-Control-Allow-Headers":"Content-Type, X-Requested-With","Access-Control-Allow-Methods":"POST, GET, OPTIONS","Cache-Control":"no-store"});
  res.end(JSON.stringify(body));
}
async function body(req){let raw="";for await(const chunk of req){raw+=chunk;if(raw.length>8192)throw new Error("REQUEST_TOO_LARGE")}return new URLSearchParams(raw);}
async function googleToken(code){
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:CLIENT_ID,client_secret:CLIENT_SECRET,redirect_uri:REDIRECT_URI,grant_type:"authorization_code"})});
  const data=await r.json(); if(!r.ok)throw new Error(data.error||"GOOGLE_TOKEN_EXCHANGE_FAILED"); return data;
}
async function youtubeProfile(accessToken){
  const r=await fetch("https://www.googleapis.com/youtube/v3/channels?part=id,snippet,statistics&mine=true",{headers:{Authorization:"Bearer "+accessToken}});
  const data=await r.json(); if(!r.ok)throw new Error(data.error?.message||"YOUTUBE_PROFILE_FAILED");
  const item=data.items?.[0]; if(!item)throw new Error("YOUTUBE_CHANNEL_NOT_FOUND");
  return {id:item.id,title:item.snippet?.title||null,description:item.snippet?.description||null,customUrl:item.snippet?.customUrl||null,thumbnail:item.snippet?.thumbnails?.default?.url||null,statistics:item.statistics||{}};
}
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url||"/","http://localhost");
  if(req.method==="OPTIONS")return json(res,204,{});
  if(req.method==="GET"&&url.pathname==="/health")return json(res,200,{status:"READY",provider:"GOOGLE",service:"YOUTUBE",configured:Boolean(CLIENT_ID&&CLIENT_SECRET&&REDIRECT_URI&&ALLOWED_ORIGIN&&STORE_CONFIGURED),persistence:STORE_CONFIGURED?"ENCRYPTED_FIRESTORE_KMS":"NOT_CONFIGURED"});
  if(req.method==="POST"&&url.pathname==="/oauth/google/code"){
    if(!CLIENT_ID||!CLIENT_SECRET||!REDIRECT_URI||!ALLOWED_ORIGIN)return json(res,503,{status:"ENDPOINT_NOT_CONFIGURED"});
    if((req.headers.origin||"")!==ALLOWED_ORIGIN)return json(res,403,{status:"ORIGIN_REJECTED"});
    if(req.headers["x-requested-with"]!=="XmlHttpRequest")return json(res,403,{status:"REQUEST_HEADER_REQUIRED"});
    if(!String(req.headers["content-type"]||"").toLowerCase().startsWith("application/x-www-form-urlencoded"))return json(res,415,{status:"UNSUPPORTED_CONTENT_TYPE"});
    try{
      const form=await body(req),code=form.get("code"),clientId=form.get("client_id");
      if(!code)return json(res,400,{status:"CODE_REQUIRED"});
      if(clientId!==CLIENT_ID)return json(res,403,{status:"CLIENT_ID_MISMATCH"});
      const tokens=await googleToken(code);
      const profile=await youtubeProfile(tokens.access_token);
      if(!tokens.refresh_token)return json(res,409,{status:"REFRESH_TOKEN_REQUIRED",message:"Authorization completed but durable offline access was not granted. Reauthorize with the required Google consent settings."});
      let saved;
      try{saved=await (await connectionStore()).save({providerId:"YOUTUBE",account:profile,tokens,scope:tokens.scope||null});}
      catch(error){console.error("WordDark connection persistence failed:",String(error?.message||"UNKNOWN").slice(0,120));return json(res,503,{status:"PERSISTENCE_UNAVAILABLE",message:"The authorization was received, but secure connection storage is unavailable. No active connection was registered."});}
      return json(res,200,{status:"CONNECTED",provider:"GOOGLE",service:"YOUTUBE",account:{id:profile.id,title:profile.title,customUrl:profile.customUrl,thumbnail:profile.thumbnail,statistics:profile.statistics},scope:tokens.scope||null,expiresIn:tokens.expires_in||null,persistence:"ACTIVE",connection:{providerId:saved.providerId,accountId:saved.accountId,status:saved.status,updatedAt:saved.updatedAt}});
    }catch(e){const tooLarge=e?.message==="REQUEST_TOO_LARGE";const status=tooLarge?413:400;return json(res,status,{status:tooLarge?"REQUEST_TOO_LARGE":"AUTHORIZATION_FAILED",message:"Google authorization could not be completed."});}
  }
  return json(res,404,{status:"NOT_FOUND"});
});
server.listen(PORT,"0.0.0.0",()=>console.log("WordDark Google OAuth bridge ready"));
