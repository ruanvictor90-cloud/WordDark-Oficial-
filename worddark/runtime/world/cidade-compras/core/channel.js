export const CHANNEL_TYPES = Object.freeze(["SITE","SOCIAL","MESSAGING","MARKETPLACE","OTHER"]);
export function createChannel({id,name,type,platform=null,active=true}) {
  if (!id || !name || !CHANNEL_TYPES.includes(type)) throw new Error("INVALID_CHANNEL");
  return {id,name,type,platform,active};
}
