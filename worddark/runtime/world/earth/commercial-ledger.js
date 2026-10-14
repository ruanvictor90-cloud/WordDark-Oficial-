/**
 * Manual commercial cash ledger for the first-sale phase.
 *
 * This module records declared business events only. It does not verify bank
 * transfers, issue tax invoices, move funds, or enable customer payments.
 * Use it behind a trusted backend and durable store before production.
 */
const clean = (value, label) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(label + " é obrigatório.");
  return value.trim();
};
const amountOf = (value, label = "Valor") => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new TypeError(label + " deve ser maior que zero.");
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};
const clone = value => JSON.parse(JSON.stringify(value));
const sum = rows => Math.round((rows.reduce((total, row) => total + row.amount, 0) + Number.EPSILON) * 100) / 100;

export function createCommercialLedger({ now = () => new Date().toISOString() } = {}) {
  const contracts = new Map();
  const invoices = new Map();
  const receipts = new Map();
  const expenses = new Map();
  const audit = [];
  const get = (map, id) => map.has(id) ? clone(map.get(id)) : null;
  const record = (event, data) => audit.push({ event, at: now(), data: clone(data) });
  const list = map => [...map.values()].map(clone);

  function registerContract(input = {}) {
    const contractId = clean(input.contractId, "Contrato");
    if (contracts.has(contractId)) throw new Error("Contrato duplicado.");
    if (input.customerAccepted !== true) throw new Error("Aceite explícito do cliente é obrigatório.");
    const orderId = clean(input.orderId, "Pedido");
    const approvalRef = clean(input.approvalRef, "Referência do aceite");
    const contract = {
      contractId, orderId, approvalRef,
      amount: amountOf(input.amount, "Valor contratado"),
      currency: input.currency || "BRL",
      status: "CONTRACTED",
      contractedAt: input.contractedAt || now(),
      note: typeof input.note === "string" ? input.note.trim() : ""
    };
    contracts.set(contractId, contract);
    record("CONTRACT_REGISTERED", contract);
    return clone(contract);
  }

  function issueInvoice(input = {}) {
    const invoiceId = clean(input.invoiceId, "Fatura");
    if (invoices.has(invoiceId)) throw new Error("Fatura duplicada.");
    const contract = contracts.get(clean(input.contractId, "Contrato"));
    if (!contract) throw new Error("Contrato não encontrado.");
    const amount = amountOf(input.amount, "Valor faturado");
    const alreadyInvoiced = sum([...invoices.values()].filter(row => row.contractId === contract.contractId));
    if (alreadyInvoiced + amount > contract.amount) throw new Error("Valor faturado excede o contrato.");
    const invoice = {
      invoiceId, contractId: contract.contractId, amount,
      currency: contract.currency, reference: clean(input.reference, "Referência da fatura"),
      issuedAt: input.issuedAt || now(), status: "ISSUED"
    };
    invoices.set(invoiceId, invoice);
    record("INVOICE_ISSUED_MANUALLY", invoice);
    return clone(invoice);
  }

  function recordReceipt(input = {}) {
    const receiptId = clean(input.receiptId, "Recebimento");
    if (receipts.has(receiptId)) throw new Error("Recebimento duplicado.");
    const invoice = invoices.get(clean(input.invoiceId, "Fatura"));
    if (!invoice) throw new Error("Fatura não encontrada.");
    const amount = amountOf(input.amount, "Valor recebido");
    const alreadyReceived = sum([...receipts.values()].filter(row => row.invoiceId === invoice.invoiceId));
    if (alreadyReceived + amount > invoice.amount) throw new Error("Recebimento excede o valor faturado.");
    const receipt = {
      receiptId, invoiceId: invoice.invoiceId, amount,
      currency: invoice.currency,
      proofRef: clean(input.proofRef, "Comprovante/referência de conferência"),
      receivedAt: input.receivedAt || now(),
      confirmationMode: "MANUAL_OPERATOR_CONFIRMED"
    };
    receipts.set(receiptId, receipt);
    record("RECEIPT_MANUALLY_CONFIRMED", receipt);
    return clone(receipt);
  }

  function recordExpense(input = {}) {
    const expenseId = clean(input.expenseId, "Despesa");
    if (expenses.has(expenseId)) throw new Error("Despesa duplicada.");
    const expense = {
      expenseId,
      orderId: clean(input.orderId, "Pedido"),
      amount: amountOf(input.amount, "Valor da despesa"),
      currency: input.currency || "BRL",
      category: clean(input.category, "Categoria da despesa"),
      description: clean(input.description, "Descrição da despesa"),
      proofRef: input.proofRef ? String(input.proofRef).trim() : null,
      incurredAt: input.incurredAt || now()
    };
    expenses.set(expenseId, expense);
    record("EXPENSE_RECORDED", expense);
    return clone(expense);
  }

  function summary() {
    const contractRows = list(contracts);
    const invoiceRows = list(invoices);
    const receiptRows = list(receipts);
    const expenseRows = list(expenses);
    const contracted = sum(contractRows);
    const invoiced = sum(invoiceRows);
    const received = sum(receiptRows);
    const spent = sum(expenseRows);
    return {
      currency: "BRL",
      contracts: contractRows.length,
      invoices: invoiceRows.length,
      receipts: receiptRows.length,
      expenses: expenseRows.length,
      contractedAmount: contracted,
      invoicedAmount: invoiced,
      receivedAmount: received,
      expenseAmount: spent,
      receivableFromIssuedInvoices: Math.round((invoiced - received + Number.EPSILON) * 100) / 100,
      realizedNet: Math.round((received - spent + Number.EPSILON) * 100) / 100,
      availableCashBeforeReserves: Math.round((received - spent + Number.EPSILON) * 100) / 100,
      cofreTransferEnabled: false,
      bankVerified: false,
      persistence: "IN_MEMORY_ONLY"
    };
  }

  return Object.freeze({
    registerContract, issueInvoice, recordReceipt, recordExpense, summary,
    getContract: id => get(contracts, id),
    getInvoice: id => get(invoices, id),
    listContracts: () => list(contracts),
    listInvoices: () => list(invoices),
    listReceipts: () => list(receipts),
    listExpenses: () => list(expenses),
    auditTrail: () => audit.map(clone)
  });
}
