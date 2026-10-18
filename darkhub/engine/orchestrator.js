import { createDarkHubRuntime } from "./runtime.js";

const ORCHESTRATOR_SCHEMA = "darkhub-orchestrator-v1";
const ORCHESTRATOR_KEY = "darkhub.orchestrator.v1";
const TASK_STATES = ["queued","assigned","running","blocked","done","cancelled"];
const CAPABILITY_ID = /^[a-z0-9][a-z0-9._-]{1,79}$/;
const clone = value => JSON.parse(JSON.stringify(value));
const required = (v,label,max=160) => {
  if(typeof v!=="string" || !v.trim()) throw new TypeError(label+" é obrigatório.");
  return v.trim().slice(0,max);
};

export function createDarkHubOrchestrator({storage=globalThis.localStorage,now=()=>new Date().toISOString(),idFactory=()=>globalThis.crypto?.randomUUID?.()||("dh-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)),runtime=createDarkHubRuntime({storage,now,idFactory,eventTarget:null})}={}) {
  let memory=null;
  function initial(){return {schema:ORCHESTRATOR_SCHEMA,capabilities:[],tasks:[],messages:[],policies:[{id:"default-deny",name:"Negar por padrão",description:"Nenhum conector ou capacidade externa executa sem registro e autorização explícitos.",enabled:true}],sequence:0};}
  function read(){
    try {
      const raw=storage?.getItem(ORCHESTRATOR_KEY);
      if(!raw) return initial();
      const data=JSON.parse(raw);
      if(data?.schema!==ORCHESTRATOR_SCHEMA || !Array.isArray(data.capabilities)||!Array.isArray(data.tasks)||!Array.isArray(data.messages)||!Array.isArray(data.policies)) throw new Error("schema");
      return data;
    } catch {return memory?clone(memory):initial();}
  }
  function write(data){memory=clone(data);try{storage?.setItem(ORCHESTRATOR_KEY,JSON.stringify(data));}catch{}return clone(data);}
  function listCapabilities(){return read().capabilities.slice().sort((a,b)=>a.appId.localeCompare(b.appId)||a.name.localeCompare(b.name));}
  function registerCapability(input={}){
    const appId=required(input.appId,"Aplicativo",80), id=required(input.id,"ID da capacidade",80);
    if(!CAPABILITY_ID.test(id)) throw new TypeError("Use um ID técnico em minúsculas, como browser.open.");
    const app=runtime.getApp(appId);
    if(!app) throw new Error("A capacidade deve pertencer a um app ou módulo registrado no darkHub.");
    if(typeof input.description!=="string"||!input.description.trim()) throw new TypeError("Descrição da capacidade é obrigatória.");
    const data=read(), fullId=appId+":"+id, existing=data.capabilities.find(x=>x.fullId===fullId);
    const record={fullId,appId,id,name:required(input.name,"Nome da capacidade",120),description:input.description.trim().slice(0,600),inputSchema:input.inputSchema&&typeof input.inputSchema==="object"?clone(input.inputSchema):{},outputSchema:input.outputSchema&&typeof input.outputSchema==="object"?clone(input.outputSchema):{},permission:required(input.permission||"local-only","Permissão",80),status:input.status==="enabled"?"enabled":"registered",version:required(input.version||app.version,"Versão",32),updatedAt:now()};
    if(existing){Object.assign(existing,record);write(data);return clone(existing);}
    data.capabilities.push({...record,createdAt:now()});write(data);return clone(data.capabilities[data.capabilities.length-1]);
  }
  function setCapabilityStatus(fullId,status){
    if(!["registered","enabled","disabled"].includes(status)) throw new TypeError("Estado da capacidade inválido.");
    const data=read(),cap=data.capabilities.find(x=>x.fullId===fullId);
    if(!cap) throw new Error("Capacidade não encontrada.");
    if(status==="enabled" && cap.permission!=="local-only" && cap.permission!=="approved") throw new Error("Capacidade externa precisa de permissão aprovada antes de ser ativada.");
    cap.status=status;cap.updatedAt=now();write(data);return clone(cap);
  }
  function listTasks(){return read().tasks.slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
  function createTask(input={}){
    const appId=required(input.appId,"Aplicativo",80),title=required(input.title,"Título da tarefa",160);
    if(!runtime.getApp(appId)) throw new Error("Aplicativo não registrado.");
    const capabilityId=input.capabilityId?required(input.capabilityId,"Capacidade",170):null;
    if(capabilityId){const cap=read().capabilities.find(x=>x.fullId===capabilityId);if(!cap||cap.appId!==appId)throw new Error("A capacidade selecionada não pertence ao aplicativo.");if(cap.status!=="enabled")throw new Error("A capacidade precisa estar habilitada para receber tarefas.");}
    const data=read(),task={id:String(idFactory()),appId,capabilityId,title,description:typeof input.description==="string"?input.description.trim().slice(0,1200):"",state:"queued",priority:["low","normal","high","urgent"].includes(input.priority)?input.priority:"normal",createdAt:now(),updatedAt:now(),result:null};
    data.tasks.push(task);data.sequence++;data.messages.push({id:String(idFactory()),type:"task.queued",taskId:task.id,appId,createdAt:now(),read:false});write(data);return clone(task);
  }
  function transitionTask(id,nextState,details={}){
    if(!TASK_STATES.includes(nextState)) throw new TypeError("Estado de tarefa inválido.");
    const data=read(),task=data.tasks.find(x=>x.id===id);if(!task)throw new Error("Tarefa não encontrada.");
    const allowed={queued:["assigned","cancelled"],assigned:["running","blocked","cancelled"],running:["blocked","done","cancelled"],blocked:["queued","cancelled"],done:[],cancelled:[]};
    if(!allowed[task.state].includes(nextState)) throw new Error("Transição não permitida: "+task.state+" → "+nextState+".");
    task.state=nextState;task.updatedAt=now();
    if(nextState==="done") task.result=typeof details.result==="string"?details.result.trim().slice(0,1200):"Concluído manualmente; nenhum executor automático foi presumido.";
    if(nextState==="blocked") task.result=typeof details.reason==="string"?details.reason.trim().slice(0,600):"Bloqueada para revisão.";
    data.messages.push({id:String(idFactory()),type:"task."+nextState,taskId:task.id,appId:task.appId,createdAt:now(),read:false});write(data);return clone(task);
  }
  function listMessages(){return read().messages.slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
  function markMessageRead(id){const data=read(),msg=data.messages.find(x=>x.id===id);if(!msg)throw new Error("Mensagem não encontrada.");msg.read=true;write(data);return clone(msg);}
  function dashboard(){const data=read();return {apps:runtime.listApps().length,capabilities:data.capabilities.length,enabledCapabilities:data.capabilities.filter(x=>x.status==="enabled").length,queuedTasks:data.tasks.filter(x=>["queued","assigned","running","blocked"].includes(x.state)).length,unreadMessages:data.messages.filter(x=>!x.read).length,plannedConnections:runtime.exportState().connections.filter(x=>x.status==="planned").length,policy:data.policies.find(x=>x.id==="default-deny")};}
  function exportState(){return {...read(),exportedAt:now()};}
  function importState(payload){
    if(!payload||payload.schema!==ORCHESTRATOR_SCHEMA||!Array.isArray(payload.capabilities)||!Array.isArray(payload.tasks)||!Array.isArray(payload.messages)||!Array.isArray(payload.policies))throw new TypeError("Backup do orquestrador inválido.");
    for(const cap of payload.capabilities)if(!runtime.getApp(cap.appId))throw new Error("Backup referencia um app inexistente: "+cap.appId);
    return write({schema:ORCHESTRATOR_SCHEMA,capabilities:clone(payload.capabilities),tasks:clone(payload.tasks),messages:clone(payload.messages),policies:clone(payload.policies),sequence:Number.isInteger(payload.sequence)?payload.sequence:0});
  }
  return Object.freeze({schema:ORCHESTRATOR_SCHEMA,listCapabilities,registerCapability,setCapabilityStatus,listTasks,createTask,transitionTask,listMessages,markMessageRead,dashboard,exportState,importState});
}
export {ORCHESTRATOR_SCHEMA,ORCHESTRATOR_KEY,TASK_STATES};
