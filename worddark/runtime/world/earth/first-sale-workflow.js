/**
 * Orquestrador manual do primeiro ciclo comercial.
 * Integra pedido aceito, contrato, execução, entrega, fatura, recebimento e despesas.
 * Não movimenta dinheiro, não confirma banco e não substitui persistência durável.
 */
const clean = (value, label) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(label + " é obrigatório.");
  return value.trim();
};
const clone = value => JSON.parse(JSON.stringify(value));
const money = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export function createFirstSaleWorkflow({ commercialEngine, ledger, now = () => new Date().toISOString() } = {}) {
  if (!commercialEngine || typeof commercialEngine.getOrder !== "function" ||
      typeof commercialEngine.getProposal !== "function" ||
      typeof commercialEngine.transitionOrder !== "function") {
    throw new Error("FIRST_SALE_COMMERCIAL_ENGINE_REQUIRED");
  }
  if (!ledger || typeof ledger.registerContract !== "function" ||
      typeof ledger.issueInvoice !== "function" || typeof ledger.recordReceipt !== "function" ||
      typeof ledger.recordExpense !== "function" || typeof ledger.summary !== "function") {
    throw new Error("FIRST_SALE_LEDGER_REQUIRED");
  }

  const contractByOrder = new Map();
  const invoiceByOrder = new Map();
  const deliveryByOrder = new Map();
  const audit = [];
  const record = (event, data) => audit.push({ event, at: now(), data: clone(data) });

  function getAcceptedOrder(orderId) {
    const order = commercialEngine.getOrder(clean(orderId, "Pedido"));
    if (!order) throw new Error("Pedido não encontrado.");
    const proposal = commercialEngine.getProposal(clean(order.proposalId, "Proposta"));
    if (!proposal || proposal.status !== "ACCEPTED") throw new Error("A proposta aceita correspondente não foi encontrada.");
    if (order.status === "CANCELLED") throw new Error("Pedido cancelado não pode seguir no fluxo.");
    return { order, proposal };
  }

  function requireContract(orderId) {
    const contractId = contractByOrder.get(clean(orderId, "Pedido"));
    if (!contractId) throw new Error("Registre o aceite e o contrato antes de continuar.");
    const contract = ledger.getContract?.(contractId);
    if (!contract) throw new Error("Contrato vinculado não encontrado no livro-caixa.");
    return contract;
  }

  function registerAcceptedOrder({ orderId, contractId, approvalRef, customerAccepted, acceptedBy } = {}) {
    const { order, proposal } = getAcceptedOrder(orderId);
    if (customerAccepted !== true) throw new Error("Confirmação explícita do cliente é obrigatória.");
    if (order.status !== "ORDER_OPEN") throw new Error("O contrato inicial exige um pedido recém-aberto.");
    if (contractByOrder.has(order.orderId)) throw new Error("Este pedido já possui contrato registrado.");
    const actor = clean(acceptedBy, "Responsável pelo registro");
    const contract = ledger.registerContract({
      contractId: clean(contractId, "Contrato"), orderId: order.orderId,
      approvalRef: clean(approvalRef, "Referência do aceite do cliente"),
      amount: money(order.amount), currency: order.currency || "BRL",
      customerAccepted: true,
      note: "Proposta " + proposal.proposalId + "; aceite registrado manualmente por " + actor
    });
    contractByOrder.set(order.orderId, contract.contractId);
    record("FIRST_SALE_CONTRACT_REGISTERED", { orderId: order.orderId, contractId: contract.contractId, proposalId: proposal.proposalId, acceptedBy: actor });
    return clone(contract);
  }

  function startOrder({ orderId, actorId } = {}) {
    requireContract(orderId);
    let order = commercialEngine.getOrder(orderId);
    if (!order || order.status !== "ORDER_OPEN") throw new Error("Somente pedido aberto pode iniciar.");
    const actor = clean(actorId, "Responsável");
    commercialEngine.transitionOrder(orderId, "PLANNED", actor);
    order = commercialEngine.transitionOrder(orderId, "IN_PROGRESS", actor);
    record("FIRST_SALE_WORK_STARTED", { orderId, actorId: actor, status: order.status });
    return clone(order);
  }

  function submitDelivery({ orderId, actorId, deliveryRef } = {}) {
    requireContract(orderId);
    const order = commercialEngine.getOrder(orderId);
    if (!order || order.status !== "IN_PROGRESS") throw new Error("O pedido precisa estar em execução para enviar a entrega.");
    if (deliveryByOrder.has(orderId)) throw new Error("Já existe uma entrega registrada para este pedido.");
    const ref = clean(deliveryRef, "Referência da entrega");
    const actor = clean(actorId, "Responsável");
    const updated = commercialEngine.transitionOrder(orderId, "REVIEW", actor);
    const delivery = { orderId, deliveryRef: ref, submittedBy: actor, submittedAt: now(), accepted: false, acceptanceRef: null };
    deliveryByOrder.set(orderId, delivery);
    record("FIRST_SALE_DELIVERY_SUBMITTED", { orderId, deliveryRef: ref, status: updated.status });
    return clone(delivery);
  }

  function acceptDelivery({ orderId, actorId, acceptanceRef } = {}) {
    requireContract(orderId);
    const delivery = deliveryByOrder.get(clean(orderId, "Pedido"));
    if (!delivery || delivery.accepted) throw new Error("Não há entrega pendente de aceite.");
    const order = commercialEngine.getOrder(orderId);
    if (!order || order.status !== "REVIEW") throw new Error("O pedido não está aguardando revisão.");
    const actor = clean(actorId, "Responsável pelo aceite");
    const ref = clean(acceptanceRef, "Referência do aceite da entrega");
    const updated = commercialEngine.transitionOrder(orderId, "COMPLETED", actor);
    delivery.accepted = true;
    delivery.acceptedBy = actor;
    delivery.acceptanceRef = ref;
    delivery.acceptedAt = now();
    record("FIRST_SALE_DELIVERY_ACCEPTED", { orderId, deliveryRef: delivery.deliveryRef, acceptanceRef: ref });
    return { delivery: clone(delivery), order: clone(updated) };
  }

  function issueInvoice({ orderId, invoiceId, reference, amount } = {}) {
    const contract = requireContract(orderId);
    const delivery = deliveryByOrder.get(clean(orderId, "Pedido"));
    if (!delivery?.accepted) throw new Error("O aceite da entrega é necessário antes de faturar neste fluxo.");
    if (invoiceByOrder.has(orderId)) throw new Error("Este fluxo inicial permite uma fatura por pedido.");
    const invoiceAmount = amount == null ? contract.amount : money(amount);
    if (!Number.isFinite(invoiceAmount) || invoiceAmount <= 0 || invoiceAmount > contract.amount) {
      throw new TypeError("O valor da fatura deve ser positivo e não pode exceder o contrato.");
    }
    const invoice = ledger.issueInvoice({
      invoiceId: clean(invoiceId, "Fatura"), contractId: contract.contractId,
      amount: invoiceAmount, reference: clean(reference, "Referência da fatura")
    });
    invoiceByOrder.set(orderId, invoice.invoiceId);
    record("FIRST_SALE_INVOICE_ISSUED", { orderId, invoiceId: invoice.invoiceId, amount: invoice.amount });
    return clone(invoice);
  }

  function recordReceipt({ orderId, receiptId, amount, proofRef } = {}) {
    const invoiceId = invoiceByOrder.get(clean(orderId, "Pedido"));
    if (!invoiceId) throw new Error("Emita a fatura antes de registrar o recebimento.");
    const receipt = ledger.recordReceipt({
      receiptId: clean(receiptId, "Recebimento"), invoiceId, amount,
      proofRef: clean(proofRef, "Referência de conferência manual")
    });
    record("FIRST_SALE_RECEIPT_RECORDED", { orderId, invoiceId, receiptId: receipt.receiptId, amount: receipt.amount, confirmationMode: receipt.confirmationMode });
    return clone(receipt);
  }

  function recordExpense({ orderId, expenseId, amount, category, description, proofRef } = {}) {
    requireContract(orderId);
    const expense = ledger.recordExpense({
      expenseId: clean(expenseId, "Despesa"), orderId: clean(orderId, "Pedido"), amount,
      category: clean(category, "Categoria da despesa"),
      description: clean(description, "Descrição da despesa"),
      proofRef: proofRef == null ? null : String(proofRef).trim()
    });
    record("FIRST_SALE_EXPENSE_RECORDED", { orderId, expenseId: expense.expenseId, amount: expense.amount });
    return clone(expense);
  }

  function status(orderId) {
    const { order, proposal } = getAcceptedOrder(orderId);
    const contractId = contractByOrder.get(orderId) || null;
    const delivery = deliveryByOrder.get(orderId) || null;
    const invoiceId = invoiceByOrder.get(orderId) || null;
    return {
      orderId: order.orderId, proposalId: proposal.proposalId, orderStatus: order.status,
      contractId, deliveryStatus: !delivery ? "NOT_SUBMITTED" : delivery.accepted ? "ACCEPTED" : "IN_REVIEW",
      invoiceId, receiptCount: invoiceId ? ledger.listReceipts().filter(row => row.invoiceId === invoiceId).length : 0,
      persistence: "IN_MEMORY_ONLY", paymentAutomation: false, bankVerified: false
    };
  }

  return Object.freeze({
    registerAcceptedOrder, startOrder, submitDelivery, acceptDelivery, issueInvoice,
    recordReceipt, recordExpense, status,
    financialSummary: () => ledger.summary(),
    auditTrail: () => audit.map(clone)
  });
}
