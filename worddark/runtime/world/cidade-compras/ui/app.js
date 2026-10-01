import { runRealCommerceTest, deliverRealCommerceTest, runIncidentStep, openRealAfterSales, advanceRealAfterSales, createRuntimeTimeline, runRealMarketingTest, returnRealMarketingTest } from "./runtime-adapter.js";

const sectors=[
{id:"communication",icon:"💬",name:"Comunicação",desc:"Site, redes sociais, mensageria, marketplaces e futuros canais."},
{id:"attendance",icon:"🤖",name:"Atendimento",desc:"Identifica cliente e intenção, responde e encaminha a operação."},
{id:"commerce",icon:"🛒",name:"Comércio",desc:"Produtos, carrinhos, sessões e pedidos."},
{id:"accounts",icon:"🧾",name:"Central de Contas",desc:"Cobrança, recebimento, reembolso e conciliação."},
{id:"marketing",icon:"📣",name:"Marketing",desc:"Organiza necessidades de conteúdo e acompanha distribuição."},
{id:"suppliers",icon:"🏭",name:"Fornecedores",desc:"Pedidos de fornecimento e confirmação."},
{id:"logistics",icon:"🚚",name:"Logística",desc:"Envio, rastreio e exceções de entrega."},
{id:"after-sales",icon:"🔄",name:"Pós-venda",desc:"Rastreio, troca, reembolso, suporte e feedback."},
{id:"incidents",icon:"⚠️",name:"Ocorrências",desc:"Análise, resolução, cancelamento e reentrada."},
{id:"library",icon:"📚",name:"Biblioteca",desc:"Registros, aprendizados e histórico durável."}
];

const details={
communication:["Responsabilidade","Canal é a porta. A operação continua sendo central.","Canais","SITE · SOCIAL · MESSAGING · MARKETPLACE · OTHER"],
attendance:["Responsabilidade","Identificar cliente → intenção → catálogo → resposta → carrinho → pedido.","Regra","Pode encaminhar para humano sem perder a origem."],
commerce:["Responsabilidade","O pedido é a entidade central do ciclo comercial.","Fluxo","Carrinho → pagamento → pedido → fornecedor → logística → pós-venda."],
accounts:["Responsabilidade","A Central de Contas concentra operações financeiras da cidade.","Operações","CHARGE · RECEIVE · REFUND · PAYOUT · RECONCILE"],
marketing:["Responsabilidade","Recebe a necessidade comercial e organiza o trabalho de conteúdo.","Conexão","MARKETING → DARK FACTORY → MARKETING → CHANNEL"],
suppliers:["Responsabilidade","A cidade solicita fornecimento sem ficar presa a um fornecedor específico.","Regra","Pedido ao fornecedor mantém estado e histórico."],
logistics:["Responsabilidade","Acompanha a entrega sem assumir a responsabilidade comercial do pedido.","Estados","PENDING → LABEL → IN TRANSIT → DELIVERY → EXCEPTION"],
"after-sales":["Responsabilidade","Continua ligado ao pedido e ao cliente.","Tipos","TRACKING · EXCHANGE · REFUND · SUPPORT · FEEDBACK"],
incidents:["Responsabilidade","Preserva histórico e pode reencaminhar a operação.","Estados","OPEN → ANALYZING → RESOLVED / CANCELLED / REQUEUED"],
library:["Responsabilidade","Guarda conhecimento operacional e aprendizados.","Regra","Nada precisa desaparecer para uma versão nova existir."]
};

const state={orders:[],communications:[],incidents:[],services:[],events:[]};
const grid=document.querySelector("#sectorGrid"),home=document.querySelector("#home"),sector=document.querySelector("#sector");
const now=()=>new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
const uid=(prefix)=>prefix+"-"+String(Date.now()).slice(-6);

function log(event,detail){state.events.unshift({event,detail,at:now()});renderSummary();}

function renderSummary(){
 document.querySelector("#pendingOrders").textContent=state.orders.filter(o=>!["DELIVERED","CANCELLED","REFUNDED"].includes(o.status)).length;
 document.querySelector("#pendingComms").textContent=state.communications.filter(c=>c.status==="OPEN").length;
 document.querySelector("#openIncidents").textContent=state.incidents.filter(i=>!["RESOLVED","CANCELLED"].includes(i.status)).length;
}

