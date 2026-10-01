export function createCommerceSession({ id, customerId, channel, cartId = null }) {
  if (!id || !customerId || !channel) throw new Error("INVALID_COMMERCE_SESSION");
  return { id, customerId, channel, cartId, status: "OPEN", history: [{ status: "OPEN", at: new Date().toISOString() }] };
}
export function closeCommerceSession(session, reason = "ORDER_CREATED") {
  return { ...session, status: "CLOSED", closeReason: reason, history: [...session.history, { status: "CLOSED", reason, at: new Date().toISOString() }] };
}