export const COMMUNICATION_CHANNELS = Object.freeze(["SITE","SOCIAL","MESSAGING","MARKETPLACE","OTHER"]);
export function receiveCommunication({ id, channel, customerId = null, message }) {
  if (!id || !COMMUNICATION_CHANNELS.includes(channel) || !message) throw new Error("INVALID_COMMUNICATION");
  return { id, channel, customerId, message, status: "RECEIVED", history: [{ event: "RECEIVED", at: new Date().toISOString() }] };
}
export function handoffCommunication(item, destination) {
  return { ...item, status: "HANDED_OFF", destination, history: [...item.history, { event: "HANDED_OFF", destination, at: new Date().toISOString() }] };
}