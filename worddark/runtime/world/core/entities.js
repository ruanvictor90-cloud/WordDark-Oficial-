/* WordDark Core — Entity Model */
class WordDarkEntity {
  constructor(source={}) { Object.assign(this, source); this.status=this.status||"ACTIVE"; this.createdAt=this.createdAt||new Date().toISOString(); }
  validate(){ const e=[]; if(!this.id)e.push("id é obrigatório."); if(!this.name)e.push("name é obrigatório."); return {valid:e.length===0,errors:e}; }
  toJSON(){ return {...this}; }
}
class WordDarkClient extends WordDarkEntity { constructor(s={}){super({...s,type:"CLIENT"});} }
class WordDarkChannel extends WordDarkEntity { constructor(s={}){super({...s,type:"CHANNEL",clientId:s.clientId||null});} }
class WordDarkProject extends WordDarkEntity { constructor(s={}){super({...s,type:"PROJECT",clientId:s.clientId||null,resourceId:s.resourceId||null});} }
class WordDarkUser extends WordDarkEntity { constructor(s={}){super({...s,type:"USER",profile:s.profile||"VIEWER",clientId:s.clientId||null});} }
class WordDarkService extends WordDarkEntity { constructor(s={}){super({...s,type:"SERVICE",executor:s.executor||null});} }
class WordDarkConnectorEntity extends WordDarkEntity { constructor(s={}){super({...s,type:"CONNECTOR",platform:s.platform||null,accountId:s.accountId||null,permissions:s.permissions||[]});} }
if(typeof module!=="undefined")module.exports={WordDarkEntity,WordDarkClient,WordDarkChannel,WordDarkProject,WordDarkUser,WordDarkService,WordDarkConnectorEntity};
if(typeof window!=="undefined")Object.assign(window,{WordDarkEntity,WordDarkClient,WordDarkChannel,WordDarkProject,WordDarkUser,WordDarkService,WordDarkConnectorEntity});
