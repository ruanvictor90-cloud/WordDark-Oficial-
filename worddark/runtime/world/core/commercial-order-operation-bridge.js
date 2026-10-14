/**
 * Controlled handoff from an accepted Terra commercial order to WordDark Core.
 *
 * This is an integration boundary, not a second operation engine. The Core remains
 * the authority for routing/execution. Dispatch is disabled by default, runs in TEST,
 * and requires a trusted operator, explicit order approval, audit and atomic idempotency.
 */
const clean = value => String(value ?? "").trim();
const deny = status => ({ success: false, status, dispatched: false, environment: "TEST" });

export function createCommercialOrderOperationBridge({
  commercialEngine,
  operationCenter,
  authenticateOperator,
  authorizeDispatch,
  resolveAction,
  audit,
  idempotencyStore,
  enabled = false
} = {}) {
  if (!commercialEngine || typeof commercialEngine.getOrder !== "function" ||
      typeof commercialEngine.transitionOrder !== "function") {
    throw new Error("COMMERCIAL_ENGINE_REQUIRED");
  }
  if (!operationCenter || typeof operationCenter.submit !== "function") {
    throw new Error("WORDDARK_OPERATION_CENTER_REQUIRED");
  }
  for (const [name, fn] of Object.entries({
    authenticateOperator, authorizeDispatch, resolveAction, audit
  })) {
    if (typeof fn !== "function") throw new Error("COMMERCIAL_BRIDGE_DEPENDENCY_REQUIRED:" + name);
  }
  if (!idempotencyStore || typeof idempotencyStore.executeOnce !== "function") {
    throw new Error("COMMERCIAL_BRIDGE_IDEMPOTENCY_REQUIRED");
  }

  async function dispatch(input = {}, requestContext = null) {
    const requestId = clean(input.requestId);
    const orderId = clean(input.orderId);
    const approvalId = clean(input.approvalId);
    if (!/^[A-Za-z0-9._:-]{1,160}$/.test(requestId) ||
        !/^[A-Za-z0-9._:-]{1,160}$/.test(orderId) ||
        !/^[A-Za-z0-9._:-]{1,160}$/.test(approvalId)) {
      return deny("COMMERCIAL_DISPATCH_REQUEST_INVALID");
    }
    if (enabled !== true) return deny("COMMERCIAL_ORDER_BRIDGE_DISABLED");

    let principal;
    try { principal = await authenticateOperator(requestContext); }
    catch { return deny("COMMERCIAL_OPERATOR_AUTHENTICATION_FAILED"); }
    if (principal?.authenticated !== true || !clean(principal.actorId) || !clean(principal.sessionId)) {
      return deny("COMMERCIAL_TRUSTED_OPERATOR_REQUIRED");
    }

    let order;
    try { order = commercialEngine.getOrder(orderId); }
    catch { return deny("COMMERCIAL_ORDER_READ_FAILED"); }
    if (!order) return deny("COMMERCIAL_ORDER_NOT_FOUND");

    let permission;
    try {
      permission = await authorizeDispatch({
        actorId: principal.actorId,
        sessionId: principal.sessionId,
        requestId,
        order: structuredClone(order),
        approvalId
      });
    } catch { return deny("COMMERCIAL_DISPATCH_AUTHORIZATION_UNAVAILABLE"); }
    if (permission?.allowed !== true) return deny("COMMERCIAL_DISPATCH_DENIED");
    if (permission.approved !== true ||
        clean(permission.approvalId) !== approvalId) {
      return deny("COMMERCIAL_ORDER_APPROVAL_REQUIRED");
    }

    try {
      await audit({
        event: "COMMERCIAL_ORDER_DISPATCH_AUTHORIZED",
        actorId: principal.actorId,
        sessionId: principal.sessionId,
        requestId,
        orderId,
        approvalId
      });
    } catch { return deny("COMMERCIAL_DISPATCH_AUDIT_UNAVAILABLE"); }

    try {
      return await idempotencyStore.executeOnce("COMMERCIAL_ORDER_DISPATCH:" + orderId, async () => {
        // Re-read inside the idempotent critical section to avoid dispatching a stale order.
        const current = commercialEngine.getOrder(orderId);
        if (!current) return deny("COMMERCIAL_ORDER_NOT_FOUND");
        if (current.status !== "ORDER_OPEN") return deny("COMMERCIAL_ORDER_NOT_DISPATCHABLE");

        let action;
        try { action = clean(await resolveAction(structuredClone(current))); }
        catch { return deny("COMMERCIAL_ACTION_RESOLUTION_FAILED"); }
        if (!/^[A-Z][A-Z0-9_]{1,79}$/.test(action)) {
          return deny("COMMERCIAL_OPERATION_ACTION_INVALID");
        }

        let coreResult;
        try {
          coreResult = await operationCenter.submit({
            type: "OPERATION",
            action,
            requesterId: principal.actorId,
            originId: "earth/" + clean(current.companyId || "commercial"),
            clientId: clean(current.requesterId),
            resourceId: orderId,
            goal: clean(current.title),
            need: clean(current.scope),
            intent: clean(current.title) + ": " + clean(current.scope),
            environment: "TEST",
            // The Core's Dark Factory executor requires a concrete, traceable content payload.
            // Keep the commercial order as the source of truth; do not execute the generic title alone.
            parameters: {
              action,
              content: true,
              contentId: orderId,
              title: clean(current.title),
              type: clean(current.contentType || current.deliverableType || "TEXT"),
              task: clean(current.scope),
              requirements: {
                commercialOrderId: orderId,
                proposalId: clean(current.proposalId),
                scope: clean(current.scope),
                deadline: current.deadline || null
              }
            },
            context: {
              source: "TERRA_COMMERCIAL_ORDER",
              commercialOrderId: orderId,
              proposalId: clean(current.proposalId),
              approvalId,
              requestId,
              amount: current.amount,
              currency: current.currency || "BRL",
              recurrence: current.recurrence || "ONE_TIME",
              deadline: current.deadline || null
            }
          });
        } catch { return deny("COMMERCIAL_CORE_SUBMISSION_FAILED"); }

        if (coreResult?.success !== true) {
          try {
            await audit({
              event: "COMMERCIAL_ORDER_CORE_REJECTED",
              actorId: principal.actorId, requestId, orderId, approvalId,
              status: clean(coreResult?.status) || "CORE_REJECTED"
            });
          } catch {}
          return { ...deny("COMMERCIAL_CORE_REJECTED"), coreStatus: clean(coreResult?.status) || "UNKNOWN", coreErrors: Array.isArray(coreResult?.errors) ? coreResult.errors.slice(0, 5).map(value => clean(value).slice(0, 240)) : [] };
        }

        const operationId = clean(coreResult.operationId || coreResult.meta?.operationId ||
          coreResult.operation?.operationId || coreResult.result?.operationId);
        if (!operationId) {
          // Do not claim a traceable handoff if the Core did not return its operation ID.
          return deny("COMMERCIAL_CORE_OPERATION_ID_REQUIRED");
        }

        try {
          await audit({
            event: "COMMERCIAL_ORDER_CORE_ACCEPTED",
            actorId: principal.actorId, requestId, orderId, approvalId, operationId
          });
        } catch {
          return {
            success: true, status: "DISPATCHED_AUDIT_WARNING",
            dispatched: true, environment: "TEST", orderId, operationId,
            warning: "A operação foi aceita pelo Core, mas a auditoria final falhou; revisar antes de novo despacho."
          };
        }

        let orderStatus = "PLANNED";
        const coreStatus = clean(coreResult.status).toUpperCase() || "ACCEPTED";
        try {
          commercialEngine.transitionOrder(orderId, "PLANNED", principal.actorId);
          if (["IN_PROGRESS", "EXECUTING", "COMPLETED"].includes(coreStatus)) {
            commercialEngine.transitionOrder(orderId, "IN_PROGRESS", principal.actorId);
            orderStatus = "IN_PROGRESS";
          }
          // A Core operation may be complete while the customer deliverable still needs human review.
          if (coreStatus === "COMPLETED") {
            commercialEngine.transitionOrder(orderId, "REVIEW", principal.actorId);
            orderStatus = "REVIEW";
          }
        } catch {
          return {
            success: true, status: "DISPATCHED_ORDER_SYNC_WARNING",
            dispatched: true, environment: "TEST", orderId, operationId,
            coreStatus, warning: "O Core aceitou a operação, mas o estado comercial não foi sincronizado; reconciliar manualmente."
          };
        }

        return {
          success: true,
          status: orderStatus === "REVIEW" ? "COMMERCIAL_ORDER_REVIEW_REQUIRED" : "COMMERCIAL_ORDER_DISPATCHED",
          dispatched: true, environment: "TEST", orderId, operationId, orderStatus, coreStatus
        };
      }, { fingerprint: JSON.stringify({ orderId, requestId, approvalId, order }) });
    } catch (error) {
      return deny(error?.code === "IDEMPOTENCY_CONFLICT"
        ? "COMMERCIAL_DISPATCH_IDEMPOTENCY_CONFLICT"
        : "COMMERCIAL_DISPATCH_IDEMPOTENCY_FAILED");
    }
  }

  return Object.freeze({
    dispatch,
    getStatus: () => ({
      enabled: enabled === true,
      environment: "TEST",
      transport: "injected-operation-center",
      externalSideEffectsEnabled: false,
      requiresTrustedOperator: true,
      requiresExplicitApproval: true,
      requiresAudit: true,
      requiresAtomicIdempotency: true
    })
  });
}
