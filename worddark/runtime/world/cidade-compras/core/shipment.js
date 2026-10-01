export const SHIPMENT_STATUS = Object.freeze(["PENDING","LABEL_CREATED","IN_TRANSIT","OUT_FOR_DELIVERY","DELIVERED","EXCEPTION"]);
export function createShipment({id,orderId,carrier=null,trackingCode=null}) {
  if (!id || !orderId) throw new Error("INVALID_SHIPMENT");
  return {id,orderId,carrier,trackingCode,status:"PENDING",events:[]};
}
