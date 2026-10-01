export const INTENTS=Object.freeze(["PRODUCT","PRICE","ORDER","TRACKING","PAYMENT","EXCHANGE","REFUND","HUMAN"]);

export function createAttendant({id,name="Commerce Attendant",channels=[]}){
  if(!id)throw new Error("INVALID_ATTENDANT");
  return{id,name,channels,intents:[...INTENTS],handoffPolicy:"HUMAN_WHEN_REQUIRED",status:"ACTIVE"};
}

export function classifyIntent(message=""){
  const t=message.toLowerCase();
  if(t.includes("rastre")||t.includes("entrega"))return"TRACKING";
  if(t.includes("pagamento")||t.includes("pix")||t.includes("pagar"))return"PAYMENT";
  if(t.includes("troca"))return"EXCHANGE";
  if(t.includes("reembolso")||t.includes("devolver"))return"REFUND";
  if(t.includes("preço")||t.includes("preco")||t.includes("quanto"))return"PRICE";
  if(t.includes("compr")||t.includes("pedido"))return"ORDER";
  if(t.includes("produto"))return"PRODUCT";
  return"HUMAN";
}