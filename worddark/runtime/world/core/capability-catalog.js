/* WordDark — Canonical Capability Catalog
 * Língua universal:
 * PRODUÇÃO = objetivo composto.
 * OPERAÇÃO = função única.
 * CAPACIDADE = o que uma empresa/setor sabe executar.
 * A tradução entre ação operacional e serviço de transporte é centralizada aqui.
 */
(function(global){
  "use strict";
  const SERVICE_CAPABILITIES=Object.freeze({
    "content.produce":"CONTENT_CREATE","content.create":"CONTENT_CREATE","content.edit":"CONTENT_EDIT",
    "content.assemble":"CONTENT_ASSEMBLE","content.render":"CONTENT_RENDER","content.transform":"CONTENT_TRANSFORM",
    "content.validate":"CONTENT_VALIDATE","content.package":"CONTENT_PACKAGE","content.publish":"CONTENT_PUBLICATION",
    "content.publication":"CONTENT_PUBLICATION","channel.manage":"CHANNEL_MANAGEMENT","business.operate":"BUSINESS_OPERATIONS",
    "business.manage":"BUSINESS_MANAGEMENT","marketing.manage":"MARKETING_MANAGEMENT","marketing.analyze":"MARKET_ANALYSIS",
    "marketing.trends":"TREND_ANALYSIS","marketing.brand":"BRAND_IDENTITY","marketing.campaign":"CAMPAIGN_STRATEGY"
  });
  const ACTION_CAPABILITIES=Object.freeze({
    CREATE_CONTENT:"CONTENT_CREATE", EDIT_CONTENT:"CONTENT_EDIT", EDIT_PHOTO:"CONTENT_EDIT",
    CUT_VIDEO:"CONTENT_EDIT", REPLACE_AUDIO:"CONTENT_EDIT", ADD_SUBTITLE:"CONTENT_EDIT",
    RENDER_CONTENT:"CONTENT_RENDER", TRANSFORM_CONTENT:"CONTENT_TRANSFORM", VALIDATE_CONTENT:"CONTENT_VALIDATE",
    PACKAGE_CONTENT:"CONTENT_PACKAGE", PUBLISH_CONTENT:"CONTENT_PUBLICATION", MANAGE_CHANNEL:"CHANNEL_MANAGEMENT",
    OPERATE_BUSINESS:"BUSINESS_OPERATIONS", MANAGE_BUSINESS:"BUSINESS_MANAGEMENT", MANAGE_MARKETING:"MARKETING_MANAGEMENT",
    ANALYZE_MARKET:"MARKET_ANALYSIS", ANALYZE_TRENDS:"TREND_ANALYSIS", CREATE_BRAND:"BRAND_IDENTITY",
    PLAN_CAMPAIGN:"CAMPAIGN_STRATEGY", CONNECT_EXTERNAL:"EXTERNAL_CONNECTION"
  });
  const CAPABILITY_SERVICES=Object.freeze({
    CONTENT_CREATE:"content.produce", CONTENT_EDIT:"content.edit", CONTENT_ASSEMBLE:"content.assemble",
    CONTENT_RENDER:"content.render", CONTENT_TRANSFORM:"content.transform", CONTENT_VALIDATE:"content.validate",
    CONTENT_PACKAGE:"content.package", CONTENT_PUBLICATION:"content.publish", CHANNEL_MANAGEMENT:"channel.manage",
    BUSINESS_OPERATIONS:"business.operate", BUSINESS_MANAGEMENT:"business.manage", MARKETING_MANAGEMENT:"marketing.manage",
    MARKET_ANALYSIS:"marketing.analyze", TREND_ANALYSIS:"marketing.trends", BRAND_IDENTITY:"marketing.brand",
    CAMPAIGN_STRATEGY:"marketing.campaign"
  });
  function normalize(value){
    const raw=String(value||"").trim(); if(!raw)return null;
    return SERVICE_CAPABILITIES[raw.toLowerCase()]||ACTION_CAPABILITIES[raw.toUpperCase()]||raw.toUpperCase();
  }
  function normalizeAction(value){const raw=String(value||"").trim();return ACTION_CAPABILITIES[raw.toUpperCase()]?raw.toUpperCase():raw||null;}
  function capabilityForAction(action){return ACTION_CAPABILITIES[String(action||"").toUpperCase()]||null;}
  function serviceForCapability(capability){return CAPABILITY_SERVICES[normalize(capability)]||null;}
  function serviceForAction(action){return serviceForCapability(capabilityForAction(action)||normalize(action));}
  function resolve({intent=null,need=null,capability=null,service=null,action=null}={}){
    if(action)return capabilityForAction(action)||normalize(action);
    if(capability)return normalize(capability); if(service)return normalize(service);
    if(intent){const map=(global.INTENT_CAPABILITIES||{});if(map[intent])return normalize(map[intent]);}
    const text=String(need||"").toLowerCase();
    if(/publicar|publicação|publicacao|postar/.test(text))return"CONTENT_PUBLICATION";
    if(/áudio|audio/.test(text)&&/trocar|substituir|mudar/.test(text))return"CONTENT_EDIT";
    if(/vídeo|video/.test(text)&&/cortar|recortar/.test(text))return"CONTENT_EDIT";
    if(/imagem|foto/.test(text)&&/editar|alterar|ajustar/.test(text))return"CONTENT_EDIT";
    if(/vender|venda|negócio|negocio|pedido|cliente|fornecedor/.test(text))return"BUSINESS_OPERATIONS";
    if(/marketing|marca|branding|nome|identidade|posicionamento|campanha|tendência|tendencia|mercado/.test(text))return"MARKETING_MANAGEMENT";
    if(/canal|conteúdo|conteudo|público|publico|audiência|audiencia/.test(text))return"CHANNEL_MANAGEMENT";
    if(/criar|produzir|editar|vídeo|video|imagem|áudio|audio/.test(text))return"CONTENT_CREATE";
    return null;
  }
  const api={SERVICE_CAPABILITIES,ACTION_CAPABILITIES,CAPABILITY_SERVICES,normalize,normalizeAction,capabilityForAction,serviceForCapability,serviceForAction,resolve};
  if(typeof global!=="undefined")global.WordDarkCapabilityCatalog=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:window);