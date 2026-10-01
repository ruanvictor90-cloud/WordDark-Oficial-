export const SUPPLIER_ORDER_STATUS = Object.freeze(["DRAFT","SENT","CONFIRMED","REJECTED","CANCELLED"]);
export function createSupplierOrder({id,orderId,supplierId,items=[]}) {
  if (!id || !orderId || !supplierId || !items.length) throw new Error("INVALID_SUPPLIER_ORDER");
  return {id,orderId,supplierId,items,status:"DRAFT",externalReference:null,history:[]};
}
