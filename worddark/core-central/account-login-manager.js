import { id } from './id.js';

export const LOGIN_PROVIDERS=Object.freeze({
  GOOGLE:{id:'GOOGLE',name:'Google',status:'READY'},
  LOCAL:{id:'LOCAL',name:'Acesso local',status:'READY'}
});

export const CONNECTION_SOURCES=Object.freeze({
  GOOGLE:{id:'GOOGLE',name:'Google',description:'Contas e serviços autorizados pela identidade Google',status:'AUTHORIZATION_REQUIRED'},
  YOUTUBE:{id:'YOUTUBE',name:'YouTube',description:'Canais autorizados pelo Google',status:'AUTHORIZATION_REQUIRED'},
  INSTAGRAM:{id:'INSTAGRAM',name:'Instagram',description:'Perfis autorizados pelo provedor',status:'AUTHORIZATION_REQUIRED'},
  TIKTOK:{id:'TIKTOK',name:'TikTok',description:'Perfis autorizados pelo provedor',status:'AUTHORIZATION_REQUIRED'},
  FACEBOOK:{id:'FACEBOOK',name:'Facebook',description:'Páginas/perfis autorizados pelo provedor',status:'AUTHORIZATION_REQUIRED'}
});

export class AccountLoginManager{
  constructor({storage=globalThis.localStorage}={}){this.storage=storage;this.session=null;}
  loginLocal({name='Usuário local'}={}){return this.startSession({provider:'LOCAL',subjectId:id('LOCAL'),name,email:null});}
  loginGoogle(identity){if(!identity?.sub)throw new Error('GOOGLE_IDENTITY_REQUIRED');return this.startSession({provider:'GOOGLE',subjectId:identity.sub,name:identity.name||identity.email||'Usuário Google',email:identity.email||null,picture:identity.picture||null});}
  startSession(data){this.session={id:id('SESSION'),provider:data.provider,subjectId:data.subjectId,name:data.name,email:data.email||null,picture:data.picture||null,status:'AUTHENTICATED',createdAt:new Date().toISOString()};this.storage?.setItem('wd.identity.session',JSON.stringify(this.session));return structuredClone(this.session);}
  restore(){try{const value=this.storage?.getItem('wd.identity.session');this.session=value?JSON.parse(value):null;return this.session?structuredClone(this.session):null;}catch{return null;}}
  logout(){this.session=null;this.storage?.removeItem('wd.identity.session');}
  requireSession(){return this.session||this.restore()||(()=>{throw new Error('LOGIN_REQUIRED')})();}
  availableConnections(){return Object.values(CONNECTION_SOURCES).map(structuredClone);}
}
