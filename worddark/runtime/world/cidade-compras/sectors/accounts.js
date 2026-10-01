export const ACCOUNT_OPERATIONS = Object.freeze(["CHARGE","RECEIVE","REFUND","PAYOUT","RECONCILE"]);

export function createAccountOperation({ id, type, orderId, amount, currency = "BRL" }) {
  if (!id || !ACCOUNT_OPERATIONS.includes(type) || !orderId || amount == null || amount < 0) {
    throw new Error("INVALID_ACCOUNT_OPERATION");
  }

  return {
    id,
    type,
    orderId,
    amount,
    currency,
    status: "PENDING",
    history: [{ status: "PENDING", at: new Date().toISOString() }]
  };
}

export function settleAccountOperation(operation) {
  if (!operation || operation.status !== "PENDING") throw new Error("ACCOUNT_NOT_READY_FOR_SETTLEMENT");

  return {
    ...operation,
    status: "SETTLED",
    history: [
      ...operation.history,
      { status: "SETTLED", at: new Date().toISOString() }
    ]
  };
}

export function refundAccountOperation(operation, note = "Reembolso financeiro vinculado ao pedido.") {
  if (!operation || operation.status !== "SETTLED") {
    throw new Error("ACCOUNT_NOT_READY_FOR_REFUND");
  }

  return {
    ...operation,
    type: "REFUND",
    status: "REFUNDED",
    history: [
      ...operation.history,
      { status: "REFUNDED", note, at: new Date().toISOString() }
    ]
  };
}
