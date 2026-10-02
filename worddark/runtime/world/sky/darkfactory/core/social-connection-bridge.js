/* WordDark — Connection Bridge Contract · DF-0.8
 * This is the only seam between Dark Factory and external platforms.
 * No OAuth, token or platform API belongs here.
 */
export class SocialConnectionBridge {
  constructor(adapter){this.adapter=adapter||null;}
  async execute(operation){
    if(!this.adapter?.execute)throw new Error("CONNECTION_BRIDGE_NOT_CONFIGURED");
    return this.adapter.execute(operation);
  }
  async status(){return this.adapter?.status?this.adapter.status():{connected:false};}
}
if(typeof window!=="undefined")window.SocialConnectionBridge=SocialConnectionBridge;
if(typeof module!=="undefined"&&module.exports)module.exports=SocialConnectionBridge;
