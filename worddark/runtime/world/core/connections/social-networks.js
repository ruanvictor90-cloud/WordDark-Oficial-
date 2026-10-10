export const SOCIAL_NETWORKS=Object.freeze({
  INSTAGRAM:{id:"INSTAGRAM",name:"Instagram",connectorStatus:"OAUTH_BACKEND_REQUIRED",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]},
  TIKTOK:{id:"TIKTOK",name:"TikTok",connectorStatus:"OAUTH_BACKEND_REQUIRED",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]},
  YOUTUBE:{id:"YOUTUBE",name:"YouTube",connectorStatus:"READY",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]},
  FACEBOOK:{id:"FACEBOOK",name:"Facebook",connectorStatus:"OAUTH_BACKEND_REQUIRED",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"]}
});

export const YOUTUBE_SCOPES=Object.freeze([
  "https://www.googleapis.com/auth/youtube.readonly","https://www.googleapis.com/auth/youtube.upload"
]);

export const INSTAGRAM_SCOPES=Object.freeze([
  "instagram_business_basic","instagram_business_content_publish"
]);

export const TIKTOK_SCOPES=Object.freeze([
  "user.info.basic","video.publish"
]);

export const FACEBOOK_SCOPES=Object.freeze([
  "public_profile","pages_show_list","pages_read_engagement","pages_manage_posts"
]);

export class SocialNetworkConnector{
  constructor({network}={}){if(!network)throw new Error("NETWORK_REQUIRED");const adapter=SOCIAL_NETWORKS[network];if(!adapter)throw new Error("NETWORK_NOT_SUPPORTED");this.network=adapter;}
  authorizationRequest({accountId,redirectUri}={}){if(!accountId)throw new Error("ACCOUNT_ID_REQUIRED");return {network:this.network.id,accountId,redirectUri:redirectUri||null,status:"AUTHORIZATION_REQUIRED",createdAt:new Date().toISOString()};}
  status(){return {...this.network};}
}

export class BrowserOAuthConnector extends SocialNetworkConnector{
  constructor({network,clientId,redirectUri,scopes}={}){super({network});if(!clientId?.trim())throw new Error(this.network.id+"_CLIENT_ID_REQUIRED");if(!redirectUri?.trim())throw new Error(this.network.id+"_REDIRECT_URI_REQUIRED");this.clientId=clientId.trim();this.redirectUri=redirectUri.trim();this.scopes=[...(scopes||[])];}
  createState(){const state=crypto.randomUUID();sessionStorage.setItem("wd.oauth.state."+this.network.id,state);return state;}
  buildAuthorizationUrl({state=this.createState()}={}){const params=new URLSearchParams({client_id:this.clientId,redirect_uri:this.redirectUri,response_type:"code",state});if(this.network.id==="INSTAGRAM"){params.set("scope",this.scopes.join(","));return "https://www.instagram.com/oauth/authorize?"+params;}
    if(this.network.id==="TIKTOK"){params.set("scope",this.scopes.join(","));return "https://www.tiktok.com/v2/auth/authorize?"+params;}
    if(this.network.id==="FACEBOOK"){params.set("scope",this.scopes.join(","));return "https://www.facebook.com/dialog/oauth?"+params;}
    throw new Error("OAUTH_PROVIDER_NOT_IMPLEMENTED");
  }
  startAuthorization(options={}){const url=this.buildAuthorizationUrl(options);window.location.assign(url);return {status:"REDIRECTING",network:this.network.id,url};}
  validateCallback({code,state,error}={}){const expected=sessionStorage.getItem("wd.oauth.state."+this.network.id);if(error)throw new Error(error);if(!code)throw new Error("OAUTH_CODE_REQUIRED");if(!state||state!==expected)throw new Error("OAUTH_STATE_INVALID");sessionStorage.removeItem("wd.oauth.state."+this.network.id);return {status:"CODE_RECEIVED",network:this.network.id,code};}
}

export class InstagramConnector extends BrowserOAuthConnector{
  constructor({clientId,redirectUri}={}){super({network:"INSTAGRAM",clientId,redirectUri,scopes:INSTAGRAM_SCOPES});}
}

export class TikTokConnector extends BrowserOAuthConnector{
  constructor({clientId,redirectUri}={}){super({network:"TIKTOK",clientId,redirectUri,scopes:TIKTOK_SCOPES});}
}

export class FacebookConnector extends BrowserOAuthConnector{
  constructor({clientId,redirectUri}={}){super({network:"FACEBOOK",clientId,redirectUri,scopes:FACEBOOK_SCOPES});}
}

export class YouTubeConnector extends SocialNetworkConnector{
  constructor({clientId}={}){super({network:"YOUTUBE"});if(!clientId?.trim())throw new Error("YOUTUBE_CLIENT_ID_REQUIRED");this.clientId=clientId.trim();}
  async authorize(){
    if(!window.google?.accounts?.oauth2)throw new Error("GOOGLE_IDENTITY_SERVICES_NOT_READY");
    return new Promise((resolve,reject)=>{
      const tokenClient=window.google.accounts.oauth2.initTokenClient({
        client_id:this.clientId,scope:YOUTUBE_SCOPES.join(" "),
        callback:async response=>{
          if(response?.error){reject(new Error(response.error));return;}
          try{const channel=await this.fetchChannel(response.access_token);resolve({accessToken:response.access_token,expiresIn:Number(response.expires_in||0),channel});}
          catch(error){reject(error);}
        }
      });
      tokenClient.requestAccessToken({prompt:"consent"});
    });
  }
  async fetchChannel(accessToken){
    const response=await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true",{headers:{Authorization:"Bearer "+accessToken}});
    const data=await response.json();if(!response.ok)throw new Error(data?.error?.message||"YOUTUBE_CHANNEL_REQUEST_FAILED");
    const item=data?.items?.[0];if(!item)throw new Error("YOUTUBE_CHANNEL_NOT_FOUND");
    const channel={channelId:item.id,displayName:item.snippet?.title||"YouTube",description:item.snippet?.description||"",customUrl:item.snippet?.customUrl||"",thumbnail:item.snippet?.thumbnails?.high?.url||item.snippet?.thumbnails?.default?.url||"",statistics:item.statistics||{},url:"https://www.youtube.com/channel/"+item.id};
    try{if(window.WordDarkSocialAnalytics){new window.WordDarkSocialAnalytics().save({providerId:"YOUTUBE",accountId:item.id,metrics:{views:Number(item.statistics?.viewCount||0),uniqueViews:0,subscribers:Number(item.statistics?.subscriberCount||0)},topContent:[]});}}catch(error){console.warn("WordDark analytics snapshot não salvo:",error);}
    return channel;
  }
}