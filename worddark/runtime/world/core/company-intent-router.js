/* WordDark — Company Intent Router
 * Resolve pedidos por intenção/capacidade, sem acoplar empresas entre si.
 */
(function(global){
  "use strict";

  const DEFAULT_INTENTS=Object.freeze({
    SELL_MORE:"SELL_MORE",
    OPERATE_BUSINESS:"OPERATE_BUSINESS",
    MANAGE_CONTENT:"MANAGE_CONTENT",
    PRODUCE_CONTENT:"PRODUCE_CONTENT",
    PUBLISH_CONTENT:"PUBLISH_CONTENT",
    CONNECT_EXTERNAL:"CONNECT_EXTERNAL",
    MANAGE_MARKETING:"MANAGE_MARKETING",
    ANALYZE_TRENDS:"ANALYZE_TRENDS",
    CREATE_BRAND:"CREATE_BRAND",
    PLAN_CAMPAIGN:"PLAN_CAMPAIGN"
  });

  const INTENT_CAPABILITIES=Object.freeze({
    SELL_MORE:"CONTENT_DEMAND_CREATION",
    OPERATE_BUSINESS:"BUSINESS_OPERATIONS",
    MANAGE_CONTENT:"CHANNEL_MANAGEMENT",
    PRODUCE_CONTENT:"CONTENT_CREATE",
    PUBLISH_CONTENT:"CONTENT_PUBLICATION",
    CONNECT_EXTERNAL:"EXTERNAL_CONNECTION",
    MANAGE_MARKETING:"MARKETING_MANAGEMENT",
    ANALYZE_TRENDS:"TREND_ANALYSIS",
    CREATE_BRAND:"BRAND_IDENTITY",
    PLAN_CAMPAIGN:"CAMPAIGN_STRATEGY"
  });

  class WordDarkCompanyIntentRouter{
    constructor({companyRegistry=null}={}){this.companyRegistry=companyRegistry||null;}

    resolve({intent=null,need=null,capability=null}={}){
      const requested=capability||INTENT_CAPABILITIES[intent]||this.inferCapability(need);
      if(!requested)return{success:false,status:"CAPABILITY_REQUIRED",reason:"A necessidade não possui uma capacidade identificável."};
      const companies=this.companyRegistry?.findCapability?.(requested)||[];
      if(!companies.length)return{success:false,status:"CAPABILITY_UNAVAILABLE",capability:requested,intent:intent||null,need:need||null};
      return{
        success:true,
        status:"CAPABILITY_RESOLVED",
        capability:requested,
        intent:intent||null,
        need:need||null,
        candidates:companies.map(x=>({id:x.id,name:x.name,area:x.area,type:x.type}))
      };
    }

    inferCapability(need){
      const text=String(need||"").toLowerCase();
      if(/vender|venda|negócio|negocio|pedido|cliente|fornecedor/.test(text))return"BUSINESS_OPERATIONS";
      if(/marketing|marca|branding|nome|identidade|posicionamento|campanha|tendência|tendencia|mercado/.test(text))return"MARKETING_MANAGEMENT";
      if(/canal|conteúdo|conteudo|público|publico|audiência|audiencia/.test(text))return"CHANNEL_MANAGEMENT";
      if(/criar|produzir|editar|vídeo|video|imagem|áudio|audio/.test(text))return"CONTENT_CREATE";
      if(/publicar|publicação|publicacao/.test(text))return"CONTENT_PUBLICATION";
      return null;
    }

    route(request={}){
      const resolution=this.resolve(request);
      if(!resolution.success)return resolution;
      const target=resolution.candidates[0];
      return{...resolution,status:"ROUTE_READY",destinationCompanyId:target.id,destinationCompany:target};
    }
  }

  if(typeof global!=="undefined"){
    global.WORDDARK_INTENTS=DEFAULT_INTENTS;
    global.WordDarkCompanyIntentRouter=WordDarkCompanyIntentRouter;
  }
  if(typeof module!=="undefined"&&module.exports)module.exports={WordDarkCompanyIntentRouter,DEFAULT_INTENTS,INTENT_CAPABILITIES};
})(typeof globalThis!=="undefined"?globalThis:window);
