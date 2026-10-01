export const FLOW = Object.freeze({
  COMMERCE:["CHANNEL","ATTENDANT","CART","PAYMENT","ORDER","SUPPLIER","SHIPMENT","AFTER_SALES"],
  CONTENT:["COMMERCE","MARKETING","DARK_FACTORY","MARKETING","CHANNEL"]
});
export function getFlow(type){ if(!FLOW[type]) throw new Error("UNKNOWN_FLOW"); return [...FLOW[type]]; }