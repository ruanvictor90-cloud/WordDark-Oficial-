import { SOCIAL_NETWORKS } from "./social-networks.js";

export const NETWORK_SECTORS=Object.freeze({
  YOUTUBE:{id:"YOUTUBE",name:"YouTube",manager:"Gestor YouTube"},
  INSTAGRAM:{id:"INSTAGRAM",name:"Instagram",manager:"Gestor Instagram"},
  TIKTOK:{id:"TIKTOK",name:"TikTok",manager:"Gestor TikTok"},
  FACEBOOK:{id:"FACEBOOK",name:"Facebook",manager:"Gestor Facebook"}
});

export class NetworkSectorManager{
  constructor({accountManager,connectionHub=null}={}){
    if(!accountManager)throw new Error("ACCOUNT_MANAGER_REQUIRED");
    this.accountManager=accountManager;
    this.connectionHub=connectionHub;
  }
  listSectors(){
    return Object.values(NETWORK_SECTORS).map(sector=>{
      const provider=this.connectionHub?.getProvider?.(sector.id);
      return {...sector,
        network:SOCIAL_NETWORKS[sector.id]?.name||sector.name,
        status:provider?.status||"CENTRAL_STATUS_UNAVAILABLE",
        profiles:this.accountManager.listProfiles().filter(p=>p.network===sector.id).length
      };
    });
  }
  getSector(network){
    const sector=NETWORK_SECTORS[network];
    if(!sector)throw new Error("NETWORK_SECTOR_NOT_FOUND");
    const provider=this.connectionHub?.getProvider?.(network);
    return {...sector,status:provider?.status||"CENTRAL_STATUS_UNAVAILABLE",
      profiles:this.accountManager.listProfiles().filter(p=>p.network===network).length};
  }
  prepareConnection(network){
    const sector=this.getSector(network);
    return {
      network:sector.id,
      sector:sector.manager,
      status:sector.status,
      connectionCenter:"EXTERNAL-CONNECTION-HUB",
      requiresProviderAuthorization:sector.status==="AUTHORIZATION_REQUIRED",
      message:sector.status==="READY"
        ?"Conexão preparada pela Central de Conexões."
        :"Este setor depende da autorização/conector do provedor, administrado pela Central de Conexões."
    };
  }
}
