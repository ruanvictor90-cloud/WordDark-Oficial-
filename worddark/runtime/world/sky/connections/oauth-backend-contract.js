/* WordDark — Contrato de OAuth seguro v0.1
 * Contrato para backend futuro. O GitHub Pages inicia o fluxo; o backend
 * troca code por token e mantém client secrets/refresh tokens fora do frontend.
 */
(function(global){
  const PROVIDERS=Object.freeze({
    INSTAGRAM:{id:"INSTAGRAM",callbackPath:"/oauth/callback/instagram",exchangeRequired:true,capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]},
    TIKTOK:{id:"TIKTOK",callbackPath:"/oauth/callback/tiktok",exchangeRequired:true,capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]},
    FACEBOOK:{id:"FACEBOOK",callbackPath:"/oauth/callback/facebook",exchangeRequired:true,capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]},
    YOUTUBE:{id:"YOUTUBE",callbackPath:"/oauth/callback/youtube",exchangeRequired:false,capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]}
  });
  function request(provider,{code,state,redirectUri}={}){
    const p=PROVIDERS[String(provider||"").toUpperCase()];
    if(!p)throw new Error("OAUTH_PROVIDER_NOT_SUPPORTED");
    if(!code||!state)throw new Error("OAUTH_CODE_AND_STATE_REQUIRED");
    return {provider:p.id,code,state,redirectUri:redirectUri||null,callbackPath:p.callbackPath,exchangeRequired:p.exchangeRequired};
  }
  global.WordDarkOAuthBackendContract={PROVIDERS,request};
})(typeof globalThis!=="undefined"?globalThis:window);
