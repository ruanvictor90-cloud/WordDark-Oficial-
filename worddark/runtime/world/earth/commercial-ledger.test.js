import assert from "node:assert/strict";
import { createCommercialLedger } from "./commercial-ledger.js";

let tick = 0;
const ledger = createCommercialLedger({ now: () => "2026-10-14T00:00:" + String(tick++).padStart(2, "0") + ".000Z" });

assert.throws(() => ledger.registerContract({ contractId: "c0", orderId: "o0", amount: 80, approvalRef: "chat" }), /Aceite explícito/);
ledger.registerContract({ contractId: "c1", orderId: "order-1", amount: 100, approvalRef: "cliente-aceitou-1", customerAccepted: true });
assert.throws(() => ledger.registerContract({ contractId: "c1", orderId: "order-1", amount: 100, approvalRef: "ref", customerAccepted: true }), /duplicado/);
ledger.issueInvoice({ invoiceId: "i1", contractId: "c1", amount: 60, reference: "fatura-rascunho-1" });
assert.throws(() => ledger.issueInvoice({ invoiceId: "i2", contractId: "c1", amount: 41, reference: "fatura-rascunho-2" }), /excede o contrato/);
ledger.recordReceipt({ receiptId: "r1", invoiceId: "i1", amount: 25, proofRef: "comprovante conferido pelo operador" });
assert.throws(() => ledger.recordReceipt({ receiptId: "r2", invoiceId: "i1", amount: 36, proofRef: "ref" }), /excede o valor faturado/);
assert.throws(() => ledger.recordReceipt({ receiptId: "r1", invoiceId: "i1", amount: 1, proofRef: "ref" }), /duplicado/);
ledger.recordExpense({ expenseId: "e1", orderId: "order-1", amount: 5.5, category: "ferramenta", description: "Custo de produção", proofRef: "recibo-1" });
const report = ledger.summary();
assert.equal(report.contractedAmount, 100);
assert.equal(report.invoicedAmount, 60);
assert.equal(report.receivedAmount, 25);
assert.equal(report.expenseAmount, 5.5);
assert.equal(report.receivableFromIssuedInvoices, 35);
assert.equal(report.realizedNet, 19.5);
assert.equal(report.availableCashBeforeReserves, 19.5);
assert.equal(report.bankVerified, false);
assert.equal(report.cofreTransferEnabled, false);
assert.equal(report.persistence, "IN_MEMORY_ONLY");
assert.equal(ledger.listReceipts()[0].confirmationMode, "MANUAL_OPERATOR_CONFIRMED");
assert.ok(ledger.auditTrail().some(event => event.event === "RECEIPT_MANUALLY_CONFIRMED"));
console.log("Commercial ledger safeguards passed.");
