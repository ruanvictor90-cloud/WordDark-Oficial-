const assert = require("node:assert/strict");
(async () => {
  const { createCommercialEngine } = await import("./commercial-engine.js");
  const { createCommercialLedger } = await import("./commercial-ledger.js");
  const { createFirstSaleWorkflow } = await import("./first-sale-workflow.js");
  let id = 0;
  const now = () => "2026-10-14T12:00:00.000Z";
  const engine = createCommercialEngine({ now, idFactory: () => String(++id) });
  const ledger = createCommercialLedger({ now });
  const flow = createFirstSaleWorkflow({ commercialEngine: engine, ledger, now });

  engine.createLead({ leadId: "lead-first-sale", requesterId: "client-1", name: "Cliente piloto", need: "Pacote de conteúdo", category: "content" });
  engine.qualifyLead("lead-first-sale", "operator-1");
  engine.createProposal({ proposalId: "proposal-first-sale", leadId: "lead-first-sale", title: "Pacote de conteúdo básico", scope: "3 textos, 1 roteiro curto e 1 bio; uma rodada de ajustes", amount: 75 });
  engine.decideProposal("proposal-first-sale", "ACCEPTED", "client-1");
  const order = engine.openOrder("proposal-first-sale");

  assert.throws(() => flow.registerAcceptedOrder({ orderId: order.orderId, contractId: "contract-1", approvalRef: "chat-acceptance-1", acceptedBy: "operator-1" }), /Confirmação explícita/);
  assert.throws(() => flow.startOrder({ orderId: order.orderId, actorId: "operator-1" }), /contrato/);
  const contract = flow.registerAcceptedOrder({ orderId: order.orderId, contractId: "contract-1", approvalRef: "chat-acceptance-1", customerAccepted: true, acceptedBy: "operator-1" });
  assert.equal(contract.amount, 75);
  assert.throws(() => flow.registerAcceptedOrder({ orderId: order.orderId, contractId: "contract-2", approvalRef: "chat-acceptance-2", customerAccepted: true, acceptedBy: "operator-1" }), /já possui contrato/);

  assert.equal(flow.startOrder({ orderId: order.orderId, actorId: "operator-1" }).status, "IN_PROGRESS");
  assert.throws(() => flow.issueInvoice({ orderId: order.orderId, invoiceId: "invoice-1", reference: "delivery" }), /aceite da entrega/);
  assert.equal(flow.submitDelivery({ orderId: order.orderId, actorId: "operator-1", deliveryRef: "documento-entregue-v1" }).accepted, false);
  assert.equal(flow.acceptDelivery({ orderId: order.orderId, actorId: "client-1", acceptanceRef: "cliente-aprovou-v1" }).order.status, "COMPLETED");

  const invoice = flow.issueInvoice({ orderId: order.orderId, invoiceId: "invoice-1", reference: "fatura-manual-1" });
  assert.equal(invoice.amount, 75);
  const receipt = flow.recordReceipt({ orderId: order.orderId, receiptId: "receipt-1", amount: 75, proofRef: "transferencia-conferida-manualmente" });
  assert.equal(receipt.confirmationMode, "MANUAL_OPERATOR_CONFIRMED");
  flow.recordExpense({ orderId: order.orderId, expenseId: "expense-1", amount: 10, category: "tools", description: "Custo direto do trabalho" });

  const summary = flow.financialSummary();
  assert.equal(summary.contractedAmount, 75);
  assert.equal(summary.invoicedAmount, 75);
  assert.equal(summary.receivedAmount, 75);
  assert.equal(summary.expenseAmount, 10);
  assert.equal(summary.availableCashBeforeReserves, 65);
  assert.equal(summary.bankVerified, false);
  assert.equal(summary.cofreTransferEnabled, false);
  assert.throws(() => flow.recordReceipt({ orderId: order.orderId, receiptId: "receipt-over", amount: 1, proofRef: "extra" }), /excede/);
  assert.equal(flow.status(order.orderId).deliveryStatus, "ACCEPTED");
  assert.ok(flow.auditTrail().length >= 5);
  console.log("First-sale workflow tests passed.");
})().catch(error => { console.error(error); process.exitCode = 1; });
