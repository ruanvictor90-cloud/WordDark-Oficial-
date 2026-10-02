/* WordDark — Social Operation Contract · DF-0.8
 * A Dark Factory never talks directly to a platform.
 * It prepares/validates an operation and hands the external side
 * to Central de Conexões through a capability contract.
 */
export const SOCIAL_ACTIONS=Object.freeze({
  ACCOUNT_READ:"ACCOUNT_READ",
  ACCOUNT_UPDATE:"ACCOUNT_UPDATE",
  CONTENT_CREATE:"CONTENT_CREATE",
  CONTENT_UPDATE:"CONTENT_UPDATE",
  CONTENT_DELETE:"CONTENT_DELETE",
  CONTENT_PUBLISH:"CONTENT_PUBLISH",
  CONTENT_UNPUBLISH:"CONTENT_UNPUBLISH",
  CONTENT_SCHEDULE:"CONTENT_SCHEDULE",
  COMMENT_READ:"COMMENT_READ",
  COMMENT_CREATE:"COMMENT_CREATE",
  COMMENT_DELETE:"COMMENT_DELETE",
  MESSAGE_READ:"MESSAGE_READ",
  MESSAGE_SEND:"MESSAGE_SEND",
  ANALYTICS_READ:"ANALYTICS_READ",
  MEDIA_UPLOAD:"MEDIA_UPLOAD",
  MEDIA_DELETE:"MEDIA_DELETE"
});

export class SocialOperation {
  constructor({requestId,network,action,accountId=null,payload={},options={}}={}){
    this.operationId="SOP-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,7).toUpperCase();
    this.requestId=requestId||null;
    this.network=String(network||"").toUpperCase();
    this.action=String(action||"").toUpperCase();
    this.accountId=accountId;
    this.payload=payload||{};
    this.options=options||{};
    this.status="PENDING";
    this.createdAt=new Date().toISOString();
  }
  validate(){
    const errors=[];
    if(!this.requestId)errors.push("requestId obrigatório.");
    if(!this.network)errors.push("network obrigatório.");
    if(!this.action)errors.push("action obrigatório.");
    if(!Object.values(SOCIAL_ACTIONS).includes(this.action))errors.push("Ação social não suportada pelo contrato.");
    if(!this.accountId)errors.push("accountId obrigatório.");
    return {valid:errors.length===0,errors};
  }
  toJSON(){return {...this};}
}
if(typeof window!=="undefined"){window.SOCIAL_ACTIONS=SOCIAL_ACTIONS;window.SocialOperation=SocialOperation;}
if(typeof module!=="undefined"&&module.exports)module.exports={SOCIAL_ACTIONS,SocialOperation};
