import {YouTubeConnector,InstagramConnector,TikTokConnector,FacebookConnector} from "../../../../core-central/social-networks.js";
const STORAGE_KEY="wd.external.connections", CLIENT_KEY_PREFIX="wd.external.client.";
const runtimeCredentials=new Map();
const connectionRegistry=new window.ExternalConnectionRegistry();
const $=s=>document.querySelector(s);
const safe=v=>String(v).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const providers=[
{id:"YOUTUBE",name:"YouTube",status:"READY",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]},
{id:"INSTAGRAM",name:"Instagram",status:"OAUTH_BACKEND_REQUIRED",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]},
{id:"TIKTOK",name:"TikTok",status:"OAUTH_BACKEND_REQUIRED",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]},
{id:"FACEBOOK",name:"Facebook",status:"OAUTH_BACKEND_REQUIRED",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]}];
function connections(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return[]}}
function save(v){localStorage.setItem(STORAGE_KEY,JSON.stringify(v))}
function clientKey(id){return CLIENT_KEY_PREFIX+id}
function render(){const items=connections();$("#providers").innerHTML=providers.map(p=>{const c=items.find(x=>x.providerId===p.id);const status=c?.status==="CONNECTED"?"CONECTADO":p.status==="READY"?"PRONTO PARA AUTORIZAÇÃO":"OAUTH PREPARADO";return '<article class="wd-entry-card"><div class="wd-card-icon">🔗</div><strong>'+safe(p.name)+'</strong><small>'+status+(c?" · "+safe(c.displayName||c.accountId):"")+'</small><small>'+safe(p.capabilities.join(" · "))+'</small></article>'}).join("");
$("#connection-count").textContent=items.length+" conexão"+(items.length===1?"":"ões");
$("#connection-state").textContent=items.length?items.map(x=>x.providerId+": "+(x.displayName||x.accountId)).join(" · "):"Nenhum provedor autorizado neste navegador.";
$("#youtube-client-id").value=localStorage.getItem(clientKey("YOUTUBE"))||"";
["INSTAGRAM","TIKTOK","FACEBOOK"].forEach(id=>{$("#"+id.toLowerCase()+"-client-id").value=localStorage.getItem(clientKey(id))||""})}
async function connectYouTube(){const clientId=$("#youtube-client-id").value.trim();if(!clientId)throw new Error("YOUTUBE_CLIENT_ID_REQUIRED");localStorage.setItem(clientKey("YOUTUBE"),clientId);const note=$("#connection-note");note.textContent="Aguardando autorização do Google…";try{const result=await new YouTubeConnector({clientId}).authorize();const items=connections().filter(x=>x.providerId!=="YOUTUBE");items.push({providerId:"YOUTUBE",status:"CONNECTED",accountId:result.channel.channelId,displayName:result.channel.displayName,handle:result.channel.customUrl||"",channelUrl:result.channel.url,capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"],connectedAt:new Date().toISOString()});save(items);runtimeCredentials.set("YOUTUBE:"+result.channel.channelId,result.accessToken);connectionRegistry.setRuntimeCredential("YOUTUBE",result.channel.channelId,result.accessToken);window.WD_EXTERNAL_RUNTIME={get:(providerId,accountId)=>runtimeCredentials.get(String(providerId).toUpperCase()+":"+accountId)||null};note.textContent="YouTube conectado: "+result.channel.displayName+" · canal "+result.channel.channelId;render()}catch(error){console.error(error);note.textContent="Conexão não concluída: "+(error?.message||error)}}
function startOAuth(providerId){const input=$("#"+providerId.toLowerCase()+"-client-id"),redirect=$("#oauth-redirect-uri").value.trim(),note=$("#connection-note");const clientId=input.value.trim();if(!clientId)throw new Error(providerId+"_CLIENT_ID_REQUIRED");if(!redirect)throw new Error("OAUTH_REDIRECT_URI_REQUIRED");localStorage.setItem(clientKey(providerId),clientId);const C={INSTAGRAM:InstagramConnector,TIKTOK:TikTokConnector,FACEBOOK:FacebookConnector}[providerId];const connector=new C({clientId,redirectUri:redirect});const result=connector.startAuthorization();note.textContent=providerId+" · redirecionando para autorização…";return result}
$("#youtube-form").addEventListener("submit",e=>{e.preventDefault();connectYouTube().catch(err=>$("#connection-note").textContent="Conexão não concluída: "+err.message)});
document.querySelectorAll("[data-oauth-provider]").forEach(button=>button.addEventListener("click",()=>{try{startOAuth(button.dataset.oauthProvider)}catch(error){$("#connection-note").textContent="Não iniciado: "+error.message}}));
render();
