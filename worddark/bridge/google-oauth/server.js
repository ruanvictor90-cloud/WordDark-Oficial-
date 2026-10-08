import http from "node:http";
import {URL} from "node:url";

const PORT=Number(process.env.PORT||8080);
const CLIENT_ID=process.env.GOOGLE_CLIENT_ID||"";
const CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET||"";
const REDIRECT_URI=process.env.GOOGLE_REDIRECT_URI||"";
const ALLOWED_ORIGIN=process.env.WORDDARK_ALLOWED_ORIGIN||"";

function json(res,status,body){
  res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ALLOWED_ORIGIN||"null","Access-Control-Allow-Headers":"Content-Type, X-Requested-With","Access-Control-Allow-Methods":"POST, GET, OPTIONS","Cache-Control":"no-store"});
  res.end(JSON.stringify(body));
}
async function body(req){let raw="";for await(const chunk of req)raw+=chunk;return new URLSearchParams(raw);}
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
  if(req.method==="GET"&&url.pathname==="/health")return json(res,200,{status:"READY",provider:"GOOGLE",service:"YOUTUBE",configured:Boolean(CLIENT_ID&&CLIENT_SECRET&&REDIRECT_URI&&ALLOWED_ORIGIN)});
  if(req.method==="POST"&&url.pathname==="/oauth/google/code"){
    if(!CLIENT_ID||!CLIENT_SECRET||!REDIRECT_URI||!ALLOWED_ORIGIN)return json(res,503,{status:"ENDPOINT_NOT_CONFIGURED"});
    if((req.headers.origin||"")!==ALLOWED_ORIGIN)return json(res,403,{status:"ORIGIN_REJECTED"});
    try{
      const form=await body(req),code=form.get("code"); if(!code)return json(res,400,{status:"CODE_REQUIRED"});
      const tokens=await googleToken(code);
      const profile=await youtubeProfile(tokens.access_token);
      return json(res,200,{status:"CONNECTED",provider:"GOOGLE",service:"YOUTUBE",account:{id:profile.id,title:profile.title,customUrl:profile.customUrl,thumbnail:profile.thumbnail,statistics:profile.statistics},scope:tokens.scope||null,expiresIn:tokens.expires_in||null,persistence:"PENDING"});
    }catch(e){return json(res,400,{status:"AUTHORIZATION_FAILED",message:e.message});}
  }
  return json(res,404,{status:"NOT_FOUND"});
});
server.listen(PORT,"0.0.0.0",()=>console.log("WordDark Google OAuth bridge ready"));
