import {YouTubeConnector,InstagramConnector,TikTokConnector,FacebookConnector} from "./social-networks.js";

const STORAGE_KEY="wd.external.connections";
const CLIENT_KEY_PREFIX="wd.external.client.";
const EXTERNAL_SETUP_URLS={
  YOUTUBE:"https://console.cloud.google.com/apis/credentials",
  INSTAGRAM:"https://developers.facebook.com/apps/",
  TIKTOK:"https://developers.tiktok.com/",
  FACEBOOK:"https://developers.facebook.com/apps/"
};
const runtimeCredentials=new Map();
const connectionRegistry=new window.ExternalConnectionRegistry();
const $=s=>document.querySelector(s);
const safe=v=>String(v).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const providers=[
{id:"YOUTUBE",name:"YouTube",status:"READY",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]},
{id:"INSTAGRAM",name:"Instagram",status:"OAUTH_BACKEND_REQUIRED",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]},
{id:"TIKTOK",name:"TikTok",status:"OAUTH_BACKEND_REQUIRED",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]},
{id:"FACEBOOK",name:"Facebook",status:"OAUTH_BACKEND_REQUIRED",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]}
];

function connections(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return[]}}
function save(v){localStorage.setItem(STORAGE_KEY,JSON.stringify(v))}
function clientKey(id){return CLIENT_KEY_PREFIX+id}

function render(){
  const items=connections();
  const providersEl=$("#providers");
  if(providersEl) providersEl.innerHTML=providers.map(p=>{
    const cs=items.filter(x=>x.providerId===p.id);
    const status=cs.some(x=>x.status==="CONNECTED")?"CONECTADO":p.status==="READY"?"PRONTO PARA AUTORIZAÇÃO":"OAUTH PREPARADO";
    return '<a class="wd-entry-card" href="'+EXTERNAL_SETUP_URLS[p.id]+'" target="_blank" rel="noopener noreferrer"><div class="wd-card-icon">🔗</div><strong>'+safe(p.name)+'</strong><small>'+status+" · "+cs.length+" conta(s)</small><small>"+safe(p.capabilities.join(" · "))+"</small><small>Abrir painel oficial →</small></a>";
  }).join("");
  const count=$("#connection-count"),state=$("#connection-state");
  if(count) count.textContent=items.length+" conexão"+(items.length===1?"":"ões");
  if(state) state.textContent=items.length?items.map(x=>x.providerId+": "+(x.displayName||x.accountId)).join(" · "):"Nenhum provedor autorizado neste navegador.";
  const yt=$("#youtube-client-id"); if(yt) yt.value=localStorage.getItem(clientKey("YOUTUBE"))||"";
  ["INSTAGRAM","TIKTOK","FACEBOOK"].forEach(id=>{const el=$("#"+id.toLowerCase()+"-client-id");if(el)el.value=localStorage.getItem(clientKey(id))||""});
}

async function connectYouTube(){
  const clientId=$("#youtube-client-id")?.value.trim();
  if(!clientId){window.open(EXTERNAL_SETUP_URLS.YOUTUBE,"_blank","noopener,noreferrer");if($("#connection-note"))$("#connection-note").textContent="YouTube · abrindo Google Cloud → Credenciais.";return;}
  localStorage.setItem(clientKey("YOUTUBE"),clientId);
  const note=$("#connection-note");if(note)note.textContent="Aguardando autorização do Google…";
  try{
    const result=await new YouTubeConnector({clientId}).authorize();
    const items=connections().filter(x=>!(x.providerId==="YOUTUBE"&&x.accountId===result.channel.channelId));
    items.push({providerId:"YOUTUBE",status:"CONNECTED",accountId:result.channel.channelId,displayName:result.channel.displayName,handle:result.channel.customUrl||"",channelUrl:result.channel.url,capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"],connectedAt:new Date().toISOString()});
    save(items);runtimeCredentials.set("YOUTUBE:"+result.channel.channelId,result.accessToken);
    connectionRegistry.setRuntimeCredential("YOUTUBE",result.channel.channelId,result.accessToken);
    window.WD_EXTERNAL_RUNTIME={get:(providerId,accountId)=>runtimeCredentials.get(String(providerId).toUpperCase()+":"+accountId)||null};
    if(note)note.textContent="YouTube conectado: "+result.channel.displayName+" · canal "+result.channel.channelId;
    render();
  }catch(error){console.error(error);if(note)note.textContent="Conexão não concluída: "+(error?.message||error)}
}

function startOAuth(providerId){
  const input=$("#"+providerId.toLowerCase()+"-client-id"),redirect=$("#oauth-redirect-uri"),note=$("#connection-note");
  const clientId=input?.value.trim();
  if(!clientId){window.open(EXTERNAL_SETUP_URLS[providerId],"_blank","noopener,noreferrer");if(note)note.textContent=providerId+" · abrindo painel oficial para configurar a aplicação.";return;}
  const redirectUri=redirect?.value.trim();
  if(!redirectUri){if(note)note.textContent="Informe a Redirect URI cadastrada no provedor.";return;}
  localStorage.setItem(clientKey(providerId),clientId);
  const C={INSTAGRAM:InstagramConnector,TIKTOK:TikTokConnector,FACEBOOK:FacebookConnector}[providerId];
  const result=new C({clientId,redirectUri}).startAuthorization();
  if(note)note.textContent=providerId+" · redirecionando para autorização…";
  return result;
}

$("#youtube-form")?.addEventListener("submit",e=>{e.preventDefault();connectYouTube()});
document.querySelectorAll("[data-oauth-provider]").forEach(button=>button.addEventListener("click",()=>{try{startOAuth(button.dataset.oauthProvider)}catch(error){const n=$("#connection-note");if(n)n.textContent="Não iniciado: "+error.message}}));
render();
