export function createCart({id,customerId,items=[]}){
  if(!id||!customerId)throw new Error("INVALID_CART");
  return{id,customerId,items, status:"OPEN",currency:"BRL",totals:calculateTotals(items),history:[]};
}

export function addCartItem(cart,{productId,quantity=1,unitPrice=0}){
  if(!cart||cart.status!=="OPEN")throw new Error("CART_CLOSED");
  if(!productId||quantity<=0||unitPrice<0)throw new Error("INVALID_CART_ITEM");
  const item={productId,quantity,unitPrice,total:quantity*unitPrice};
  const items=[...cart.items,item];
  return{...cart,items,totals:calculateTotals(items,cart.totals.shipping,cart.totals.discount),history:[...cart.history,{event:"ITEM_ADDED",productId,at:new Date().toISOString()}]};
}

export function setCartShipping(cart,shipping=0){
  if(!cart||shipping<0)throw new Error("INVALID_SHIPPING");
  return{...cart,totals:calculateTotals(cart.items,shipping,cart.totals.discount)};
}

export function setCartDiscount(cart,discount=0){
  if(!cart||discount<0)throw new Error("INVALID_DISCOUNT");
  return{...cart,totals:calculateTotals(cart.items,cart.totals.shipping,discount)};
}

export function closeCart(cart){
  if(!cart||cart.status!=="OPEN"||!cart.items.length)throw new Error("CART_NOT_READY");
  return{...cart,status:"CHECKOUT",history:[...cart.history,{event:"CART_READY_FOR_CHECKOUT",at:new Date().toISOString()}]};
}

function calculateTotals(items,shipping=0,discount=0){
  const subtotal=items.reduce((sum,item)=>sum+item.total,0);
  return{subtotal,shipping,discount,total:Math.max(0,subtotal+shipping-discount)};
}