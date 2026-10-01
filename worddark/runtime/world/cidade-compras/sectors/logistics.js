export const SHIPMENT_STATES = Object.freeze(["PENDING","LABEL_CREATED","IN_TRANSIT","OUT_FOR_DELIVERY","DELIVERED","EXCEPTION"]);
export function createShipment({ id, orderId, carrier = null, trackingCode = null }) {
  if (!id || !orderId) throw new Error("INVALID_SHIPMENT");
  return { id, orderId, carrier, trackingCode, status: "PENDING", history: [{ status: "PENDING", at: new Date().toISOString() }] };
}
export function updateShipment(shipment, status, trackingCode = shipment.trackingCode) {
  if (!SHIPMENT_STATES.includes(status)) throw new Error("INVALID_SHIPMENT_STATUS");
  return { ...shipment, status, trackingCode, history: [...shipment.history, { status, trackingCode, at: new Date().toISOString() }] };
}