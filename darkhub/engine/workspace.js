const SCHEMA="darkhub-workspace-v1";
const KEY="darkhub.workspace.v1";
const clone=value=>JSON.parse(JSON.stringify(value));
const required=(value,label,max=180)=>{if(typeof value!=="string"||!value.trim())throw new TypeError(label+" é obrigatório.");return value.trim().slice(0,max);};
function cleanPath(value){
 const path=required(value,"Caminho do arquivo",180).replace(/\\/g,"/");
 if(path.startsWith("/")||path.split("/").some(part=>!part||part==="."||part===".."||part.startsWith(".")))throw new TypeError("Use um caminho relativo simples, sem segmentos ocultos, '.' ou '..'.");
 if(!/^[a-zA-Z0-9_@.-]+(?:\/[a-zA-Z0-9_@.-]+)*$/.test(path))throw new TypeError("Caminho contém caracteres não permitidos.");
 if(!/\.[a-zA-Z0-9]{1,12}$/.test(path))throw new TypeError("Informe a extensão do arquivo, por exemplo src/main.js.");
 return path;
}
export function createDarkHubWorkspace({storage=globalThis.localStorage,now=()=>new Date().toISOString(),idFactory=()=>globalThis.crypto?.randomUUID?.()||("ws-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)),runtime}={}){
 if(!runtime)throw new TypeError("Workspace precisa do runtime do darkHub.");
 let memory=null;
 const initial=()=>({schema:SCHEMA,projects:{},snapshots:[]});
 function read(){try{const raw=storage?.getItem(KEY);if(!raw)return initial();const data=JSON.parse(raw);if(data?.schema!==SCHEMA||!data.projects||typeof data.projects!=="object"||!Array.isArray(data.snapshots))throw Error("schema");return data;}catch{return memory?clone(memory):initial();}}
 function write(data){memory=clone(data);try{storage?.setItem(KEY,JSON.stringify(data));}catch{}return clone(data);}
 function ensureProject(appId,data=read()){
  if(!runtime.getApp(appId))throw new Error("O projeto precisa estar registrado no catálogo do darkHub.");
  if(!data.projects[appId])data.projects[appId]={appId,createdAt:now(),updatedAt:now(),files:[]};
  return data.projects[appId];
 }
 function listProjects(){const data=read();return runtime.listApps().map(app=>{const p=data.projects[app.id];return {appId:app.id,name:app.name,fileCount:p?.files.length||0,updatedAt:p?.updatedAt||null};});}
 function listFiles(appId){const p=read().projects[appId];return p?clone(p.files).sort((a,b)=>a.path.localeCompare(b.path)):[];}
 function getFile(appId,path){const clean=cleanPath(path),p=read().projects[appId];return p?clone(p.files.find(f=>f.path===clean)||null):null;}
 function createFile(appId,path,content=""){
  const clean=cleanPath(path);if(typeof content!=="string")throw new TypeError("Conteúdo precisa ser texto.");if(content.length>200000)throw new RangeError("Arquivo excede o limite local de 200 KB.");
  const data=read(),p=ensureProject(appId,data);if(p.files.some(f=>f.path===clean))throw new Error("Já existe um arquivo nesse caminho.");
  if(p.files.length>=100)throw new RangeError("Limite local de 100 arquivos por projeto atingido.");
  const file={id:String(idFactory()),path:clean,content,revision:1,createdAt:now(),updatedAt:now()};p.files.push(file);p.updatedAt=now();write(data);return clone(file);
 }
 function saveFile(appId,path,content){
  const clean=cleanPath(path);if(typeof content!=="string")throw new TypeError("Conteúdo precisa ser texto.");if(content.length>200000)throw new RangeError("Arquivo excede o limite local de 200 KB.");
  const data=read(),p=ensureProject(appId,data),file=p.files.find(f=>f.path===clean);if(!file)throw new Error("Arquivo não encontrado. Crie o arquivo antes de salvar.");
  if(file.content!==content){file.content=content;file.revision++;file.updatedAt=now();p.updatedAt=now();write(data);}return clone(file);
 }
 function deleteFile(appId,path){
  const clean=cleanPath(path),data=read(),p=data.projects[appId];if(!p)throw new Error("Projeto sem arquivos.");
  const i=p.files.findIndex(f=>f.path===clean);if(i<0)throw new Error("Arquivo não encontrado.");
  p.files.splice(i,1);p.updatedAt=now();write(data);return true;
 }
 function createSnapshot(appId,label="Ponto de restauração"){
  const data=read(),p=ensureProject(appId,data);const snapshot={id:String(idFactory()),appId,label:required(label,"Nome da versão",120),createdAt:now(),files:clone(p.files)};
  data.snapshots.push(snapshot);write(data);return {...snapshot,files:undefined,fileCount:snapshot.files.length};
 }
 function listSnapshots(appId){return read().snapshots.filter(s=>s.appId===appId).map(s=>({id:s.id,appId:s.appId,label:s.label,createdAt:s.createdAt,fileCount:s.files.length})).reverse();}
 function restoreSnapshot(id){
  const data=read(),snapshot=data.snapshots.find(s=>s.id===id);if(!snapshot)throw new Error("Ponto de restauração não encontrado.");
  const p=ensureProject(snapshot.appId,data);p.files=clone(snapshot.files).map(f=>({...f,revision:(f.revision||1)+1,updatedAt:now()}));p.updatedAt=now();write(data);return {appId:snapshot.appId,files:clone(p.files),restoredAt:p.updatedAt};
 }
 function validateProject(appId){
  const app=runtime.getApp(appId);if(!app)throw new Error("Projeto não encontrado.");
  const files=listFiles(appId),errors=[],warnings=[],paths=new Set();let totalBytes=0;
  for(const file of files){
   if(paths.has(file.path))errors.push("Caminho duplicado: "+file.path);paths.add(file.path);
   if(typeof file.content!=="string")errors.push("Conteúdo inválido: "+file.path);
   if(file.content.length>200000)errors.push("Arquivo acima de 200 KB: "+file.path);
   totalBytes+=file.content.length;
   if(/(?:^|\/)(?:\.env|secrets?\.(?:json|txt)|credentials?\.(?:json|txt))$/i.test(file.path))warnings.push("Confira se o arquivo contém segredos: "+file.path);
  }
  if(!files.length)errors.push("O projeto ainda não possui arquivos.");
  if(files.length>100)errors.push("O projeto ultrapassa o limite de 100 arquivos.");
  if(totalBytes>2000000)errors.push("O projeto ultrapassa o limite total de 2 MB de texto.");
  if(!files.some(f=>/^(?:index\.html|src\/main\.(?:js|ts)|package\.json)$/i.test(f.path)))warnings.push("Não foi encontrado um ponto de entrada comum (index.html, src/main.js/ts ou package.json).");
  if(!files.some(f=>/(?:^|\/)(?:.*\.)?(?:test|spec)\.[cm]?[jt]sx?$/i.test(f.path)))warnings.push("Nenhum arquivo de teste foi identificado; a validação automatizada ainda precisa ser executada fora do editor.");
  return {appId,projectName:app.name,valid:errors.length===0,files:files.length,totalCharacters:totalBytes,errors,warnings,checkedAt:now()};
 }
 function preparePackage(appId,label="Pacote preparado para revisão"){
  const validation=validateProject(appId);if(!validation.valid)throw new Error("Não é possível preparar o pacote: "+validation.errors.join(" "));
  const snapshot=createSnapshot(appId,label);
  return {schema:SCHEMA,validation,snapshot,project:exportProject(appId),preparedAt:now(),published:false,note:"Pacote local preparado. Não foi enviado a um repositório nem publicado."};
 }
 function exportProject(appId){const app=runtime.getApp(appId);if(!app)throw new Error("Projeto não encontrado.");const data=read(),p=data.projects[appId]||{appId,createdAt:now(),updatedAt:now(),files:[]};return {schema:SCHEMA,app:{id:app.id,name:app.name,version:app.version},project:clone(p),snapshots:clone(data.snapshots.filter(s=>s.appId===appId)),exportedAt:now()};}
 function importProject(bundle){
  if(!bundle||bundle.schema!==SCHEMA||!bundle.app||typeof bundle.app.id!=="string"||!bundle.project||bundle.project.appId!==bundle.app.id||!Array.isArray(bundle.project.files))throw new TypeError("Pacote de projeto inválido.");
  if(!runtime.getApp(bundle.app.id))throw new Error("Registre o aplicativo no catálogo antes de importar seus arquivos.");
  if(bundle.project.files.length>100)throw new RangeError("O projeto excede 100 arquivos.");
  const seen=new Set();const files=bundle.project.files.map(f=>{const path=cleanPath(f.path);if(seen.has(path))throw new Error("O pacote contém caminhos duplicados.");seen.add(path);if(typeof f.content!=="string"||f.content.length>200000)throw new TypeError("Conteúdo de arquivo inválido ou acima de 200 KB.");return {id:String(idFactory()),path,content:f.content,revision:1,createdAt:now(),updatedAt:now()};});
  const data=read();data.projects[bundle.app.id]={appId:bundle.app.id,createdAt:now(),updatedAt:now(),files};data.snapshots=data.snapshots.filter(s=>s.appId!==bundle.app.id);
  if(Array.isArray(bundle.snapshots))for(const s of bundle.snapshots){if(s.appId===bundle.app.id&&Array.isArray(s.files))data.snapshots.push({...clone(s),id:String(idFactory()),files:s.files.map(f=>({...f,path:cleanPath(f.path)}))});}
  write(data);return {appId:bundle.app.id,fileCount:files.length};
 }
 function exportState(){return {...read(),exportedAt:now()};}
 return Object.freeze({schema:SCHEMA,listProjects,listFiles,getFile,createFile,saveFile,deleteFile,createSnapshot,listSnapshots,restoreSnapshot,exportProject,importProject,exportState});
}
export {SCHEMA as WORKSPACE_SCHEMA,KEY as WORKSPACE_STORAGE_KEY};
