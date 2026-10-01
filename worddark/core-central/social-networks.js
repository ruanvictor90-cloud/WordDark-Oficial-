export const SOCIAL_NETWORKS=Object.freeze({
  INSTAGRAM:{id:'INSTAGRAM',name:'Instagram',status:'OAUTH_READY'},
  TIKTOK:{id:'TIKTOK',name:'TikTok',status:'OAUTH_READY'},
  YOUTUBE:{id:'YOUTUBE',name:'YouTube',status:'OAUTH_READY'},
  FACEBOOK:{id:'FACEBOOK',name:'Facebook',status:'OAUTH_READY'}
});

export const YOUTUBE_SCOPES=Object.freeze([
  'https://www.googleapis.com/auth/youtube.readonly'
]);

export class SocialNetworkConnector{
  constructor({network}={}){if(!network)throw new Error('NETWORK_REQUIRED');const adapter=SOCIAL_NETWORKS[network];if(!adapter)throw new Error('NETWORK_NOT_SUPPORTED');this.network=adapter;}
  authorizationRequest({accountId,redirectUri}={}){if(!accountId)throw new Error('ACCOUNT_ID_REQUIRED');return {network:this.network.id,accountId,redirectUri:redirectUri||null,status:'AUTHORIZATION_REQUIRED',createdAt:new Date().toISOString()};}
  status(){return {...this.network};}
}

export class YouTubeConnector extends SocialNetworkConnector{
  constructor({clientId}={}){super({network:'YOUTUBE'});if(!clientId?.trim())throw new Error('YOUTUBE_CLIENT_ID_REQUIRED');this.clientId=clientId.trim();}
  async authorize(){
    if(!window.google?.accounts?.oauth2)throw new Error('GOOGLE_IDENTITY_SERVICES_NOT_READY');
    return new Promise((resolve,reject)=>{
      const tokenClient=window.google.accounts.oauth2.initTokenClient({
        client_id:this.clientId,
        scope:YOUTUBE_SCOPES.join(' '),
        callback:async response=>{
          if(response?.error){reject(new Error(response.error));return;}
          try{const channel=await this.fetchChannel(response.access_token);resolve({accessToken:response.access_token,expiresIn:Number(response.expires_in||0),channel});}
          catch(error){reject(error);}
        }
      });
      tokenClient.requestAccessToken({prompt:'consent'});
    });
  }
  async fetchChannel(accessToken){
    const response=await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true',{headers:{Authorization:'Bearer '+accessToken}});
    const data=await response.json();
    if(!response.ok)throw new Error(data?.error?.message||'YOUTUBE_CHANNEL_REQUEST_FAILED');
    const item=data?.items?.[0];
    if(!item)throw new Error('YOUTUBE_CHANNEL_NOT_FOUND');
    return {
      channelId:item.id,
      displayName:item.snippet?.title||'YouTube',
      description:item.snippet?.description||'',
      customUrl:item.snippet?.customUrl||'',
      thumbnail:item.snippet?.thumbnails?.high?.url||item.snippet?.thumbnails?.default?.url||'',
      statistics:item.statistics||{},
      url:'https://www.youtube.com/channel/'+item.id
    };
  }
}