/* WordDark — Canonical Capability Catalog
 * A linguagem operacional do mundo.
 * Empresas anunciam capacidades; operações anunciam necessidades.
 * A Rodovia somente transporta depois que o destino foi resolvido.
 */
(function(global){
  "use strict";

  const SERVICE_CAPABILITIES=Object.freeze({
    "content.produce":"CONTENT_CREATE",
    "content.create":"CONTENT_CREATE",
    "content.edit":"CONTENT_EDIT",
    "content.assemble":"CONTENT_ASSEMBLE",
    "content.render":"CONTENT_RENDER",
    "content.transform":"CONTENT_TRANSFORM",
    "content.validate":"CONTENT_VALIDATE",
    "content.package":"CONTENT_PACKAGE",
    "content.publish":"CONTENT_PUBLICATION",
    "content.publication":"CONTENT_PUBLICATION",
    "channel.manage":"CHANNEL_MANAGEMENT",
    "business.operate":"BUSINESS_OPERATIONS",
    "business.manage":"BUSINESS_MANAGEMENT",
    "marketing.manage":"MARKETING_MANAGEMENT",
    "marketing.analyze":"MARKET_ANALYSIS",
    "marketing.trends":"TREND_ANALYSIS",
    "marketing.brand":"BRAND_IDENTITY",
    "marketing.campaign":"CAMPAIGN_STRATEGY"
  });

  function normalize(value){
    const raw=String(value||"").trim();
    if(!raw)return null;
    const upper=raw.toUpperCase();
    return SERVICE_CAPABILITIES[raw.toLowerCase()]||upper;
  }

  function resolve({intent=null,need=null,capability=null,service=null}={}){
    if(capability)return normalize(capability);
    if(service)return normalize(service);
    if(intent){
      const map=(global.INTENT_CAPABILITIES||{});
      if(map[intent])return normalize(map[intent]);
    }
    const text=String(need||"").toLowerCase();
    if(/vender|venda|negócio|negocio|pedido|cliente|fornecedor/.test(text))return"BUSINESS_OPERATIONS";
    if(/marketing|marca|branding|nome|identidade|posicionamento|campanha|tendência|tendencia|mercado/.test(text))return"MARKETING_MANAGEMENT";
    if(/canal|conteúdo|conteudo|público|publico|audiência|audiencia/.test(text))return"CHANNEL_MANAGEMENT";
    if(/publicar|publicação|publicacao/.test(text))return"CONTENT_PUBLICATION";
    if(/criar|produzir|editar|vídeo|video|imagem|áudio|audio/.test(text))return"CONTENT_CREATE";
    return null;
  }

  const api={SERVICE_CAPABILITIES,normalize,resolve};
  if(typeof global!=="undefined")global.WordDarkCapabilityCatalog=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:window);
