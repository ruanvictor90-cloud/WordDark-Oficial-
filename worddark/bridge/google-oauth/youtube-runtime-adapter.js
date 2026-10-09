import {Buffer} from "node:buffer";

const TOKEN_URL="https://oauth2.googleapis.com/token";
const YOUTUBE_UPLOAD_URL="https://www.googleapis.com/upload/youtube/v3/videos";
const MAX_MEDIA_BYTES=256*1024*1024;

function hasUploadScope(scopeValue){
  const scopes=String(scopeValue||"").split(/\\s+/).filter(Boolean);
  return scopes.some(scope=>scope==="https://www.googleapis.com/auth/youtube.upload"||scope==="youtube.upload");
}
function safeAccount(account){
  return {id:account.accountId,title:account.title||null,customUrl:account.customUrl||null,thumbnail:account.thumbnail||null,statistics:account.statistics||{}};
}
async function readJson(response){
  try{return await response.json()}catch{return {}}
}

/**
 * Server-only YouTube upload adapter.
 * It deliberately is not mounted as an HTTP route; an authenticated internal
 * operation must call it only after policy/review and account authorization.
 */
export function createYouTubeRuntimeAdapter({store,clientId=process.env.GOOGLE_CLIENT_ID,clientSecret=process.env.GOOGLE_CLIENT_SECRET,fetchImpl=globalThis.fetch,clock=()=>Date.now()}={}){
  if(!store||typeof store.load!=="function"||typeof store.loadTokens!=="function"||typeof store.save!=="function")throw new Error("CONNECTION_STORE_REQUIRED");
  if(typeof fetchImpl!=="function")throw new Error("FETCH_UNAVAILABLE");
  async function credentials(accountId){
    const account=await store.load({providerId:"YOUTUBE",accountId});
    if(!account)throw new Error("YOUTUBE_CONNECTION_NOT_FOUND");
    if(account.status!=="PERSISTED"&&account.status!=="ACTIVE")throw new Error("YOUTUBE_CONNECTION_NOT_READY");
    const tokens=await store.loadTokens({providerId:"YOUTUBE",accountId});
    if(!tokens?.refresh_token)throw new Error("YOUTUBE_REFRESH_TOKEN_UNAVAILABLE");
    if(!hasUploadScope(tokens.scope||account.scope))throw new Error("YOUTUBE_UPLOAD_SCOPE_REQUIRED");
    if(!tokens.access_token||!tokens.expiry_date||Number(tokens.expiry_date)<=clock()+60000){
      if(!clientId||!clientSecret)throw new Error("GOOGLE_OAUTH_CLIENT_NOT_CONFIGURED");
      const response=await fetchImpl(TOKEN_URL,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:tokens.refresh_token,grant_type:"refresh_token"})});
      const refreshed=await readJson(response);
      if(!response.ok||!refreshed.access_token)throw new Error("YOUTUBE_TOKEN_REFRESH_FAILED");
      const nextTokens={...tokens,...refreshed,refresh_token:tokens.refresh_token,scope:refreshed.scope||tokens.scope||account.scope,expires_in:refreshed.expires_in||3600};
      await store.save({providerId:"YOUTUBE",account:safeAccount(account),tokens:nextTokens,scope:nextTokens.scope});
      return {account,tokens:{...nextTokens,expiry_date:clock()+Number(nextTokens.expires_in)*1000}};
    }
    return {account,tokens};
  }
  async function uploadVideo({accountId,payload={}}={}){
    const title=String(payload.title||"").trim();
    const media=payload.mediaBytes;
    const mimeType=String(payload.mediaMimeType||"").trim();
    if(!title||title.length>100)throw new Error("VIDEO_TITLE_INVALID");
    if(!Buffer.isBuffer(media)&&!(media instanceof Uint8Array))throw new Error("VIDEO_MEDIA_REQUIRED");
    if(media.byteLength<1||media.byteLength>MAX_MEDIA_BYTES)throw new Error("VIDEO_MEDIA_SIZE_INVALID");
    if(!/^video\\/[a-z0-9.+-]+$/i.test(mimeType))throw new Error("VIDEO_MIME_TYPE_INVALID");
    const {account,tokens}=await credentials(accountId);
    const metadata={snippet:{title,description:String(payload.description||"").slice(0,5000),tags:Array.isArray(payload.tags)?payload.tags.map(String).slice(0,30):[]},status:{privacyStatus:["private","unlisted","public"].includes(payload.privacyStatus)?payload.privacyStatus:"private",selfDeclaredMadeForKids:Boolean(payload.madeForKids)}};
    const init=await fetchImpl(YOUTUBE_UPLOAD_URL+"?uploadType=resumable&part=snippet,status",{method:"POST",headers:{Authorization:"Bearer "+tokens.access_token,"Content-Type":"application/json; charset=UTF-8","X-Upload-Content-Type":mimeType,"X-Upload-Content-Length":String(media.byteLength)},body:JSON.stringify(metadata)});
    if(!init.ok)throw new Error("YOUTUBE_UPLOAD_INITIALIZATION_FAILED");
    const uploadUrl=init.headers?.get?.("location");
    if(!uploadUrl||!uploadUrl.startsWith("https://www.googleapis.com/upload/youtube/v3/videos"))throw new Error("YOUTUBE_UPLOAD_SESSION_INVALID");
    const uploaded=await fetchImpl(uploadUrl,{method:"PUT",headers:{"Content-Type":mimeType,"Content-Length":String(media.byteLength)},body:media});
    const result=await readJson(uploaded);
    if(!uploaded.ok||!result.id)throw new Error("YOUTUBE_UPLOAD_FAILED");
    return {success:true,status:"UPLOADED",providerId:"YOUTUBE",accountId:account.accountId,externalId:result.id,privacyStatus:result.status?.privacyStatus||metadata.status.privacyStatus,uploadUrl:"https://www.youtube.com/watch?v="+encodeURIComponent(result.id)};
  }
  return Object.freeze({execute:async(request)=>{if(request?.providerId!=="YOUTUBE")throw new Error("PROVIDER_NOT_SUPPORTED");if(request.action!=="VIDEO_UPLOAD")throw new Error("YOUTUBE_ACTION_NOT_SUPPORTED");return uploadVideo({accountId:request.accountId,payload:request.payload});}});
}
