import {createPublicationAuthorizationGate} from "./publication-authorization.js";
import {createYouTubePublisher} from "./youtube-publisher.js";
import {createCloudConnectionStore} from "./connection-store.js";
import {createCloudPublicationStore} from "./publication-store.js";

/*
 * Composition root for server-only publication.
 * No HTTP route is registered here. A trusted caller must supply an authenticated
 * operator context and a media buffer obtained through a trusted backend path.
 */
export function createPublicationRuntime({
  connectionStore,
  publicationStore,
  publisher,
  authenticateOperator,
  authorizeOperation,
  approveOperation,
  clock=()=>new Date(),
  quotaLimit=20,
  quotaWindowMs=86400000,
  maxVideoBytes=256*1024*1024
}={}){
  if(!connectionStore||typeof connectionStore.loadTokens!=="function"||typeof connectionStore.load!=="function"){
    throw new Error("PUBLICATION_CONNECTION_STORE_REQUIRED");
  }
  if(!publicationStore||typeof publicationStore.claim!=="function"||typeof publicationStore.complete!=="function"||typeof publicationStore.audit!=="function"||typeof publicationStore.consumeQuota!=="function"){
    throw new Error("PUBLICATION_STORE_REQUIRED");
  }
  const youtubePublisher=publisher||createYouTubePublisher({connectionStore});
  const gate=createPublicationAuthorizationGate({
    authenticateOperator,
    authorizeOperation,
    approveOperation,
    idempotencyStore:publicationStore,
    audit:publicationStore.audit,
    consumeQuota:({principal,request})=>publicationStore.consumeQuota({
      principal,request,limit:quotaLimit,windowMs:quotaWindowMs
    }),
    clock
  });

  async function publishYouTube({request,idempotencyKey,operatorContext,media}={}){
    // Este adapter só executa publicação de vídeo no YouTube. Nunca reinterpretar
    // UNPUBLISH/SCHEDULE ou outro provedor como um upload de vídeo.
    if(!request||String(request.providerId||"").toUpperCase()!=="YOUTUBE"){
      return{success:false,status:"PUBLICATION_PROVIDER_UNSUPPORTED",reason:"Este runtime aceita somente o provedor YOUTUBE."};
    }
    if(String(request.action||"").toUpperCase()!=="CONTENT_PUBLISH"||String(request.capability||"").toUpperCase()!=="CONTENT_PUBLICATION"){
      return{success:false,status:"PUBLICATION_ACTION_UNSUPPORTED",reason:"Este runtime aceita somente a ação CONTENT_PUBLISH."};
    }
    if(!media||!Buffer.isBuffer(media.videoBuffer)){
      return{success:false,status:"TRUSTED_MEDIA_REQUIRED",reason:"O backend precisa fornecer os bytes de mídia por um caminho confiável."};
    }
    if(media.videoBuffer.length===0){
      return{success:false,status:"VIDEO_EMPTY",reason:"O arquivo de vídeo está vazio."};
    }
    if(!Number.isSafeInteger(maxVideoBytes)||maxVideoBytes<1||media.videoBuffer.length>maxVideoBytes){
      return{success:false,status:"VIDEO_TOO_LARGE",reason:"O arquivo excede o limite de tamanho configurado."};
    }
    const authorization=await gate.authorize({
      request:structuredClone(request),
      idempotencyKey,
      operatorContext
    });
    if(!authorization.allowed)return{success:false,...authorization};

    let result;
    try{
      const connection=await connectionStore.load({providerId:"YOUTUBE",accountId:authorization.accountId});
      const grantedCapabilities=Array.isArray(connection?.capabilities)?connection.capabilities:[];
      const grantedScopes=String(connection?.scope||"").split(/\s+/).filter(Boolean);
      const uploadScope="https://www.googleapis.com/auth/youtube.upload";
      if(!connection||connection.status!=="PERSISTED"||String(connection.providerId||"").toUpperCase()!=="YOUTUBE"||String(connection.accountId||"")!==String(authorization.accountId||"")){
        result={success:false,status:"YOUTUBE_CONNECTION_NOT_PERSISTED",reason:"A conta YouTube não possui autorização persistida utilizável."};
      }else if(!grantedCapabilities.includes("CONTENT_PUBLICATION")){
        result={success:false,status:"YOUTUBE_PUBLICATION_CAPABILITY_NOT_GRANTED",reason:"A conta persistida ainda não recebeu a capacidade canônica CONTENT_PUBLICATION."};
      }else if(!grantedScopes.includes(uploadScope)&&!grantedScopes.includes("youtube.upload")){
        result={success:false,status:"YOUTUBE_UPLOAD_SCOPE_NOT_GRANTED",reason:"A autorização OAuth persistida não contém o escopo youtube.upload."};
      }else{
        const payload=request.payload||{};
        result=await youtubePublisher.publishVideo({
          accountId:authorization.accountId,
          videoBuffer:media.videoBuffer,
          mimeType:media.mimeType,
          title:payload.title,
          description:payload.description,
          tags:payload.tags,
          privacyStatus:payload.privacyStatus
        });
      }
    }catch{
      result={success:false,status:"PUBLICATION_EXECUTION_FAILED",reason:"A operação externa falhou; consulte o registro operacional para detalhes seguros."};
    }
    const recorded=await gate.complete(authorization,{
      status:result.status||"UNKNOWN",
      externalId:result.videoId||null
    });
    if(!recorded.success){
      return{success:false,status:"PUBLICATION_RESULT_RECORD_FAILED",publicationStatus:result.status||"UNKNOWN",reason:recorded.reason};
    }
    return{...result,recorded:true,operationId:authorization.operationId,approvalId:authorization.approvalId};
  }

  return Object.freeze({publishYouTube});
}

export async function createCloudPublicationRuntime(options={}){
  const connectionStore=options.connectionStore||await createCloudConnectionStore();
  const publicationStore=options.publicationStore||await createCloudPublicationStore();
  return createPublicationRuntime({...options,connectionStore,publicationStore});
}
