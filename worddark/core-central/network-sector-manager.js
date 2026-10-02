import { SOCIAL_NETWORKS } from './social-networks.js';

export const NETWORK_SECTORS=Object.freeze({
  YOUTUBE:{id:'YOUTUBE',name:'YouTube',manager:'Gestor YouTube',status:'REAL_CONNECTOR'},
  INSTAGRAM:{id:'INSTAGRAM',name:'Instagram',manager:'Gestor Instagram',status:'OAUTH_SECTOR'},
  TIKTOK:{id:'TIKTOK',name:'TikTok',manager:'Gestor TikTok',status:'OAUTH_SECTOR'},
  FACEBOOK:{id:'FACEBOOK',name:'Facebook',manager:'Gestor Facebook',status:'OAUTH_SECTOR'}
});

export class NetworkSectorManager{
 constructor({accountManager}={}){if(!accountManager)throw new Error('ACCOUNT_MANAGER_REQUIRED');this.accountManager=accountManager;}
 listSectors(){return Object.values(NETWORK_SECTORS).map(sector=>({...sector,network:SOCIAL_NETWORKS[sector.id]?.name||sector.name,profiles:this.accountManager.listProfiles().filter(p=>p.network===sector.id).length}));}
 getSector(network){const sector=NETWORK_SECTORS[network];if(!sector)throw new Error('NETWORK_SECTOR_NOT_FOUND');return {...sector,profiles:this.accountManager.listProfiles().filter(p=>p.network===network).length};}
 prepareConnection(network){const sector=this.getSector(network);return {network:sector.id,sector:sector.manager,status:sector.status,requiresProviderAuthorization:network!=='YOUTUBE',message:network==='YOUTUBE'?'Use o conector OAuth do YouTube.':'Este setor está pronto para receber o OAuth específico do provedor.'};}
}
