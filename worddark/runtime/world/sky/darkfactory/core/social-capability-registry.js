/* WordDark — Social Capability Registry · DF-0.8 */
export class SocialCapabilityRegistry {
  constructor(){this.networks=new Map();}
  register({network,capabilities=[],metadata={}}={}){
    if(!network)throw new Error("NETWORK_REQUIRED");
    const id=String(network).toUpperCase();
    this.networks.set(id,{network:id,capabilities:[...new Set(capabilities.map(String))],metadata});
    return this.get(id);
  }
  unregister(network){return this.networks.delete(String(network).toUpperCase());}
  get(network){return this.networks.get(String(network).toUpperCase())||null;}
  supports(network,capability){return !!this.get(network)?.capabilities.includes(capability);}
  resolve(network,capability){
    const item=this.get(network);
    if(!item)return {supported:false,reason:"NETWORK_NOT_REGISTERED"};
    return item.capabilities.includes(capability)
      ? {supported:true,network:item.network,capability}
      : {supported:false,reason:"CAPABILITY_NOT_AVAILABLE",network:item.network,capability};
  }
  list(){return [...this.networks.values()].map(x=>({...x,capabilities:[...x.capabilities]}));}
}
if(typeof window!=="undefined")window.SocialCapabilityRegistry=SocialCapabilityRegistry;
if(typeof module!=="undefined"&&module.exports)module.exports=SocialCapabilityRegistry;
