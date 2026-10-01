export const CUSTOMER_STATUS=Object.freeze(["ACTIVE","BLOCKED","ARCHIVED"]);

export function createCustomerProfile({id,customerId,contacts=[],addresses=[],preferences={},status="ACTIVE"}){
  if(!id||!customerId)throw new Error("INVALID_CUSTOMER_PROFILE");
  if(!CUSTOMER_STATUS.includes(status))throw new Error("INVALID_CUSTOMER_STATUS");
  return{id,customerId,contacts,addresses,preferences,status,history:[{status,at:new Date().toISOString()}]};
}

export function updateCustomerProfile(profile,patch={}){
  if(!profile)throw new Error("INVALID_CUSTOMER_PROFILE");
  return{...profile,...patch,history:[...profile.history,{event:"PROFILE_UPDATED",at:new Date().toISOString()}]};
}