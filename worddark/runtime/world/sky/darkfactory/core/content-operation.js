/* WordDark — Dark Factory Content Operation · DF-0.9 */
const CONTENT_ACTIONS=Object.freeze({CONTENT_CREATE:"CONTENT_CREATE",CONTENT_EDIT:"CONTENT_EDIT",CONTENT_ASSEMBLE:"CONTENT_ASSEMBLE",CONTENT_RENDER:"CONTENT_RENDER",CONTENT_TRANSFORM:"CONTENT_TRANSFORM",CONTENT_VALIDATE:"CONTENT_VALIDATE",ASSET_PREPARE:"ASSET_PREPARE",CONTENT_PACKAGE:"CONTENT_PACKAGE"});
const CONTENT_TYPES=Object.freeze(["TEXT","IMAGE","AUDIO","VIDEO","SHORT","REEL","THUMBNAIL","SUBTITLE","MIXED"]);
class ContentOperation{
 constructor({requestId,action,contentId=null,contentType="MIXED",input=null,requirements={},options={}}={}){this.operationId="COP-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,7).toUpperCase();this.requestId=requestId||null;this.action=String(action||"").toUpperCase();this.contentId=contentId;this.contentType=String(contentType||"MIXED").toUpperCase();this.input=input;this.requirements=requirements||{};this.options=options||{};this.status="PENDING";this.createdAt=new Date().toISOString();}
 validate(){const errors=[];if(!this.requestId)errors.push("requestId obrigatório.");if(!this.contentId)errors.push("contentId obrigatório.");if(!Object.values(CONTENT_ACTIONS).includes(this.action))errors.push("Ação de conteúdo não suportada.");if(!CONTENT_TYPES.includes(this.contentType))errors.push("Tipo de conteúdo não suportado.");return{valid:errors.length===0,errors};}
 toJSON(){return {...this};}
}
if(typeof window!=="undefined"){window.CONTENT_ACTIONS=CONTENT_ACTIONS;window.CONTENT_TYPES=CONTENT_TYPES;window.ContentOperation=ContentOperation;}
if(typeof module!=="undefined"&&module.exports)module.exports={ContentOperation,CONTENT_ACTIONS,CONTENT_TYPES};