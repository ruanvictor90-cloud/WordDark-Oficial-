const clean=(v,f)=>{if(typeof v!=="string"||!v.trim())throw TypeError(f+" obrigatÃ³rio");return v.trim()};
const copy=v=>JSON.parse(JSON.stringify(v??{}));
function createCommercialEngine({now=()=>new Date().toISOString(),idFactory=()=>Math.random().toString(36).slice(2,9)}={}){
 const catalog=new Map(),leads=new Map(),proposals=new Map(),orders=new Map(),audit=[];
 const id=p=>p+"-"+idFactory(),rec=(event,data)=>audit.push({event,at:now(),data:copy(data)}),list=m=>[...m.values()].map(copy);
 function addOffer(x={}){const itemId=x.itemId||id("offer"),price=x.price==null?null:Number(x.price);if(catalog.has(itemId))throw Error("Oferta duplicada");if(price!==null&&(!Number.isFinite(price)||price<0))throw TypeError("PreÃ§o invÃ¡lido");const o={itemId,name:clean(x.name,"Nome"),category:clean(x.category,"Categoria"),price,currency:x.currency||"BRL",recurrence:x.recurrence||"ONE_TIME",active:x.active!==false};catalog.set(itemId,o);rec("OFFER_ADDED",o);return copy(o)}
 function createLead(x={}){const leadId=x.leadId||id("lead");if(leads.has(leadId))throw Error("Contato duplicado");const l={leadId,requesterId:clean(x.requesterId,"Solicitante"),name:clean(x.name,"Contato"),need:clean(x.need,"Necessidade"),category:clean(x.category,"Categoria"),budget:x.budget??null,recurrence:x.recurrence||"ONE_TIME",status:"NEW",createdAt:now()};leads.set(leadId,l);rec("LEAD_CREATED",l);return copy(l)}
 function qualify(leadId,actorId){const l=leads.get(leadId);if(!l||l.status!=="NEW")throw Error("Contato nÃ£o estÃ¡ novo");l.status="QUALIFIED";l.actorId=clean(actorId,"ResponsÃ¡vel");rec("LEAD_QUALIFIED",l);return copy(l)}
 function propose(x={}){const l=leads.get(x.leadId);if(!l||l.status!=="QUALIFIED")throw Error("Contato precisa ser qualificado");const amount=Number(x.amount);if(!Number.isFinite(amount)||amount<0)throw TypeError("Valor invC¡lido");const proposalId=x.proposalId||id("proposal");if(proposals.has(proposalId))throw Error("Proposta duplicada");const p={proposalId,companyId:"commercial",sectorId:"earth",leadId:l.leadId,requesterId:l.requesterId,title:clean(x.title,"TÃ­tulo"),scope:clean(x.scope,"Escopo"),amount,currency:x.currency||"BRL",recurrence:x.recurrence||l.recurrence,status:"SENT",customerDecisionRequired:true,paymentEnabled:false,externalExecutionEnabled:false,createdAt:now()};proposals.set(proposalId,p);l.status="PROPOSAL_SENT";rec("PROPOSAL_SENT",p);return copy(p)}
 function decide(proposalId,decision,actorId){const p=proposals.get(proposalId);if(!p||p.status!=="SENT"||!["ACCEPTED","DECLINED"].includes(decision))throw Error("DecisÃ£o de proposta invÃ¡lida");p.status=decision;p.decidedBy=clean(actorId,"ResponsÃ¡vel");p.decidedAt=now();rec("PROPOSAL_DECIDED",p);return copy(p)}
 function openOrder(proposalId){const p=proposals.get(proposalId);if(!p||p.status!=="ACCEPTED")throw Error("A proposta precisa ser aceita");const orderId=id("order"),o={orderId,proposalId,companyId:"commercial",sectorId:"earth",requesterId:p.requesterId,title:p.title,scope:p.scope,amount:p.amount,currency:p.currency,recurrence:p.recurrence,status:"OPEN",paymentEnabled:false,externalExecutionEnabled:false,createdAt:now()};orders.set(orderId,o);rec("ORDER_OPENED",o);return copy(o)}
 function setOrderStatus(orderId,status,actorId){const o=orders.get(orderId);if(!o||!({OPEN:["PLANNED","CANCELLED"],PLANNED:["IN_PROGRESS","CANCELLED"],IN_PROGRESS:["REVIEW","CANCELLED"],REVIEW:["IN_PROGRESS","COMPLETED","CANCELLED"]}[o.status]||[]).includes(status))throw Error("TransiÃ§Ã£o de pedido invÃ¡lida");o.status=status;o.actorId=clean(actorId,"ResponsÃ¡vel");rec("ORDER_STATUS_CHANGED",o);return copy(o)}
 return Object.freeze({addOffer,createLead,qualify,propose,decide,openOrde‹Ù]Ü™\”Ý]\Ë\ÝÙ™™\œÎŠ
OO›\Ý
Ø][ÙÊK\ÝXYÎŠ
OO›\Ý
XYÊK\Ý›ÜÜØ[ÎŠ
OO›\Ý
›ÜÜØ[ÊK\ÝÜ™\œÎŠ
OO›\Ý
Ü™\œÊK]Y]˜Z[Š
OO˜]Y]›X\
ÛÜJKÝ]\ÎŠ
OOŠÙ[™Ú[™Nˆ•T”WÐÓÓSQTÒPSÐÓÓTS–H‹ÛÛ\[žRYˆ˜ÛÛ[Y\˜ÚX[‹ÙXÝÜ’Yˆ™X\‹Ù™™\œÎ˜Ø][ÙËœÚ^™KXYÎ›XYËœÚ^™K›ÜÜØ[Îœ›ÜÜØ[ËœÚ^™KÜ™\œÎ›Ü™\œËœÚ^™K^[Y[[˜X›Y™˜[ÙK^\›˜[^XÝ][Û‘[˜X›Y™˜[Ù_J_JBŸB›[Ù[K™^ÜÏ^ØÜ™X]PÛÛ[Y\˜ÚX[[™Ú[™_NÂ