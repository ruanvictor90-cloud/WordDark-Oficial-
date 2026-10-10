/* WordDark — Production Planner v0.2
 * Decompõe uma PRODUÇÃO em OPERAÇÕES universais.
 * Não executa. Escolhe o menor percurso necessário e preserva dependências.
 */
(function(root,factory){
  if(typeof module==="object"&&module.exports)module.exports=factory(require("./capability-catalog"),require("../contracts/operation"));
  else{const r=root||(typeof window!=="undefined"?window:globalThis);r.WordDarkProductionPlanner=factory(r.WordDarkCapabilityCatalog,r.WordDarkOperation);}
})(typeof globalThis!=="undefined"?globalThis:window,function(Catalog,WordDarkOperation){
  const ACTIONS={CREATE_CONTENT:"CREATE_CONTENT",TRANSLATE_CONTENT:"TRANSLATE_CONTENT",DUB_CONTENT:"DUB_CONTENT",EDIT_CONTENT:"EDIT_CONTENT",EDIT_PHOTO:"EDIT_PHOTO",CUT_VIDEO:"CUT_VIDEO",REPLACE_AUDIO:"REPLACE_AUDIO",ADD_SUBTITLE:"ADD_SUBTITLE",RENDER_CONTENT:"RENDER_CONTENT",TRANSFORM_CONTENT:"TRANSFORM_CONTENT",VALIDATE_CONTENT:"VALIDATE_CONTENT",PACKAGE_CONTENT:"PACKAGE_CONTENT",PUBLISH_CONTENT:"PUBLISH_CONTENT",MANAGE_CHANNEL:"MANAGE_CHANNEL",OPERATE_BUSINESS:"OPERATE_BUSINESS",MANAGE_BUSINESS:"MANAGE_BUSINESS",MANAGE_MARKETING:"MANAGE_MARKETING",ANALYZE_MARKET:"ANALYZE_MARKET",ANALYZE_TRENDS:"ANALYZE_TRENDS",CREATE_BRAND:"CREATE_BRAND",PLAN_CAMPAIGN:"PLAN_CAMPAIGN",CONNECT_EXTERNAL:"CONNECT_EXTERNAL"};
  const re=(v)=>String(v||"").toLowerCase();
  function actionFor(goal,requirements={},options={}){
    if(options.action)return String(options.action).toUpperCase();
    if(requirements.action)return String(requirements.action).toUpperCase();
    const t=re(goal);
    if(/public(ar|ação|acao|ar conteúdo|ar conteudo)|postar/.test(t))return"PUBLISH_CONTENT";
    if(/trocar|substituir|mudar/.test(t)&&/áudio|audio/.test(t))return"REPLACE_AUDIO";
    if(/cortar|recortar/.test(t)&&/vídeo|video/.test(t))return"CUT_VIDEO";
    if(/dubl|doblag|voice.?over|narração|narracao/.test(t))return"DUB_CONTENT";
    if(/traduz|translation|translate/.test(t))return"TRANSLATE_CONTENT";
    if(/legenda|subtítulo|subtitulo/.test(t))return"ADD_SUBTITLE";
    if(/editar/.test(t)&&/foto|imagem/.test(t))return"EDIT_PHOTO";
    if(/editar|alterar/.test(t)&&/vídeo|video|conteúdo|conteudo/.test(t))return"EDIT_CONTENT";
    if(/marketing|marca|branding|posicionamento|campanha/.test(t))return"MANAGE_MARKETING";
    if(/vender|vendas|venda/.test(t))return"MANAGE_MARKETING";
    if(/canal|audiência|audiencia/.test(t))return"MANAGE_CHANNEL";
    if(/negócio|negocio|empresa|pedido|fornecedor|cliente/.test(t))return"OPERATE_BUSINESS";
    if(/validar|verificar/.test(t))return"VALIDATE_CONTENT";
    return"CREATE_CONTENT";
  }
  function sequenceFor(production){
    const explicit=production.options?.operations||production.requirements?.operations;
    if(Array.isArray(explicit)&&explicit.length)return explicit.map(x=>typeof x==="string"?{action:x}:x);
    const t=re(production.goal);
    const actions=[];
    if(/criar|produzir|gerar|faz(?:er)?|prepara(?:r)?/.test(t)&&/conteúdo|conteudo|vídeo|video|imagem|foto|post|instagram/.test(t))actions.push("CREATE_CONTENT");
    if(/editar/.test(t)&&/foto|imagem/.test(t))actions.push("EDIT_PHOTO");
    if(/editar|alterar/.test(t)&&/vídeo|video|conteúdo|conteudo/.test(t))actions.push("EDIT_CONTENT");
    if(/cortar|recortar/.test(t)&&/vídeo|video/.test(t))actions.push("CUT_VIDEO");
    if(/trocar|substituir|mudar/.test(t)&&/áudio|audio/.test(t))actions.push("REPLACE_AUDIO");
    if(/traduz|translation|translate/.test(t))actions.push("TRANSLATE_CONTENT");
    if(/legenda|legendar|subtítulo|subtitulo|caption/.test(t))actions.push("ADD_SUBTITLE");
    if(/dubl|doblag|voice.?over|narração|narracao/.test(t))actions.push("DUB_CONTENT");
    if(/renderizar|exportar/.test(t))actions.push("RENDER_CONTENT");
    if(/validar|verificar/.test(t))actions.push("VALIDATE_CONTENT");
    if(/publica(?:r)?|postar|posta|post\b|poste/.test(t))actions.push("PUBLISH_CONTENT");
    if(!actions.length)actions.push(actionFor(production.goal,production.requirements,production.options));
    return [...new Set(actions)];
  }
  function dependenciesFor(index,actions,production){
    const before=[...(production.options?.before||[]),...(production.requirements?.before||[])].map(String);
    if(index>0)before.push(actions[index-1]+"@PREVIOUS");
    return [...new Set(before.filter(Boolean))];
  }
  function plan(production={}){
    const sequence=sequenceFor(production);
    const count=Math.max(1,Number(production.quantity)||1);
    const operations=[];
    for(let n=0;n<count;n++){
      sequence.forEach((action,index)=>{
        const operationId=(production.productionId||"PROD")+"-OP-"+String(operations.length+1).padStart(2,"0");
        operations.push(new WordDarkOperation({
          operationId,requesterId:production.requesterId,originId:production.originId,clientId:production.clientId,
          destinationId:production.destinationId,operationType:action,action,
          capability:Catalog?.capabilityForAction?.(action)||Catalog?.resolve?.({action}),
          environment:production.options?.environment||"TEST",parentProductionId:production.productionId,
          resourceId:production.resourceId,
          context:{...production.context,requirements:production.requirements,dependencies:dependenciesFor(index,sequence,production),sequenceIndex:index+1,sequenceTotal:sequence.length,itemIndex:n+1,itemTotal:count},
          payload:{goal:production.goal,parameters:production.options?.parameters||{}}
        }));
      });
    }
    return{success:true,productionId:production.productionId,action:sequence[0],actions:sequence,operations,dependencies:operations.map(x=>({operationId:x.operationId,dependsOn:x.context.dependencies})),planVersion:"0.2"};
  }
  return{ACTIONS,actionFor,sequenceFor,dependenciesFor,plan};
});