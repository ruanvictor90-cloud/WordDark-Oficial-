export function createIncident({id,orderId,type,description}) {
  if (!id || !orderId || !type || !description) throw new Error("INVALID_INCIDENT");
  return {id,orderId,type,description,status:"OPEN",history:[]};
}