function createDemoOrder(){
 const order={id:uid("WD-ORD"),customer:"Cliente de teste",channel:"SOCIAL",total:129.90,status:"PAID",createdAt:now()};
 state.orders.unshift(order);
 log("ORDER_CREATED",order.id);
 openSector(sectors.find(s=>s.id==="commerce"),true);
}

function createDemoIncident(){
 const order=state.orders[0];
 const incident={id:uid("WD-ERR"),orderId:order?.id||"SEM-PEDIDO",type:"DELIVERY_EXCEPTION",status:"OPEN",description:"Ocorrência de teste da central."};
 state.incidents.unshift(incident);
 if(order) order.status="INCIDENT";
 log("INCIDENT_OPEN",incident.id);
 openSector(sectors.find(s=>s.id==="incidents"),true);
}

function requestMarketing(){
 const service={id:uid("WD-SVC"),service:"MARKETING",status:"REQUESTED",purpose:"Criar peça de conteúdo para canal comercial."};
 state.services.unshift(service);
 log("SERVICE_REQUESTED",service.id);
 openSector(sectors.find(s=>s.id==="marketing"),true);
}

function createSectorBody(id){
 const d=details[id];
 let html=`<div class="info-card"><strong>${d[0]}</strong><span>${d[1]}</span></div><div class="info-card"><strong>${d[2]}</strong><span>${d[3]}</span></div>`;
 if(id==="commerce") html+=`<div class="operation-card"><div><span class="eyebrow">OPERAÇÃO LOCAL</span><strong>Simulador de pedido</strong><small>Cria um registro de teste apenas nesta interface.</small></div><button class="primary" id="demoOrder">Criar pedido de teste</button></div><div id="orderList" class="operation-list">${renderOrders()}</div>`;
 if(id==="incidents") html+=`<div class="operation-card"><div><span class="eyebrow">RECUPERAÇÃO</span><strong>Central de ocorrências</strong><small>Abre uma ocorrência vinculada ao último pedido disponível.</small></div><button class="danger" id="demoIncident">Abrir ocorrência</button></div><div id="incidentList" class="operation-list">${renderIncidents()}</div>`;
 if(id==="marketing") html+=`<div class="operation-card"><div><span class="eyebrow">RODOVIA → CÉU</span><strong>Solicitar Marketing</strong><small>Representa uma solicitação que seguirá para o serviço externo.</small></div><button class="primary" id="demoMarketing">Solicitar serviço</button></div><div id="serviceList" class="operation-list">${renderServices()}</div>`;
 if(id==="library") html+=`<div class="operation-list">${state.events.length?state.events.slice(0,8).map(e=>`<div class="event"><span>${e.event}</span><small>${e.detail} · ${e.at}</small></div>`).join(""):"<div class='empty'>Nenhum evento registrado nesta sessão.</div>"}</div>`;
 return html;
}

function renderOrders(){return state.orders.length?state.orders.slice(0,5).map(o=>`<div class="event"><span>${o.id} · ${o.status}</span><small>${o.channel} · R$ ${o.total.toFixed(2).replace(".",",")}</small></div>`).join(""):"<div class='empty'>Nenhum pedido nesta sessão.</div>"}
function renderIncidents(){return state.incidents.length?state.incidents.slice(0,5).map(i=>`<div class="event"><span>${i.id} · ${i.status}</span><small>${i.type} · pedido ${i.orderId}</small></div>`).join(""):"<div class='empty'>Nenhuma ocorrência nesta sessão.</div>"}
function renderServices(){return state.services.length?state.services.slice(0,5).map(s=>`<div class="event"><span>${s.id} · ${s.status}</span><small>${s.service} · ${s.purpose}</small></div>`).join(""):"<div class='empty'>Nenhuma solicitação nesta sessão.</div>"}

