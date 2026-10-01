export function createSupplier({id,name,channels=[],active=true}) {
  if (!id || !name) throw new Error("INVALID_SUPPLIER");
  return {id,name,channels,active};
}
