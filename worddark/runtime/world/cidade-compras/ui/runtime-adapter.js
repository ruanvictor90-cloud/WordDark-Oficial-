import { runCommerceRuntime, deliverCommerceRuntime, openCommerceIncident, analyzeCommerceIncident, requeueCommerceIncident, reanalyzeCommerceIncident, resolveCommerceIncident, openIncidentAfterSales, advanceIncidentAfterSales } from "../runtime.js";
import { createCommerceMarketingFlow, returnCommerceMarketingResult } from "../core/marketing-service-flow.js";

let sequence = 0;
const uid = (prefix) => `${prefix}-${Date.now().toString(36).slice(-6)}-${(++sequence).toString(36)}`;

export function runRealCommerceTest({
  customerId = "WD-USR-TEST",
  channel = "SOCIAL",
  message = "Quero comprar o produto de teste.",
  amount = 129.90,
  supplierId = "WD-SUP-TEST",
  productId = "WD-PROD-TEST"
} = {}) {
  return runCommerceRuntime({
    operationId: uid("WD-OP"), gateId: uid("WD-GATE"), messageId: uid("WD-MSG"),
    attendanceId: uid("WD-ATT"), sessionId: uid("WD-SES"), accountId: uid("WD-ACC"),
    supplierOrderId: uid("WD-SUPORD"), shipmentId: uid("WD-SHIP"), customerId, channel,
    actorRole: "CUSTOMER", message, orderId: uid("WD-ORD"), supplierId, productId, amount,
    cityId: "WD-CITY-COMMERCE"
  });
}

export function deliverRealCommerceTest(state) {
  if (!state?.operation || !state?.order || !state?.shipment) {
    throw new Error("DELIVERY_RUNTIME_STATE_REQUIRED");
  }
  return deliverCommerceRuntime({
    operation: state.operation,
    order: state.order,
    shipment: state.shipment,
    trackingCode: state.shipment.trackingCode || "WD-TRACK-TEST"
  });
}

export function runIncidentStep(action, state) {
  if (!state?.operation) throw new Error("INCIDENT_RUNTIME_STATE_REQUIRED");

  if (action === "OPEN") {
    return openCommerceIncident({
      operation: state.operation,
      order: state.order || null,
      incidentId: uid("WD-ERR"),
      source: "UI_RUNTIME",
      type: "DELIVERY_EXCEPTION",
      description: "Ocorrência aberta pelo console operacional."
    });
  }

  if (!state.incident) throw new Error("INCIDENT_RUNTIME_STATE_REQUIRED");

  const common = { operation: state.operation, incident: state.incident };

  if (action === "ANALYZE") return { ...analyzeCommerceIncident(common), order: state.order, account: state.account };
  if (action === "REQUEUE") return { ...requeueCommerceIncident(common), order: state.order, account: state.account };
  if (action === "REANALYZE") return { ...reanalyzeCommerceIncident(common), order: state.order, account: state.account };

  if (action === "RESUME") {
    return {
      ...resolveCommerceIncident({ ...common, order: state.order || null, account: state.account || null, resolution: "Fluxo liberado após análise.", action: "RESUME" }),
      account: state.account || null
    };
  }

  if (action === "REFUND") {
    return resolveCommerceIncident({
      ...common,
      order: state.order || null,
      account: state.account || null,
      resolution: "Reembolso encaminhado após análise.",
      action: "REFUND"
    });
  }

  if (action === "CANCEL") {
    return {
      ...resolveCommerceIncident({ ...common, order: state.order || null, account: state.account || null, resolution: "Pedido cancelado após análise.", action: "CANCEL" }),
      account: state.account || null
    };
  }

  throw new Error("UNKNOWN_INCIDENT_ACTION");
}

export function createRuntimeTimeline(result) {
  if (!result) return [];
  return [
    ["PORTÃO", result.gate?.status || "—"],
    ["COMUNICAÇÃO", result.communication?.status || "—"],
    ["ATENDIMENTO", result.attendance?.status || "—"],
    ["COMÉRCIO", result.session?.status || "—"],
    ["CONTAS", result.account?.status || "—"],
    ["PEDIDO", result.order?.status || "—"],
    ["FORNECEDOR", result.supplierOrder?.status || "—"],
    ["LOGÍSTICA", result.shipment?.status || "—"],
    ["OPERAÇÃO", result.operation?.status || "—"]
  ];
}

export function openRealAfterSales(state, { type = "SUPPORT", description = "Cliente solicitou atendimento de pós-venda." } = {}) {
  if (!state?.operation || !state?.order) throw new Error("AFTER_SALES_RUNTIME_STATE_REQUIRED");
  return openIncidentAfterSales({
    operation: state.operation,
    order: state.order,
    customerId: state.order.customerId,
    afterSalesCaseId: uid("WD-AS"),
    type,
    description
  });
}

export function advanceRealAfterSales(state) {
  if (!state?.afterSales) throw new Error("AFTER_SALES_CASE_REQUIRED");
  return {
    ...advanceIncidentAfterSales(state.afterSales),
    operation: state.operation
  };
}

export function runRealMarketingTest({
  brief = "Criar conteúdo de teste para um produto da Cidade de Compras.",
  channelIds = ["SOCIAL"],
  requestedBy = "WD-USR-TEST",
  destination = "SOCIAL"
} = {}) {
  return createCommerceMarketingFlow({
    serviceRequestId: uid("WD-SVC"),
    marketingRequestId: uid("WD-MKT"),
    cityId: "WD-CITY-COMMERCE",
    requestedBy,
    brief,
    channelIds,
    destination,
    payload: { source: "COMMERCE_UI" }
  });
}

export function returnRealMarketingTest(state) {
  if (!state?.serviceRequest || !state?.marketingRequest) throw new Error("MARKETING_RUNTIME_STATE_REQUIRED");
  return returnCommerceMarketingResult(state, {
    resultId: uid("WD-RES"),
    result: { status: "READY", asset: "conteudo-de-teste", source: "DARK_FACTORY" }
  });
}