function renderRealIncident(){
  const list=document.querySelector("#realIncidentList");
  if(!list||!runtimeState.incident)return;
  const i=runtimeState.incident.incident;
  const order=runtimeState.incident.order;
  const actions={OPEN:"Abrir ocorrência",ANALYZE:"Analisar",REQUEUE:"Reencaminhar",REANALYZE:"Voltar à análise",RESUME:"Liberar pedido",REFUND:"Reembolsar",CANCEL:"Cancelar pedido"};
  const available=[];
  if(i.status==="OPEN") available.push("ANALYZE","CANCEL");
  if(i.status==="ANALYZING") available.push("REQUEUE","RESUME","REFUND","CANCEL");
  if(i.status==="REQUEUED") available.push("REANALYZE","CANCEL");
  list.innerHTML=`<div class="event"><span>${i.id} · ${i.status}</span><small>Pedido: ${order?.id||"—"}</small></div><div class="incident-actions">${available.map(a=>`<button class="secondary" data-incident-action="${a}" type="button">${actions[a]}</button>`).join("")}</div>`;
  list.querySelectorAll("[data-incident-action]").forEach(b=>b.onclick=()=>runRealIncidentAction(b.dataset.incidentAction));
}
function runRealIncidentAction(action){
  try{
    runtimeState.incident=runIncidentStep(action,runtimeState.incident);
    log("INCIDENT_"+action,runtimeState.incident.incident?.id||"—");
    renderRealIncident();
    if(runtimeState.incident.order){
      const found=state.orders.find(o=>o.id===runtimeState.incident.order.id);
      if(found) found.status=runtimeState.incident.order.status;
    }
    renderSummary();
  }catch(error){
    log("INCIDENT_ERROR",error?.message||"UNKNOWN_ERROR");
    const list=document.querySelector("#realIncidentList");
    if(list) list.innerHTML=`<div class="empty">Falha na ocorrência: ${error?.message||"erro desconhecido"}</div>`;
  }
}

function injectAfterSalesControls(){
  const body=document.querySelector("#sectorBody"); if(!body||document.querySelector("#realAfterSalesPanel"))return;
  const panel=document.createElement("div"); panel.id="realAfterSalesPanel"; panel.className="runtime-panel";
  panel.innerHTML=`<div><span class="eyebrow">PÓS-VENDA · RUNTIME REAL</span><strong>Atendimento vinculado ao pedido</strong><small>Abre um caso real no runtime e permite iniciar o atendimento sem perder o vínculo com cliente e pedido.</small></div><div class="runtime-actions"><button class="secondary" id="realAfterSalesOpen" type="button">Abrir pós-venda</button><button class="secondary" id="realAfterSalesAdvance" type="button">Iniciar atendimento</button></div><div id="realAfterSalesList" class="runtime-results"></div>`;
  body.appendChild(panel);
  const render=()=>{
    const list=document.querySelector("#realAfterSalesList"); if(!list)return;
    const a=runtimeState.afterSales?.afterSales;
    if(!a){list.innerHTML=`<div class="empty">Execute primeiro um fluxo real de comércio e confirme a entrega.</div>`;return;}
    list.innerHTML=`<div class="event"><span>${a.id} · ${a.status}</span><small>${a.type} · pedido ${a.orderId}</small></div>`;
  };
  document.querySelector("#realAfterSalesOpen").onclick=()=>{
    try{
      const latest=runtimeState.results[0]; if(!latest||latest.order?.status!=="DELIVERED")throw new Error("ORDER_MUST_BE_DELIVERED");
      runtimeState.afterSales=openRealAfterSales(latest,{type:"SUPPORT",description:"Cliente abriu atendimento após entrega."});
      log("AFTER_SALES_RUNTIME_OPEN",runtimeState.afterSales.afterSales.id); render();
    }catch(error){log("AFTER_SALES_ERROR",error?.message||"UNKNOWN_ERROR");render();}
  };
  document.querySelector("#realAfterSalesAdvance").onclick=()=>{
    try{
      runtimeState.afterSales=advanceRealAfterSales(runtimeState.afterSales);
      log("AFTER_SALES_RUNTIME_STARTED",runtimeState.afterSales.afterSales.id); render();
    }catch(error){log("AFTER_SALES_ERROR",error?.message||"UNKNOWN_ERROR");render();}
  };
  render();
}

