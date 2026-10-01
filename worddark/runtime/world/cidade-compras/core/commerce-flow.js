import { createCommerceOperation, transitionOperation } from "./commerce-operation.js";
import { linkOperationResource } from "./operation-link.js";
import { transitionOrder } from "./order-lifecycle.js";
import { createOrder } from "./order.js";
import { createCart, addCartItem, setCartShipping, setCartDiscount, closeCart } from "./cart.js";
import { createAccountOperation, settleAccountOperation } from "./account.js";
import { createServiceResult, deliverServiceResult } from "./service-result.js";

export function startCommerceFlow({ operationId, customerId, orderId, source }) {
  const operation = createCommerceOperation({
    id: operationId,
    type: "PURCHASE",
    source,
    customerId,
    orderId
  });
  return transitionOperation(operation, "FLOW_STARTED");
}

export function attachFlowResource(operation, type, id) {
  return linkOperationResource(operation, type, id);
}

export function advanceOrder(order, nextStatus, note = null) {
  return transitionOrder(order, nextStatus, note);
}

/**
 * Orquestra o checkout sem absorver a responsabilidade dos setores.
 * Cada objeto continua pertencendo ao seu próprio módulo; a operação
 * apenas registra as conexões entre eles.
 */
export function runCommerceCheckout({
  operationId,
  customerId,
  orderId,
  source,
  channelId,
  cartId,
  items,
  shipping = 0,
  discount = 0,
  accountId,
  serviceResultId = null,
  serviceRequestId = null,
  service = null,
  servicePayload = {}
}) {
  if (!operationId || !customerId || !orderId || !source || !channelId || !cartId || !accountId) {
    throw new Error("INVALID_COMMERCE_CHECKOUT");
  }

  if (!Array.isArray(items) || !items.length) {
    throw new Error("CHECKOUT_ITEMS_REQUIRED");
  }

  if (shipping < 0 || discount < 0) {
    throw new Error("CHECKOUT_ADJUSTMENT_INVALID");
  }

  let cart = createCart({ id: cartId, customerId });

  for (const item of items) {
    cart = addCartItem(cart, item);
  }

  cart = setCartShipping(cart, shipping);
  cart = setCartDiscount(cart, discount);
  cart = closeCart(cart);

  let order = createOrder({
    id: orderId,
    customerId,
    channelId,
    items: cart.items,
    total: cart.totals.total
  });

  let operation = startCommerceFlow({
    operationId,
    customerId,
    orderId,
    source
  });

  operation = attachFlowResource(operation, "CART", cart.id);
  operation = transitionOperation(operation, "CART_READY");

  order = transitionOrder(order, "AWAITING_PAYMENT");
  operation = transitionOperation(operation, "ORDER_AWAITING_PAYMENT");

  const account = settleAccountOperation(
    createAccountOperation({
      id: accountId,
      orderId: order.id,
      type: "CHARGE",
      amount: order.total
    })
  );

  order = transitionOrder(order, "PAID");
  order = transitionOrder(order, "VALIDATING");

  operation = attachFlowResource(operation, "ORDER", order.id);
  operation = attachFlowResource(operation, "ACCOUNT", account.id);
  operation = transitionOperation(operation, "PAYMENT_SETTLED");

  let serviceResult = null;

  if (service || serviceResultId || serviceRequestId) {
    if (!service || !serviceResultId || !serviceRequestId) {
      throw new Error("INCOMPLETE_SERVICE_RESULT");
    }

    serviceResult = deliverServiceResult(
      createServiceResult({
        id: serviceResultId,
        requestId: serviceRequestId,
        service,
        status: "READY",
        payload: servicePayload
      })
    );

    operation = attachFlowResource(operation, "SERVICE_RESULT", serviceResult.id);
    operation = transitionOperation(operation, "SERVICE_RESULT_RECEIVED");
  }

  return {
    operation,
    cart,
    order,
    account,
    serviceResult
  };
}
