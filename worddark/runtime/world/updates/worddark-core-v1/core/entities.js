/* WordDark Lab — Client / Channel / Project / User / Service / Connector / Result */
class LabEntity {
  constructor(source={}){Object.assign(this,source);this.status=this.status||"ACTIVE";this.createdAt=this.createdAt||new Date().toISOString();}
  validate(){const e=[];if(!this.id)e.push("id é obrigatório.");if(!this.name)e.push("name é obrigatório.");return {valid:e.length===0,errors:e};}
  toJSON(){return {...this};}
}
class Client extends LabEntity { constructor(s={}){super({...s,type:"CLIENT"});} }
class Channel extends LabEntity { constructor(s={}){super({...s,type:"CHANNEL",clientId:s.clientId||null});} }
class Project extends LabEntity { constructor(s={}){super({...s,type:"PROJECT",clientId:s.clientId||null,resourceId:s.resourceId||null});} }
class User extends LabEntity { constructor(s={}){super({...s,type:"USER",profile:s.profile||"VIEWER",clientId:s.clientId||null});} }
class Service extends LabEntity { constructor(s={}){super({...s,type:"SERVICE",executor:s.executor||null});} }
class Connector extends LabEntity { constructor(s={}){super({...s,type:"CONNECTOR",platform:s.platform||null,accountId:s.accountId||null,permissions:s.permissions||[]});} }
class Result extends LabEntity { constructor(s={}){super({...s,type:"RESULT",operationId:s.operationId||null,status:s.status||"CREATED",files:s.files||[],report:s.report||null});} }
if(typeof module!=="undefined")module.exports={LabEntity,Client,Channel,Project,User,Service,Connector,Result};
if(typeof window!=="undefined")Object.assign(window,{LabEntity,Client,Channel,Project,User,Service,Connector,Result});
