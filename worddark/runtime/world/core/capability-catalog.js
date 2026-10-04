/* WordDark — Canonical Capability Catalog
 * Língua universal:
 * PRODUÇÃO = objetivo composto.
 * OPERAÇÃO = função única.
 * CAPACIDADE = o que uma empresa/setor sabe executar.
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
  const OPERATION_ACTIONS=Object.freeze({
    CREATE_CONTENT:"CONTENT_CREATE", EDIT_CONTENT:"CONTENT_EDIT", ASSEMBLE_CONTENT:"CONTENT_ASSEMBLE",
    RENDER_CONTENT:"CONTENT_RENDER", TRANSFORM_CONTENT:"CONTENT_TRANSFORM", VALIDATE_CONTENT:"CONTENT_VALIDATE",
    PACKAGE_CONTENT:"CONTENT_PACKAGE", PUBLISH_CONTENT:"CONTENT_PUBLICATION", MANAGE_CHANNEL:"CHANNEL_MANAGEMENT",
    OPERATE_BUSINESS:"BUSINESS_OPERATIONS", MANAGE_BUSINESS:"BUSINESS_MANAGEMENT", MANAGE_MARKETING:"MARKETING_MANAGEMENT",
    ANALYZE_MARKET:"MARKET_ANALYSIS", ANALYZE_TRENDS:"TREND_ANALYSIS", CREATE_BRAND:"BRAND_IDENTITY",
    PLAN_CAMPAIGN:"CAMPAIGN_STRATEGY", CONNECT_EXTERNAL:"EXTERNAL_CONNECTION"
  });
  function normalize(value){const raw=String(value||"").trim();if(!raw)return null;return SERVICE_CAPABILITIES[raw.toLowerCase()]||OPERATION_ACTIONS[raw.toUpperCase()]||raw.toUpperCase();}
  function resolve({intent=null,need=null,capability=null,service=null,action=null}={}){
    if(action)return normalize(action); if(capability)return normalize(capability); if(service)return normalize(service);
    if(intent){const map=(global.INTENT_CAPABILITIES||{});if(map[intent])return normalize(map[intent]);}
    const text=String(need||"").toLowerCase();
    if(/publicar|publicação|publicacao|postar/.test(text))return"CONTENT_PUBLICATION";
    if(/áudio|audio/.test(text)&&/trocar|substituir|mudar/.test(text))return"CONTENT_AUDIO";
    if(/vídeo|video/.test(text)&&/cortar|recortar/.test(text))return"CONTENT_EDIT";
    if(/imagem|foto/.test(text)&&/editar|alterar|ajustar/.test(text))return"CONTENT_EDIT";
    if(/vender|venda|negócio|negocio|pedido|cliente|fornecedor/.test(text))return"BUSINESS_OPERATIONS";
    if(/marketing|marca|branding|nome|identidade|posicionamento|campanha|tendência|tendencia|mercado/.test(text))return"MARKETING_MANAGEMENT";
    if(/canal|conteúdo|conteudo|público|publico|audiência|audiencia/.test(text))return"CHANNEL_MANAGEMENT";
    if(/criar|produzir|editar|vídeo|video|imagem|áudio|audio/.test(text))return"CONTENT_CREATE";
    return null;
  }
  const api={SERVICE_CAPABILITIES,OPERATION_ACTIONS,normalize,resolve};
  if(typeof global!=="undefined")global.WordDarkCapabilityCatalog=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:window);