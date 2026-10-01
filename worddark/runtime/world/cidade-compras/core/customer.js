export function createCustomer({id,name,contacts=[],addresses=[]}) {
  if (!id || !name) throw new Error("INVALID_CUSTOMER");
  return {id,name,contacts,addresses,history:[]};
}
