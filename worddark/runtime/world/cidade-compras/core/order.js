export const ORDER_STATUS = Object.freeze(["DRAFT","AWAITING_PAYMENT","PAID","VALIDATING","SENT_TO_SUPPLIER","SUPPLIER_CONFIRMED","SHIPPED","DELIVERED","CANCELLED","REFUNDED","INCIDENT"]);
export function createOrder({id,customerId,channelId,items,total,currency="BRL"}) {
  if (!id || !customerId || !channelId || !Array.isArray(items) || !items.length) throw new Error("INVALID_ORDER");
  return {id,customerId,channelId,items,total,currency,status:"DRAFT",supplierOrderId:null,shipmentId:null,history:[]};
}