function injectIncidentControls(){
  const body=document.querySelector("#sectorBody"); if(!body||document.querySelector("#realIncidentPanel"))return;
  const panel=document.createElement("div"); panel.id="realIncidentPanel"; panel.className="runtime-panel";
  panel.innerHTML=`<div><span class="eyebrow">OCORRÊNCIA · RUNTIME REAL</span><strong>Ciclo de recuperação do pedido</strong><small>Abre e encaminha uma ocorrência usando o runtime da cidade, com decisão final sobre o pedido.</small></div><button class="danger" id="realIncidentOpen" type="button">Abrir ocorrência real</button><div id="realIncidentList" class="runtime-results"></div>`;
  body.appendChild(panel);
  document.querySelector("#realIncidentOpen").onclick=()=>{
    try{
      const latest=runtimeState.results[0]; if(!latest)throw new Error("RUN_REAL_COMMERCE_FIRST");
      runtimeState.incident=runIncidentStep("OPEN",{operation:latest.operation,order:latest.order,account:latest.account,incident:null});
      log("INCIDENT_RUNTIME_OPEN",runtimeState.incident.incident.id);
      renderRealIncident();
    }catch(error){
      log("INCIDENT_ERROR",error?.message||"UNKNOWN_ERROR");
      const list=document.querySelector("#realIncidentList"); if(list) list.innerHTML=`<div class="empty">Execute primeiro um fluxo real de comércio.</div>`;
    }
  };
}

function bindSectorActions(){
 const orderBtn=document.querySelector("#demoOrder"); if(orderBtn) orderBtn.onclick=createDemoOrder;
 const incidentBtn=document.querySelector("#demoIncident"); if(incidentBtn) incidentBtn.onclick=createDemoIncident;
 const marketingBtn=document.querySelector("#demoMarketing"); if(marketingBtn) marketingBtn.onclick=requestMarketing;
}

function openSector(s,refresh=false){
 document.querySelector("#sectorIcon").textContent=s.icon;
 document.querySelector("#sectorName").textContent=s.name;
 document.querySelector("#sectorDescription").textContent=s.desc;
 document.querySelector("#sectorBody").innerHTML=createSectorBody(s.id);
 home.classList.remove("active"); sector.classList.add("active");
 if(!refresh) history.replaceState(null,"","#"+s.id);
 bindSectorActions();
}

sectors.forEach(s=>{
 const b=document.createElement("button");
 b.className="sector-btn";
 b.innerHTML=`<span class="sector-icon">${s.icon}</span><strong>${s.name}</strong><small>Entrar no setor →</small>`;
 b.onclick=()=>openSector(s);
 grid.appendChild(b);
});

document.querySelector("#backBtn").onclick=()=>{
 sector.classList.remove("active");home.classList.add("active");history.replaceState(null,"","#");renderSummary();
};
document.querySelector("#themeToggle").onclick=()=>document.body.classList.toggle("light");
renderSummary();

const runtimeState={results:[], incident:null, afterSales:null, marketing:null};

function renderRuntimeResult(result,add=true){
  if(add) runtimeState.results.unshift(result);
  const list=document.querySelector("#runtimeList");
  if(!list)return;
  const timeline=createRuntimeTimeline(result);
  list.innerHTML=runtimeState.results.slice(0,3).map((r,index)=>{
    const order=r.order?.id||"—";
    const status=r.order?.status||"—";
    const steps=createRuntimeTimeline(r).map(([name,state])=>`<div class="runtime-step"><span>${name}</span><b>${state}</b></div>`).join("");
    return `<div class="runtime-result"><div class="runtime-head"><div><span class="eyebrow">RUNTIME REAL · TESTE #${runtimeState.results.length-index}</span><strong>${order}</strong></div><span class="runtime-status">${status}</span></div><div class="runtime-timeline">${steps}</div></div>`;
  }).join("");
}

function runRuntimeTest(){
  const button=document.querySelector("#realRuntime");
  if(button) button.disabled=true;
  try{
    const result=runRealCommerceTest();
    const order={id:result.order.id,customer:"Cliente runtime",channel:"SOCIAL",total:result.order.total,status:result.order.status,createdAt:now()};
    state.orders.unshift(order);
    log("RUNTIME_COMPLETED",result.operationId);
    renderRuntimeResult(result);
    openSector(sectors.find(s=>s.id==="commerce"),true);
  }catch(error){
    log("RUNTIME_ERROR",error?.message||"UNKNOWN_ERROR");
    const list=document.querySelector("#runtimeList");
    if(list) list.innerHTML=`<div class="empty">Falha no runtime: ${error?.message||"erro desconhecido"}</div>`;
  }finally{
    if(button) button.disabled=false;
  }
}

