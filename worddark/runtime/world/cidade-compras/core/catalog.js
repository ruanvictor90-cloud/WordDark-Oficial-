export function createCatalog({id,name="Catálogo",productIds=[],active=true}){
  if(!id)throw new Error("INVALID_CATALOG");
  return{id,name,productIds:[...productIds],active,history:[{event:"CATALOG_CREATED",at:new Date().toISOString()}]};
}

export function addProductToCatalog(catalog,productId){
  if(!catalog||!productId)throw new Error("INVALID_CATALOG_ITEM");
  if(catalog.productIds.includes(productId))return catalog;
  return{...catalog,productIds:[...catalog.productIds,productId],history:[...catalog.history,{event:"PRODUCT_ADDED",productId,at:new Date().toISOString()}]};
}

export function removeProductFromCatalog(catalog,productId){
  if(!catalog)throw new Error("INVALID_CATALOG");
  return{...catalog,productIds:catalog.productIds.filter(id=>id!==productId),history:[...catalog.history,{event:"PRODUCT_REMOVED",productId,at:new Date().toISOString()}]};
}