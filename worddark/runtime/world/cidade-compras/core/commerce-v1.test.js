import assert from "node:assert/strict";
import { createCommerceCity, registerChannel } from "./city.js";
import { validateCityContract } from "./city-contract.js";
import { createChannel } from "./channel.js";
import { createCustomerProfile } from "./customer-profile.js";
import { createCatalog, addProductToCatalog } from "./catalog.js";
import { createOrder } from "./order.js";
import { createCart, addCartItem, setCartShipping, setCartDiscount, closeCart } from "./cart.js";
import { transitionOrder } from "./order-lifecycle.js";
import { createAccountOperation, settleAccountOperation } from "./account.js";
import { createAttendant, classifyIntent } from "./attendant.js";
import { createCommunication, appendMessage, closeCommunication } from "./communication.js";
import { startCommerceFlow, attachFlowResource, runCommerceCheckout } from "./commerce-flow.js";
import { createServiceResult, deliverServiceResult } from "./service-result.js";

const city = registerChannel(createCommerceCity({ id: "WD-CITY-COMMERCE" }), "WD-CH-SOCIAL");
assert.equal(validateCityContract(city), true);

const channel = createChannel({ id: "WD-CH-SOCIAL", type: "SOCIAL", name: "Social Test" });
assert.equal(channel.active, true);

const profile = createCustomerProfile({
  id: "WD-PROFILE-TEST",
  customerId: "WD-USR-TEST",
  contacts: [{ type: "EMAIL", value: "test@example.com" }]
});
assert.equal(profile.status, "ACTIVE");

let catalog = createCatalog({ id: "WD-CAT-TEST" });
catalog = addProductToCatalog(catalog, "WD-PROD-1");
assert.deepEqual(catalog.productIds, ["WD-PROD-1"]);

let cart = createCart({ id: "WD-CART-TEST", customerId: "WD-USR-TEST" });
cart = addCartItem(cart, { productId: "WD-PROD-1", quantity: 2, unitPrice: 50 });
cart = setCartShipping(cart, 10);
cart = setCartDiscount(cart, 5);
assert.equal(cart.totals.total, 105);
cart = closeCart(cart);
assert.equal(cart.status, "CHECKOUT");

const attendant = createAttendant({ id: "WD-ATT-TEST", channels: [channel.id] });
assert.equal(classifyIntent("quero rastrear minha entrega"), "TRACKING");
assert.equal(attendant.status, "ACTIVE");

let communication = createCommunication({
  id: "WD-COM-TEST",
  channelId: channel.id,
  customerId: "WD-USR-TEST"
});
communication = appendMessage(communication, {
  id: "WD-MSG-TEST",
  text: "Quero comprar o produto"
});
communication = closeCommunication(communication);
assert.equal(communication.status, "CLOSED");

let order = createOrder({
  id: "WD-ORD-TEST",
  customerId: "WD-USR-TEST",
  channelId: channel.id,
  items: [{ productId: "WD-PROD-1", quantity: 1 }],
  total: 100
});
order = transitionOrder(order, "AWAITING_PAYMENT");
order = transitionOrder(order, "PAID");
order = transitionOrder(order, "VALIDATING");
assert.equal(order.status, "VALIDATING");

const account = settleAccountOperation(
  createAccountOperation({
    id: "WD-ACC-TEST",
    orderId: order.id,
    type: "CHARGE",
    amount: 100
  })
);
assert.equal(account.status, "SETTLED");

let operation = startCommerceFlow({
  operationId: "WD-OP-TEST",
  customerId: "WD-USR-TEST",
  orderId: order.id,
  source: channel.id
});
operation = attachFlowResource(operation, "ORDER", order.id);
assert.deepEqual(operation.resources.ORDER, [order.id]);

const checkout = runCommerceCheckout({
  operationId: "WD-OP-CHECKOUT",
  customerId: "WD-USR-TEST",
  orderId: "WD-ORD-CHECKOUT",
  source: channel.id,
  channelId: channel.id,
  cartId: "WD-CART-CHECKOUT",
  items: [{ productId: "WD-PROD-1", quantity: 2, unitPrice: 50 }],
  shipping: 10,
  discount: 5,
  accountId: "WD-ACC-CHECKOUT",
  serviceResultId: "WD-RES-CHECKOUT",
  serviceRequestId: "WD-SVC-CHECKOUT",
  service: "DARK_FACTORY",
  servicePayload: { asset: "checkout-test" }
});

assert.equal(checkout.cart.status, "CHECKOUT");
assert.equal(checkout.cart.totals.total, 105);
assert.equal(checkout.order.status, "VALIDATING");
assert.equal(checkout.order.total, 105);
assert.equal(checkout.account.status, "SETTLED");
assert.equal(checkout.serviceResult.status, "DELIVERED");
assert.deepEqual(checkout.operation.resources.CART, ["WD-CART-CHECKOUT"]);
assert.deepEqual(checkout.operation.resources.ORDER, ["WD-ORD-CHECKOUT"]);
assert.deepEqual(checkout.operation.resources.ACCOUNT, ["WD-ACC-CHECKOUT"]);
assert.deepEqual(checkout.operation.resources.SERVICE_RESULT, ["WD-RES-CHECKOUT"]);

const result = createServiceResult({
  id: "WD-RES-TEST",
  requestId: "WD-SVC-TEST",
  service: "DARK_FACTORY",
  status: "READY",
  payload: { asset: "test" }
});
assert.equal(deliverServiceResult(result).status, "DELIVERED");

console.log("cidade-compras v1 structural tests: ok");