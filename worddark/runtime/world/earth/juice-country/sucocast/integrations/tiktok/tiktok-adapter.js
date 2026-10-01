/* WordDark — TikTok Adapter
 * Adaptador de teste. Não realiza chamadas reais à API.
 */
class SucoCastTikTokAdapter {
  constructor() {
    this.integrationId="SC-INTEGRATION-TIKTOK";
    this.platform="TikTok";
    this.status="TEST";
  }

  execute(operation,payload) {
    if(operation!=="publish") {
      return {success:false,status:"REJECTED",reason:"Operação não suportada.",operation:operation};
    }
    return {
      success:true,status:"CONFIRMED",mode:"SIMULATION",
      operation:"publish",platform:"TikTok",
      externalId:"TT-SIM-"+Date.now().toString(36).toUpperCase(),
      payload:payload||{},
      message:"Publicação simulada; nenhuma chamada externa foi realizada."
    };
  }
}
if(typeof window!=="undefined") window.SucoCastTikTokAdapter=SucoCastTikTokAdapter;
if(typeof module!=="undefined"&&module.exports) module.exports=SucoCastTikTokAdapter;
