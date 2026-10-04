/* WordDark — Production Planner
 * Decompõe uma PRODUÇÃO em OPERAÇÕES universais.
 * Não executa. Escolhe apenas o menor percurso necessário.
 */
(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory(require("./capability-catalog"),require("../contracts/operation"));
  } else {
    const r=root||(typeof window!=="undefined"?window:globalThis);
    r.WordDarkProductionPlanner=factory(r.WordDarkCapabilityCatalog,r.WordDarkOperation);
  }
})(typeof globalThis!=="undefined"?globalThis:window,function(Catalog,WordDarkOperation){
  const ACTIONS={
    CREATE_CONTENT:"CREATE_CONTENT", EDIT_CONTENT:"EDIT_CONTENT", EDIT_PHOTO:"EDIT_PHOTO",
    CUT_VIDEO:"CUT_VIDEO", REPLACE_AUDIO:"REPLACE_AUDIO", ADD_SUBTITLE:"ADD_SUBTITLE",
    RENDER_CONTENT:"RENDER_CONTENT", TRANSFORM_CONTENT:"TRANSFORM_CONTENT",
    VALIDATE_CONTENT:"VALIDATE_CONTENT", PACKAGE_CONTENT:"PACKAGE_CONTENT",
    PUBLISH_CONTENT:"PUBLISH_CONTENT", MANAGE_CHANNEL:"MANAGE_CHANNEL",
    OPERATE_BUSINESS:"OPERATE_BUSINESS", MANAGE_BUSINESS:"MANAGE_BUSINESS",
    MANAGE_MARKETING:"MANAGE_MARKETING", ANALYZE_MARKET:"ANALYZE_MARKET",
    ANALYZE_TRENDS:"ANALYZE_TRENDS", CREATE_BRAND:"CREATE_BRAND", PLAN_CAMPAIGN:"PLAN_CAMPAIGN",
    CONNECT_EXTERNAL:"CONNECT_EXTERNAL"
  };
  function unique(list){return [...new Set(list.filter(Boolean))];}
  function actionFor(goal,requirements={},options={}){
    const text=String(goal||"").toLowerCase();
    if(options.action)return String(options.action).toUpperCase();
    if(requirements.action)return String(requirements.action).toUpperCase();
    if(/public(ar|ação|acao|ar conteúdo|ar conteudo)|postar/.test(text))return"PUBLISH_CONTENT";
    if(/trocar|substituir|mudar/.test(text)&&/áudio|audio/.test(text))return"REPLACE_AUDIO";
    if(/cortar|recortar/.test(text)&&/vídeo|video/.test(text))return"CUT_VIDEO";
    if(/legenda|subtítulo|subtitulo/.test(text))return"ADD_SUBTITLE";
    if(/editar/.test(text)&&/foto|imagem/.test(text))return"EDIT_PHOTO";
    if(/editar|alterar/.test(text)&&/vídeo|video|conteúdo|conteudo/.test(text))return"EDIT_CONTENT";
    if(/marketing|marca|branding|posicionamento|campanha/.test(text))return"MANAGE_MARKETING";
    if(/vender|vendas|venda/.test(text))return"MANAGE_MARKETING";
    if(/canal|audiência|audiencia/.test(text))return"MANAGE_CHANNEL";
    if(/negócio|negocio|empresa|pedido|fornecedor|cliente/.test(text))return"OPERATE_BUSINESS";
    if(/validar|verificar/.test(text))return"VALIDATE_CONTENT";
    return"CREATE_CONTENT";
  }
  function dependenciesFor(action,requirements={},options={}){
    const deps=[];
    if(Array.isArray(options.before))deps.push(...options.before.map(String));
    if(Array.isArray(requirements.before))deps.push(...requirements.before.map(String));
    return unique(deps);
  }
  function plan(production={}){
    const action=actionFor(production.goal,production.requirements,production.options);
    const count=Math.max(1,Number(production.quantity)||1);
    const deps=dependenciesFor(action,production.requirements,production.options);
    const operations=[];
    for(let i=0;i<count;i++){
      operations.push(new WordDarkOperation({
        operationId:(production.productionId||"PROD")+"-OP-"+String(i+1).padStart(2,"0"),
        requesterId:production.requesterId,
        originId:production.originId,
        clientId:production.clientId,
        destinationId:production.destinationId,
        operationType:action,
        action,
        capability:Catalog?.capabilityForAction?.(action)||Catalog?.resolve?.({action}),
        environment:production.options?.environment||"TEST",
        parentProductionId:production.productionId,
        resourceId:production.resourceId,
        context:{...production.context,requirements:production.requirements,dependencies:deps,index:i+1,total:count},
        payload:{goal:production.goal,parameters:production.options?.parameters||{}}
      }));
    }
    return {success:true,productionId:production.productionId,action,operations,dependencies:deps,planVersion:"0.1"};
  }
  return {ACTIONS,actionFor,dependenciesFor,plan};
});
