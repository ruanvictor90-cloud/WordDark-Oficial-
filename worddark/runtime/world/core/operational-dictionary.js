/* WordDark — Dicionário Operacional v0.1
 * Linguagem humana → intenção operacional.
 * A pessoa escolhe o que quer; o sistema descobre como executar.
 */
(function(global){
  "use strict";
  const entries=[
    {id:"CREATE_CHANNEL_CONTENT",label:"Criar conteúdo para canais",capability:"CONTENT_CREATE",service:"content.produce",operations:["CREATE_CONTENT"],phrases:["gera um conteúdo pros canais","gera conteúdo para os canais","cria conteúdo para meus canais","faz um conteúdo para os canais","criar conteúdo para canal","conteúdo para canais"]},
    {id:"CREATE_SOCIAL_CONTENT",label:"Criar conteúdo para postar",capability:"CONTENT_CREATE",service:"content.produce",operations:["CREATE_CONTENT","PUBLISH_CONTENT"],phrases:["faz um conteúdo pra postar","cria algo para postar","prepara um post","faz um post","cria conteúdo para postar","conteúdo para instagram","conteúdo pro insta","conteúdo para o insta"]},
    {id:"EDIT_PHOTO",label:"Editar uma foto",capability:"CONTENT_EDIT",service:"content.edit",operations:["EDIT_PHOTO"],phrases:["edita uma foto","editar foto","arruma essa foto","melhora essa foto","ajusta a imagem","editar imagem"]},
    {id:"EDIT_VIDEO",label:"Editar um vídeo",capability:"CONTENT_EDIT",service:"content.edit",phrases:["edita um vídeo","editar vídeo","corta o vídeo","cortar vídeo","arruma o vídeo","melhora o vídeo"]},
    {id:"REPLACE_AUDIO",label:"Trocar o áudio",capability:"CONTENT_EDIT",service:"content.edit",phrases:["troca o áudio","trocar o áudio","substitui o áudio","muda o áudio","trocar audio","substituir audio"]},
    {id:"ADD_SUBTITLE",label:"Adicionar legenda",capability:"CONTENT_EDIT",service:"content.edit",phrases:["coloca legenda","adiciona legenda","adicionar legenda","coloca subtítulo","adicionar subtítulo"]},
    {id:"PUBLISH_CONTENT",label:"Publicar conteúdo",capability:"CONTENT_PUBLICATION",service:"content.publish",operations:["PUBLISH_CONTENT"],phrases:["publica","publicar","posta","postar","coloca no instagram","posta no insta","publica no instagram","publica no insta"]},
    {id:"RENDER_CONTENT",label:"Finalizar conteúdo",capability:"CONTENT_RENDER",service:"content.render",operations:["RENDER_CONTENT"],phrases:["finaliza o vídeo","finalizar conteúdo","renderiza","renderizar","gera o arquivo final"]},
    {id:"VALIDATE_CONTENT",label:"Revisar conteúdo",capability:"CONTENT_VALIDATE",service:"content.validate",operations:["VALIDATE_CONTENT"],phrases:["revisa o conteúdo","revisar conteúdo","confere o conteúdo","verifica o conteúdo"]},
    {id:"PACKAGE_CONTENT",label:"Preparar para entrega",capability:"CONTENT_PACKAGE",service:"content.package",operations:["PACKAGE_CONTENT"],phrases:["prepara para entrega","preparar conteúdo","organiza os arquivos","empacota o conteúdo"]},
    {id:"MANAGE_CHANNEL",label:"Cuidar de um canal",capability:"CHANNEL_MANAGEMENT",service:"channel.manage",operations:["MANAGE_CHANNEL"],phrases:["cuida do canal","gerencia o canal","gerenciar canal","organiza meu canal"]},
    {id:"MARKETING_HELP",label:"Ajudar no marketing",capability:"MARKETING_MANAGEMENT",service:"marketing.manage",operations:["MANAGE_MARKETING"],phrases:["faz marketing","me ajuda no marketing","cria uma estratégia","preciso de marketing","divulga meu negócio"]},
    {id:"SELL_MORE",label:"Ajudar a vender mais",capability:"BUSINESS_OPERATIONS",service:"business.operate",operations:["OPERATE_BUSINESS"],phrases:["quero vender mais","faz meu negócio vender mais","aumentar as vendas","quero mais clientes"]}
  ];
  const normalize=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
  function match(input){
    const text=normalize(typeof input==="string"?input:input?.text||input?.request||input?.goal);
    if(!text)return null;
    let best=null;
    for(const e of entries) for(const phrase of e.phrases){
      const p=normalize(phrase);
      if(text.includes(p) && (!best||p.length>best._length)) best={...e,_length:p.length};
    }
    if(!best)return null;
    delete best._length;
    return best;
  }
  const api={entries,normalize,match};
  if(typeof global!=="undefined")global.WordDarkOperationalDictionary=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:window);