function deliverRuntimeTest(){
  const latest=runtimeState.results[0];
  if(!latest) throw new Error("RUN_REAL_COMMERCE_FIRST");
  const delivered=deliverRealCommerceTest(latest);
  latest.operation=delivered.operation;
  latest.order=delivered.order;
  latest.shipment=delivered.shipment;
  const found=state.orders.find(o=>o.id===latest.order.id);
  if(found) found.status=latest.order.status;
  log("RUNTIME_DELIVERED",latest.order.id);
  renderRuntimeResult(latest,false);
  openSector(sectors.find(s=>s.id==="commerce"),true);
}

function injectRuntimeControls(){
  const body=document.querySelector("#sectorBody");
  if(!body)return;
  const existing=document.querySelector("#runtimePanel");
  if(existing) return;
  const panel=document.createElement("div");
  panel.id="runtimePanel";
  panel.className="runtime-panel";
  panel.innerHTML=`<div><span class="eyebrow">CÉU → TERRA · RUNTIME</span><strong>Executar fluxo real da Cidade</strong><small>Agora a interface chama o runtime.js da própria Cidade de Compras. Os registros continuam locais ao navegador.</small></div><div class="runtime-actions"><button class="primary" id="realRuntime" type="button">Executar fluxo real</button><button class="secondary" id="realDelivery" type="button">Confirmar entrega</button></div><div id="runtimeList" class="runtime-results"></div>`;
  body.appendChild(panel);
  document.querySelector("#realRuntime").onclick=runRuntimeTest;
  document.querySelector("#realDelivery").onclick=()=>{try{deliverRuntimeTest();}catch(error){log("DELIVERY_ERROR",error?.message||"UNKNOWN_ERROR");const list=document.querySelector("#runtimeList");if(list)list.innerHTML=`<div class="empty">Falha na entrega: ${error?.message||"erro desconhecido"}</div>`;}};
}

const originalOpenSector=openSector;
openSector=function(s,refresh=false){
  originalOpenSector(s,refresh);
  if(s.id==="commerce") injectRuntimeControls();
  if(s.id==="after-sales") injectAfterSalesControls();
  if(s.id==="incidents") injectIncidentControls();
};


function injectMarketingControls(){
  const body=document.querySelector("#sectorBody");
  if(!body||document.querySelector("#realMarketingPanel"))return;
  const panel=document.createElement("div"); panel.id="realMarketingPanel"; panel.className="runtime-panel";
  panel.innerHTML=`<div><span class="eyebrow">RODOVIA → CÉU · RUNTIME REAL</span><strong>Conectar Marketing à Dark Factory</strong><small>A cidade cria a necessidade, envia pela Rodovia ao Céu e recebe o resultado de volta. A fábrica continua externa à cidade.</small></div><div class="runtime-actions"><button class="primary" id="realMarketingRequest" type="button">Solicitar conteúdo</button><button class="secondary" id="realMarketingReturn" type="button">Simular retorno da fábrica</button></div><div id="realMarketingList" class="runtime-results"></div>`;
  body.appendChild(panel);
  const render=()=>{
    const list=document.querySelector("#realMarketingList"); if(!list)return;
    const m=runtimeState.marketing?.marketingRequest, s=runtimeState.marketing?.serviceRequest;
    if(!m){list.innerHTML=`<div class="empty">Nenhuma solicitação de Marketing nesta sessão.</div>`;return;}
    list.innerHTML=`<div class="event"><span>${m.id} · ${m.status}</span><small>Serviço: ${s?.service||"MARKETING"} · Rota: ${runtimeState.marketing.route?.join(" → ")||"—"}</small></div>`;
  };
  document.querySelector("#realMarketingRequest").onclick=()=>{
    try{ runtimeState.marketing=runRealMarketingTest(); log("MARKETING_SENT_TO_FACTORY",runtimeState.marketing.marketingRequest.id); render(); }
    catch(error){ log("MARKETING_ERROR",error?.message||"UNKNOWN_ERROR"); render(); }
  };
  document.querySelector("#realMarketingReturn").onclick=()=>{
    try{ runtimeState.marketing=returnRealMarketingTest(runtimeState.marketing); log("MARKETING_RESULT_RETURNED",runtimeState.marketing.marketingRequest.resultId); render(); }
    catch(error){ log("MARKETING_ERROR",error?.message||"UNKNOWN_ERROR"); render(); }
  };
  render();
}
const previousOpenSectorForMarketing=openSector;
openSector=function(s,refresh=false){
  previousOpenSectorForMarketing(s,refresh);
  if(s.id==="marketing") injectMarketingControls();
};
