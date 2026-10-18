const SCHEMA = "darkhub-runtime-v1";
const STORAGE_KEY = "darkhub.runtime.v1";
const EVENTS = Object.freeze({ CHANGE: "darkhub:runtime-change" });
const STATUSES = Object.freeze(["Planejado","Em desenvolvimento","Em revisão","Em finalização","Pronto para teste","Publicado","Pausado"]);
const BASE_APPS = Object.freeze([
  { id:"shadoweb", name:"Shadoweb", kind:"app", status:"Em desenvolvimento", version:"0.1.0", priority:1, description:"Navegador independente e foco atual do desenvolvimento.", route:"shadoweb", connection:"standalone" },
  { id:"worddark-hub", name:"WordDark Hub", kind:"module", status:"Planejado", version:"0.1.0", priority:2, description:"Módulo interno do darkHub; não é o APK principal do WordDark.", route:"worddark-hub", connection:"future-worddark-apk" }
]);
const clone = value => JSON.parse(JSON.stringify(value));
const text = (value, field, max=180) => {
  if(typeof value!=="string" || !value.trim()) throw new TypeError(field+" é obrigatório.");
  return value.trim().slice(0,max);
};
function validVersion(value) {
  const version=text(value,"Versão",32);
  if(!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new TypeError("Use versão semântica, por exemplo 0.1.0.");
  return version;
}
function validIconDataUrl(value) {
  if(value==null||value==="")return null;
  if(typeof value!=="string"||value.length>250000||!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new TypeError("Use um logo PNG, JPG ou WebP local de até 180 KB.");
  }
  return value;
}
export function createDarkHubRuntime({storage=globalThis.localStorage, now=()=>new Date().toISOString(), idFactory=()=>globalThis.crypto?.randomUUID?.()||("dh-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)), eventTarget=globalThis.window}={}) {
  let memory=null;
  function read() {
    try {
      const raw=storage?.getItem(STORAGE_KEY);
      if(!raw) return {schema:SCHEMA, apps:clone(BASE_APPS), drafts:[], releases:[], connections:[]};
      const data=JSON.parse(raw);
      if(data?.schema!==SCHEMA || !Array.isArray(data.apps)) throw new Error("schema");
      const ids=new Set(data.apps.map(app=>app?.id));
      return {...data, apps:[...clone(BASE_APPS).filter(app=>!ids.has(app.id)),...data.apps]};
    } catch { return memory?clone(memory):{schema:SCHEMA,apps:clone(BASE_APPS),drafts:[],releases:[],connections:[]}; }
  }
  function write(data) {
    memory=clone(data);
    try { storage?.setItem(STORAGE_KEY,JSON.stringify(data)); } catch {}
    try { if(eventTarget?.dispatchEvent && typeof globalThis.CustomEvent==="function") eventTarget.dispatchEvent(new CustomEvent(EVENTS.CHANGE,{detail:{schema:SCHEMA,appCount:data.apps.length}})); } catch {}
    return clone(data);
  }
  function listApps() { return read().apps.sort((a,b)=>(a.priority||99)-(b.priority||99)||a.name.localeCompare(b.name,"pt-BR")); }
  function getApp(id) { return listApps().find(app=>app.id===id)||null; }
  function registerApp(input={}) {
    const data=read(), id=text(input.id,"Identificador do app",80).toLowerCase();
    if(!/^[a-z0-9][a-z0-9-]{1,79}$/.test(id)) throw new TypeError("Use um ID técnico simples, por exemplo dark-commerce.");
    if(data.apps.some(app=>app.id===id)) throw new Error("Já existe um app ou módulo com esse identificador.");
    const kind=input.kind==="module"?"module":"app";
    const app={id,name:text(input.name,"Nome do app",100),kind,status:"Planejado",version:validVersion(input.version||"0.1.0"),priority:Number.isFinite(input.priority)?Math.max(1,Math.min(999,input.priority)):data.apps.length+1,description:text(input.description,"Descrição",500),iconDataUrl:validIconDataUrl(input.iconDataUrl),route:id,connection:"standalone",createdAt:now(),updatedAt:now()};
    data.apps.push(app);write(data);return clone(app);
  }
  function updateApp(id, patch={}) {
    const data=read(), index=data.apps.findIndex(app=>app.id===id);
    if(index<0) throw new Error("Aplicativo ou módulo não encontrado.");
    const current=data.apps[index];
    if(current.id==="worddark-hub" && patch.kind==="app") throw new Error("WordDark Hub permanece um módulo interno do darkHub.");
    const next={...current};
    if(patch.status!==undefined) { if(!STATUSES.includes(patch.status)) throw new TypeError("Estado inválido."); next.status=patch.status; }
    if(patch.version!==undefined) next.version=validVersion(patch.version);
    if(patch.description!==undefined) next.description=text(patch.description,"Descrição",500);
    next.updatedAt=now(); data.apps[index]=next; write(data); return clone(next);
  }
  function createDraft(input={}) {
    const data=read(), appId=text(input.appId,"Aplicativo",80);
    if(!data.apps.some(app=>app.id===appId)) throw new Error("O aplicativo precisa estar registrado no darkHub.");
    const draft={id:String(idFactory()),appId,title:text(input.title,"Título da alteração",120),summary:typeof input.summary==="string"?input.summary.trim().slice(0,1000):"",status:"Em criação",createdAt:now(),updatedAt:now()};
    data.drafts.push(draft); write(data); return clone(draft);
  }
  function updateDraft(id, patch={}) {
    const data=read(), draft=data.drafts.find(item=>item.id===id);
    if(!draft) throw new Error("Alteração não encontrada.");
    if(patch.title!==undefined) draft.title=text(patch.title,"Título da alteração",120);
    if(patch.summary!==undefined) draft.summary=String(patch.summary).trim().slice(0,1000);
    if(patch.status!==undefined) {
      const allowed=["Em criação","Em revisão","Validado","Finalizado","Cancelado"];
      if(!allowed.includes(patch.status)) throw new TypeError("Estado da alteração inválido.");
      draft.status=patch.status;
    }
    draft.updatedAt=now(); write(data); return clone(draft);
  }
  function finalizeDraft(id,{version,notes=""}={}) {
    const data=read(), draft=data.drafts.find(item=>item.id===id);
    if(!draft) throw new Error("Alteração não encontrada.");
    if(draft.status!=="Validado") throw new Error("A alteração precisa ser validada antes de finalizar.");
    const app=data.apps.find(item=>item.id===draft.appId);
    if(!app) throw new Error("Aplicativo associado não encontrado.");
    const release={id:String(idFactory()),appId:app.id,version:validVersion(version||app.version),draftId:draft.id,notes:String(notes).trim().slice(0,1000),status:"Preparado para teste",createdAt:now()};
    data.releases.push(release); app.version=release.version; app.status="Pronto para teste"; app.updatedAt=now(); draft.status="Finalizado"; draft.updatedAt=now(); write(data); return clone(release);
  }
  function registerConnection(input={}) {
    const data=read(), id=text(input.id,"Identificador da conexão",100);
    const allowed=["planned","disabled"];
    const status=allowed.includes(input.status)?input.status:"planned";
    const existing=data.connections.find(item=>item.id===id);
    if(existing) return clone(existing);
    const connection={id,name:text(input.name,"Nome da conexão",120),target:text(input.target,"Destino",160),status,mode:"contract-first",createdAt:now()};
    data.connections.push(connection); write(data); return clone(connection);
  }
  function exportState() { return { ...read(), exportedAt:now() }; }
  function importState(payload) {
    if(!payload || payload.schema!==SCHEMA || !Array.isArray(payload.apps) || !Array.isArray(payload.drafts) || !Array.isArray(payload.releases) || !Array.isArray(payload.connections)) throw new TypeError("Backup do darkHub inválido.");
    const baseIds=new Set(BASE_APPS.map(app=>app.id));
    const apps=[...clone(BASE_APPS).filter(app=>!payload.apps.some(item=>item?.id===app.id)),...payload.apps.map(app=>({...app,kind:baseIds.has(app.id)?BASE_APPS.find(base=>base.id===app.id).kind:app.kind}))];
    return write({schema:SCHEMA,apps,drafts:clone(payload.drafts),releases:clone(payload.releases),connections:clone(payload.connections)});
  }
  return Object.freeze({schema:SCHEMA,storageKey:STORAGE_KEY,statuses:[...STATUSES],listApps,getApp,registerApp,updateApp,createDraft,updateDraft,finalizeDraft,registerConnection,exportState,importState});
}
export { SCHEMA as DARKHUB_SCHEMA, STORAGE_KEY as DARKHUB_STORAGE_KEY, BASE_APPS as DARKHUB_BASE_APPS };
