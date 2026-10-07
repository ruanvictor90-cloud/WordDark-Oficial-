/* WordDark — Universal Language v0.3
 * Converte linguagem humana em PRODUÇÃO ou OPERAÇÃO.
 * O usuário não precisa conhecer código, capacidades, empresas ou rotas.
 */
(function(global){
  "use strict";
  const Dictionary=(typeof WordDarkOperationalDictionary!=="undefined"?WordDarkOperationalDictionary:null)
    || (typeof require==="function"?require("./operational-dictionary"):null);
  const ACTIONS={"trocar audio":"REPLACE_AUDIO","trocar áudio":"REPLACE_AUDIO","substituir audio":"REPLACE_AUDIO","substituir áudio":"REPLACE_AUDIO","publicar":"PUBLISH_CONTENT","postar":"PUBLISH_CONTENT","cortar video":"CUT_VIDEO","cortar vídeo":"CUT_VIDEO","editar foto":"EDIT_PHOTO","editar imagem":"EDIT_PHOTO","adicionar legenda":"ADD_SUBTITLE","criar video":"CREATE_CONTENT","criar vídeo":"CREATE_CONTENT","criar conteúdo":"CREATE_CONTENT","criar conteudo":"CREATE_CONTENT","renderizar":"RENDER_CONTENT","validar":"VALIDATE_CONTENT"};
  const text=v=>String(v||"").trim().toLowerCase();
  function findAction(input){
    const t=text(input), dictionaryMatch=Dictionary?.match?.(t);
    if(dictionaryMatch){
      const map={CONTENT_CREATE:"CREATE_CONTENT",CONTENT_EDIT:"EDIT_CONTENT",CONTENT_PUBLICATION:"PUBLISH_CONTENT",CONTENT_RENDER:"RENDER_CONTENT",CONTENT_VALIDATE:"VALIDATE_CONTENT",CONTENT_PACKAGE:"PACKAGE_CONTENT",CHANNEL_MANAGEMENT:"MANAGE_CHANNEL",MARKETING_MANAGEMENT:"MANAGE_MARKETING",BUSINESS_OPERATIONS:"OPERATE_BUSINESS"};
      return map[dictionaryMatch.capability]||null;
    }
    for(const k of Object.keys(ACTIONS))if(t.includes(k))return ACTIONS[k];
    if(/public(ar|ação|acao|ar conteúdo|ar conteudo)|postar/.test(t))return"PUBLISH_CONTENT";
    if(/trocar|substituir|mudar/.test(t)&&/áudio|audio/.test(t))return"REPLACE_AUDIO";
    if(/cortar|recortar/.test(t)&&/vídeo|video/.test(t))return"CUT_VIDEO";
    if(/legenda|subtítulo|subtitulo/.test(t))return"ADD_SUBTITLE";
    if(/editar/.test(t)&&/foto|imagem/.test(t))return"EDIT_PHOTO";
    return null;
  }
  function resolveHuman(input){
    const raw=typeof input==="string"?input:(input?.text||input?.request||input?.goal||"");
    const hit=Dictionary?.match?.(raw);
    if(hit)return hit;
    const action=findAction(raw);
    return action?{id:action,label:action,capability:null,service:null}:null;
  }
  function extractQuantity(input,t){if(Number.isFinite(Number(input?.quantity)))return Number(input.quantity);const m=t.match(/\b(\d+)\b/);return m?Number(m[1]):null;}
  function classify(input){
    const t=text(typeof input==="string"?input:input?.text||input?.request||input?.goal);
    const explicit=typeof input==="object"?String(input.type||"").toUpperCase():"";
    if(explicit==="PRODUCTION"||explicit==="OPERATION")return explicit;
    const human=resolveHuman(input);
    if(human?.capability && human.capability!=="CONTENT_PUBLICATION" && human.capability!=="CONTENT_EDIT")return"PRODUCTION";
    if(/quantos|quantidade|vários|varios|conteúdos|conteudos|campanha|plano|produzir .*conteúdos|produzir .*conteudos|e publicar|e poste|depois publicar/.test(t))return"PRODUCTION";
    if(findAction(t))return"OPERATION";
    return"PRODUCTION";
  }
  function parse(input={}){
    const raw=typeof input==="string"?input:(input.text||input.request||input.goal||"");
    const t=text(raw),type=classify(input),human=resolveHuman(input);
    const base={resourceId:input.resourceId||input.resource||null,destinationId:input.destinationId||input.destination||null,clientId:input.clientId||input.accountId||null,deadline:input.deadline||null,format:input.format||null};
    if(type==="OPERATION"){
      return{type:"OPERATION",action:input.action||findAction(raw),intent:human?.id||null,capability:human?.capability||null,service:human?.service||null,resourceId:base.resourceId,destinationId:base.destinationId,parameters:input.parameters||input.options||{},context:base,raw};
    }
    return{type:"PRODUCTION",intent:human?.id||null,capability:human?.capability||null,service:human?.service||null,goal:input.goal||raw,resourceId:base.resourceId,destinationId:base.destinationId,clientId:base.clientId,quantity:extractQuantity(input,t),requirements:{...(input.requirements||{}),capability:human?.capability||null,service:human?.service||null},options:{...(input.options||{}),environment:input.environment||input.options?.environment||"TEST"},context:base,raw};
  }
  const api={ACTIONS,classify,parse,findAction,resolveHuman};
  if(typeof global!=="undefined")global.WordDarkUniversalLanguage=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:window);
