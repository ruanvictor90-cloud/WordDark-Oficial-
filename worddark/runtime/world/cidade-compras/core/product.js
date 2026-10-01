export function createProduct({id,name,price,currency="BRL",supplierIds=[],active=true}) {
  if (!id || !name || Number(price) < 0) throw new Error("INVALID_PRODUCT");
  return {id,name,price,currency,supplierIds,active};
}
