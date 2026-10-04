/* WordDark — Universal Language
 * Converte uma solicitação humana em PRODUÇÃO ou OPERAÇÃO.
 * Não executa: apenas classifica, normaliza e prepara o contrato.
 */
(function(global){
  "use strict";
  const ACTIONS={
    "trocar audio":"REPLACE_AUDIO","trocar áudio":"REPLACE_AUDIO","substituir audio":"REPLACE_AUDIO","substituir áudio":"REPLACE_AUDIO",
    "publicar":"PUBLISH_CONTENT","postar":"PUBLISH_CONTENT","cortar video":"CUT_VIDEO","cortar vídeo":"CUT_VIDEO",
    "editar foto":"EDIT_PHOTO","editar imagem":"EDIT_PHOTO","adicionar legenda":"ADD_SUBTITLE",
    "criar video":"CREATE_CONTENT","criar vídeo":"CREATE_CONTENT","criar conteúdo":"CREATE_CONTENT",
    "criar conteudo":"CREATE_CONTENT","renderizar":"RENDER_CONTENT","validar":"VALIDATE_CONTENT"
  };
  function text(value){return String(value||"").trim().toLowerCase();}
  function findAction(input){
    const t=text(input);
    for(const key of Object.keys(ACTIONS))if(t.includes(key))return ACTIONS[key];
    if(/public(ar|ação|acao|ar conteúdo|ar conteudo)/.test(t))return"PUBLISH_CONTENT";
    if(/trocar|substituir|mudar/.test(t)&&/áudio|audio/.test(t))return"REPLACE_AUDIO";
    if(/cortar|recortar/.test(t)&&/vídeo|video/.test(t))return"CUT_VIDEO";
    if(/legenda|subtítulo|subtitulo/.test(t))return"ADD_SUBTITLE";
    if(/editar/.test(t)&&/foto|imagem/.test(t))return"EDIT_PHOTO";
    return null;
  }
  function classify(input){
    const t=text(typeof input==="string"?input:input?.text||input?.request||input?.goal);
    const explicit=typeof input==="object"?String(input.type||"").toUpperCase(): "";
    if(explicit==="PRODUCTION"||explicit==="OPERATION")return explicit;
    if(/quantos|quantidade|vários|varios|conteúdos|conteudos|para a conta|para essa conta|durante o mês|durante o mes|campanha|plano|produzir .*conteúdos|produzir .*conteudos/.test(t))return"PRODUCTION";
    if(findAction(t))return"OPERATION";
    return"PRODUCTION";
  }
  function parse(input={}){
    const raw=typeof input==="string"?input:(input.text||input.request||input.goal||"");
    const type=classify(input);
    if(type==="OPERATION"){
      const action=input.action||findAction(raw);
      return {type:"OPERATION",action,resourceId:input.resourceId||input.resource||null,destinationId:input.destinationId||input.destination||null,parameters:input.parameters||input.options||{},raw};
    }
    return {type:"PRODUCTION",goal:input.goal||raw,resourceId:input.resourceId||input.resource||null,destinationId:input.destinationId||input.destination||null,quantity:input.quantity||null,requirements:input.requirements||{},options:input.options||{},raw};
  }
  const api={ACTIONS,classify,parse,findAction};
  if(typeof global!=="undefined")global.WordDarkUniversalLanguage=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:window);