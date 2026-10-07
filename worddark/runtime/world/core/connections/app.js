import {YouTubeConnector,InstagramConnector,TikTokConnector,FacebookConnector} from "./social-networks.js";
const STORAGE_KEY="wd.external.connections", CLIENT_KEY_PREFIX="wd.external.client.";\n// Esta interface pertence ao WordDark; setores apenas consomem suas conexões.
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
function render(){
 const items=connections();
 $("providers").innerHTML=providers.map(p=>{
   const cs=items.filter(x=>x.providerId===p.id);
   const status=cs.some(x=>x.status==="CONNECTED")?"CONECTADO":p.status==="READY"?"PRONTO PARA AUTORIZAÇÃO":"OAUTH PREPARADO";
   return '<article class="wd-entry-card"><div class="wd-card-icon">🔗</div><strong>'+safe(p.name)+'</strong><small>'+status+" · "+cs.length+" conta(s)</small><small>"+safe(p.capabilities.join(" · "))+"</small></article>"
 }).join("");
 $("connection-count").textContent=items.length+" conexão"+(items.length===1?"":"ões");
 $("connection-state").textContent=items.length?items.map(x=>x.providerId+": "+(x.displayName||x.accountId)).join(" · "):"Nenhum provedor autorizado neste navegador.";
 $("youtube-client-id").value=localStorage.getItem(clientKey("YOUTUBE"))||"";
 ["INSTAGRAM","TIKTOK","FACEBOOK"].forEach(id=>{$("#"+id.toLowerCase()+"-client-id").value=localStorage.getItem(clientKey(id))||""});
 renderPilots();
}
function renderPilots(){
 const profiles=window.WordDarkPilotProfiles.list();
 const youtube=connections().filter(x=>x.providerId==="YOUTUBE"&&x.status==="CONNECTED");
 $("#pilot-profile").innerHTML=profiles.map(p=>"<option value='"+safe(p.id)+"'>"+safe(p.name)+"</option>").join("");
 $("#pilot-account").innerHTML='<option value="">Selecione uma conta YouTube conectada</option>'+youtube.map(c=>"<option value='"+safe(c.accountId)+"'>"+safe(c.displayName||c.accountId)+" · "+safe(c.accountId)+"</option>").join("");
 const selected=profiles[0];
 $("#pilot-status").textContent=selected?"Perfis-piloto prontos. Vincule cada perfil à conta externa correspondente.":"Nenhum perfil-piloto.";
}
async function connectYouTube(){
 const clientId=$("#youtube-client-id").value.trim();
 if(!clientId)throw new Error("YOUTUBE_CLIENT_ID_REQUIRED");
 localStorage.setItem(clientKey("YOUTUBE"),clientId);
 const note=$("#connection-note");note.textContent="Aguardando autorização do Google…";
 try{
   const result=await new YouTubeConnector({clientId}).authorize();
   const items=connections().filter(x=>!(x.providerId==="YOUTUBE"&&x.accountId===result.channel.channelId));
   items.push({providerId:"YOUTUBE",status:"CONNECTED",accountId:result.channel.channelId,displayName:result.channel.displayName,handle:result.channel.customUrl||"",channelUrl:result.channel.url,capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"],connectedAt:new Date().toISOString()});
   save(items);
   runtimeCredentials.set("YOUTUBE:"+result.channel.channelId,result.accessToken);
   connectionRegistry.setRuntimeCredential("YOUTUBE",result.channel.channelId,result.accessToken);
   window.WD_EXTERNAL_RUNTIME={get:(providerId,accountId)=>runtimeCredentials.get(String(providerId).toUpperCase()+":"+accountId)||null};
   note.textContent="YouTube conectado: "+result.channel.displayName+" · canal "+result.channel.channelId;
   render();
 }catch(error){console.error(error);note.textContent="Conexão não concluída: "+(error?.message||error)}
}
function startOAuth(providerId){
 const input=$("#"+providerId.toLowerCase()+"-client-id"),redirect=$("#oauth-redirect-uri").value.trim(),note=$("#connection-note");
 const clientId=input.value.trim();if(!clientId)throw new Error(providerId+"_CLIENT_ID_REQUIRED");
 if(!redirect)throw new Error("OAUTH_REDIRECT_URI_REQUIRED");
 localStorage.setItem(clientKey(providerId),clientId);
 const C={INSTAGRAM:InstagramConnector,TIKTOK:TikTokConnector,FACEBOOK:FacebookConnector}[providerId];
 const connector=new C({clientId,redirectUri:redirect});const result=connector.startAuthorization();
 note.textContent=providerId+" · redirecionando para autorização…";return result;
}
async function publishPilot(){
 const profileId=$("#pilot-profile").value,accountId=$("#pilot-account").value,privacy=$("#pilot-privacy").value;
 if(!profileId||!accountId)throw new Error("PILOT_PROFILE_AND_ACCOUNT_REQUIRED");
 const account=connections().find(x=>x.providerId==="YOUTUBE"&&x.accountId===accountId&&x.status==="CONNECTED");
 const token=runtimeCredentials.get("YOUTUBE:"+accountId)||connectionRegistry.getRuntimeCredential("YOUTUBE",accountId);
 if(!account||!token)throw new Error("YOUTUBE_RUNTIME_AUTH_REQUIRED_FOR_SELECTED_ACCOUNT");
 const profile=window.WordDarkPilotProfiles.bind(profileId,"YOUTUBE",account);
 const status=$("#pilot-status");status.textContent="Gerando mídia real no navegador…";
 const media=await window.WordDarkMediaBootstrapProducer.produce({title:profile.name+" · primeiro piloto",subtitle:"Primeira operação real do WordDark",duration:5});
 status.textContent="Mídia pronta. Enviando ao YouTube…";
 const result=await window.WordDarkYouTubePublisher.publish({accessToken:token,title:profile.name+" · primeiro piloto WordDark",description:"Primeira operação-piloto do WordDark. Conteúdo gerado pela infraestrutura de teste da Dark Factory.",blob:media.blob,privacyStatus:privacy,channelId:accountId,tags:["WordDark",profile.name]});
 status.textContent="PUBLICADO · "+result.url;
 return result;
}
$("#youtube-form").addEventListener("submit",e=>{e.preventDefault();connectYouTube()});
document.querySelectorAll("[data-oauth-provider]").forEach(button=>button.addEventListener("click",()=>{try{startOAuth(button.dataset.oauthProvider)}catch(error){$("#connection-note").textContent="Não iniciado: "+error.message}}));
$("#pilot-publish").addEventListener("click",async()=>{try{const r=await publishPilot();$("#pilot-result").textContent=JSON.stringify(r,null,2)}catch(error){$("#pilot-status").textContent="Falha: "+error.message;$("#pilot-result").textContent=JSON.stringify({error:error.message},null,2)}});
render();
