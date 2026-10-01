/* WordDark Core — Identity
 * Identity V1 incorporada ao núcleo central.
 */
class WordDarkCoreIdentity {
  constructor(source={}){this.identityId=source.identityId||source.id||null;this.type=source.type||"SECTOR";this.name=source.name||null;this.ownerId=source.ownerId||null;this.parentId=source.parentId||null;this.status=source.status||"ACTIVE";this.metadata=source.metadata||{};this.areas=source.areas||[];this.createdAt=source.createdAt||new Date().toISOString();}
  validate(){const e=[];if(!this.identityId)e.push("identityId é obrigatório.");if(!this.type)e.push("type é obrigatório.");return {valid:e.length===0,errors:e};}
  isActive(){return this.status==="ACTIVE"||this.status==="ONLINE";}
  toJSON(){return {...this};}
}
if(typeof module!=="undefined")module.exports=WordDarkCoreIdentity;
if(typeof window!=="undefined")window.WordDarkCoreIdentity=WordDarkCoreIdentity;