export function createSupplierOrder({ id, orderId, supplierId, items = [] }) {
  if (!id || !orderId || !supplierId || !items.length) throw new Error("INVALID_SUPPLIER_ORDER");
  return { id, orderId, supplierId, items, status: "DRAFT", history: [{ status: "DRAFT", at: new Date().toISOString() }] };
}
export function sendSupplierOrder(order) {
  if (order.status !== "DRAFT") throw new Error("SUPPLIER_ORDER_NOT_READY");
  return { ...order, status: "SENT", history: [...order.history, { status: "SENT", at: new Date().toISOString() }] };
}