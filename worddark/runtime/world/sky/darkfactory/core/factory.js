/* WordDark — Dark Factory Modular Factory · DF-0.10 */
class DarkFactory {
 constructor(options){options=options||{};this.registry=options.registry||null;this.pipeline=options.pipeline||null;this.socialFactory=options.socialFactory||null;this.contentFactory=options.contentFactory||null;this.status="ONLINE";}
 normalizeTaskType(value){
  const raw=String(value||"").trim();
  const aliases={CREATE_CONTENT:"content.produce",EDIT_CONTENT:"content.edit",EDIT_PHOTO:"content.edit",CUT_VIDEO:"content.edit",REPLACE_AUDIO:"content.edit",ADD_SUBTITLE:"content.edit",RENDER_CONTENT:"content.render",TRANSFORM_CONTENT:"content.transform",VALIDATE_CONTENT:"content.validate",PACKAGE_CONTENT:"content.package",PUBLISH_CONTENT:"content.publish"};
  return aliases[raw.toUpperCase()]||raw;
 }
 process(request){
  if(!request)return{success:false,status:"REJECTED",reason:"Requerimento ausente."};
  if(!request.taskType)return{success:false,status:"REJECTED",reason:"taskType obrigatório."};
  const normalizedTaskType=this.normalizeTaskType(request.taskType);
  const t=String(normalizedTaskType).toLowerCase();
  const isContent=t.startsWith("content.")||request.content===true||!!request.contentId||!!request.payload?.contentId||["CREATE_CONTENT","EDIT_CONTENT","RENDER_CONTENT","TRANSFORM_CONTENT","VALIDATE_CONTENT","PACKAGE_CONTENT"].includes(String(request.taskType).toUpperCase());
  if(isContent){
    if(!this.contentFactory)return{success:false,status:"FAILED",stage:"DARK_FACTORY_CONTENT",reason:"Content Factory não configurada."};
    const normalized={...request,taskType:normalizedTaskType};
    return this.contentFactory.receive(normalized);
  }
  const isSocial=t.startsWith("social.")||request.social===true||!!request.network||!!request.action;
  if(isSocial){
    if(!this.socialFactory)return{success:false,status:"FAILED",stage:"DARK_FACTORY_SOCIAL",reason:"Social Factory não configurada."};
    return this.socialFactory.receive({id:request.id,requestId:request.id,network:request.network||request.payload?.network,action:request.action||request.payload?.action||t.replace(/^social\./i,""),accountId:request.accountId||request.payload?.accountId,payload:request.payload||{},options:request.options||{}});
  }
  if(!this.pipeline)return{success:false,status:"FAILED",reason:"Pipeline não configurado."};
  return this.pipeline.run({...request,taskType:normalizedTaskType});
 }
 getStatus(){return{status:this.status,serviceCount:this.registry?this.registry.list().length:0,socialReady:!!this.socialFactory,contentReady:!!this.contentFactory};}
}
if(typeof module!=="undefined")module.exports=DarkFactory;if(typeof window!=="undefined")window.DarkFactory=DarkFactory;