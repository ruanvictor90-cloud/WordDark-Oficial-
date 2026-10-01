export const SOCIAL_NETWORKS=Object.freeze({
  INSTAGRAM:{id:'INSTAGRAM',name:'Instagram',status:'OAUTH_READY'},
  TIKTOK:{id:'TIKTOK',name:'TikTok',status:'OAUTH_READY'},
  YOUTUBE:{id:'YOUTUBE',name:'YouTube',status:'OAUTH_READY'},
  FACEBOOK:{id:'FACEBOOK',name:'Facebook',status:'OAUTH_READY'}
});
export class SocialNetworkConnector{
  constructor({network}={}){if(!network)throw new Error('NETWORK_REQUIRED');const adapter=SOCIAL_NETWORKS[network];if(!adapter)throw new Error('NETWORK_NOT_SUPPORTED');this.network=adapter;}
  authorizationRequest({accountId,redirectUri}={}){if(!accountId)throw new Error('ACCOUNT_ID_REQUIRED');return {network:this.network.id,accountId,redirectUri:redirectUri||null,status:'AUTHORIZATION_REQUIRED',createdAt:new Date().toISOString()};}
  status(){return {...this.network};}
}