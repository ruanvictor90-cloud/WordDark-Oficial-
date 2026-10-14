/* WordDark — YouTube server-side publisher adapter
 * Dormant by design: this module is not exposed by the HTTP server yet.
 * Call only from a trusted backend after identity, approval, capability and quota checks.
 * Never import this module into GitHub Pages/browser code.
 */
const TOKEN_URL="https://oauth2.googleapis.com/token";
const UPLOAD_URL="https://www.googleapis.com/upload/youtube/v3/videos";

function fail(status,reason){return{success:false,status,reason};}
function parseScopes(scope){return String(scope||"").split(/\s+/).filter(Boolean);}

function createYouTubePublisher({
  connectionStore,
  clientId=process.env.GOOGLE_CLIENT_ID||"",
  clientSecret=process.env.GOOGLE_CLIENT_SECRET||"",
  fetchImpl=globalThis.fetch,
  now=()=>Date.now()
}={}){
  if(!connectionStore||typeof connectionStore.loadTokens!=="function")throw new Error("YOUTUBE_CONNECTION_STORE_REQUIRED");
  if(typeof fetchImpl!=="function")throw new Error("FETCH_IMPLEMENTATION_REQUIRED");

  async function refreshAccessToken(tokens){
    if(!clientId||!clientSecret||!tokens?.refresh_token)throw new Error("YOUTUBE_REFRESH_CONFIGURATION_MISSING");
    const response=await fetchImpl(TOKEN_URL,{
      method:"POST",
      headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:tokens.refresh_token,grant_type:"refresh_token"})
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.access_token)throw new Error("YOUTUBE_ACCESS_TOKEN_REFRESH_FAILED");
    return result.access_token;
  }

  async function publishVideo({
    accountId,videoBuffer,mimeType="video/mp4",title,description="",tags=[],privacyStatus="private",categoryId
  }={}){
    if(!accountId)return fail("ACCOUNT_ID_REQUIRED","A conta YouTube é obrigatória.");
    if(!title||typeof title!=="string"||title.trim().length>100)return fail("INVALID_TITLE","O título é obrigatório e deve ter até 100 caracteres.");
    if(typeof description!=="string"||description.length>5000)return fail("INVALID_DESCRIPTION","A descrição deve ter até 5000 caracteres.");
    if(!Array.isArray(tags)||tags.some(tag=>typeof tag!=="string"||tag.length>500))return fail("INVALID_TAGS","As tags devem ser uma lista de textos válidos.");
    if(!["private","unlisted","public"].includes(privacyStatus))return fail("INVALID_PRIVACY_STATUS","A visibilidade deve ser private, unlisted ou public.");
    if(!Buffer.isBuffer(videoBuffer)&&!(videoBuffer instanceof Uint8Array))return fail("VIDEO_BYTES_REQUIRED","O vídeo precisa ser entregue ao adaptador como bytes no backend.");
    if(videoBuffer.byteLength===0)return fail("VIDEO_EMPTY","O arquivo de vídeo está vazio.");
    if(!/^video\/[a-zA-Z0-9.+-]+$/.test(mimeType))return fail("INVALID_VIDEO_MIME_TYPE","O MIME type deve identificar um vídeo.");

    let tokens;
    try{tokens=await connectionStore.loadTokens({providerId:"YOUTUBE",accountId:String(accountId)});}
    catch{return fail("TOKEN_STORE_UNAVAILABLE","Não foi possível acessar o cofre seguro de credenciais.");}
    if(!tokens?.refresh_token)return fail("YOUTUBE_ACCOUNT_NOT_AUTHORIZED","A conta não tem refresh token armazenado no backend.");
    const scopes=parseScopes(tokens.scope);
    if(!scopes.includes("https://www.googleapis.com/auth/youtube.upload"))return fail("YOUTUBE_UPLOAD_SCOPE_REQUIRED","A conta precisa autorizar o escopo youtube.upload.");

    let accessToken;
    try{accessToken=await refreshAccessToken(tokens);}
    catch{return fail("YOUTUBE_AUTH_REFRESH_FAILED","Não foi possível renovar a autorização do YouTube.");}

    const snippet={title:title.trim(),description,tags};
    if(categoryId)snippet.categoryId=String(categoryId);
    const metadata={snippet,status:{privacyStatus}};
    const bytes=Buffer.from(videoBuffer);
    let session;
    try{
      session=await fetchImpl(UPLOAD_URL+"?uploadType=resumable&part=snippet,status",{
        method:"POST",
        headers:{
          Authorization:"Bearer "+accessToken,
          "Content-Type":"application/json; charset=UTF-8",
          "X-Upload-Content-Length":String(bytes.length),
          "X-Upload-Content-Type":mimeType
        },
        body:JSON.stringify(metadata)
      });
    }catch{return fail("YOUTUBE_UPLOAD_SESSION_FAILED","Não foi possível iniciar a sessão de envio do vídeo.");}
    if(!session.ok)return fail("YOUTUBE_UPLOAD_SESSION_FAILED","O YouTube recusou iniciar a sessão de envio.");
    const uploadUrl=session.headers?.get?.("location");
    if(!uploadUrl)return fail("YOUTUBE_UPLOAD_LOCATION_MISSING","O YouTube não retornou o endereço da sessão de envio.");
    // A sessão é devolvida pelo endpoint oficial. Não envie bytes de mídia a um host arbitrário.
    let parsedUploadUrl;
    try{parsedUploadUrl=new URL(uploadUrl);}catch{return fail("YOUTUBE_UPLOAD_LOCATION_INVALID","O endereço da sessão de envio é inválido.");}
    if(parsedUploadUrl.protocol!=="https:"||!(parsedUploadUrl.hostname==="googleapis.com"||parsedUploadUrl.hostname.endsWith(".googleapis.com"))){
      return fail("YOUTUBE_UPLOAD_LOCATION_REJECTED","O endereço da sessão não pertence ao domínio seguro da API Google.");
    }
    let uploaded;
    try{
      uploaded=await fetchImpl(uploadUrl,{
        method:"PUT",
        headers:{"Content-Type":mimeType},
        body:bytes
      });
    }catch{return fail("YOUTUBE_UPLOAD_FAILED","O envio do vídeo foi interrompido; verifique o estado antes de tentar novamente.");}
    const result=await uploaded.json().catch(()=>({}));
    if(!uploaded.ok||!result.id)return fail("YOUTUBE_UPLOAD_FAILED","O YouTube não confirmou o envio do vídeo.");
    return{
      success:true,status:"UPLOAD_COMPLETED",providerId:"YOUTUBE",accountId:String(accountId),
      externalId:result.id,privacyStatus:result.status?.privacyStatus||privacyStatus,
      url:"https://www.youtube.com/watch?v="+encodeURIComponent(result.id),
      completedAt:new Date(now()).toISOString()
    };
  }

  return Object.freeze({publishVideo});
}

export {createYouTubePublisher};
