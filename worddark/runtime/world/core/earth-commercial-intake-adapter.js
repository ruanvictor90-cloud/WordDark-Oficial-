/**
 * Controlled bridge from a captured Terra demand to the Terra commercial lead pipeline.
 * No proposal is sent, no sale is created, and no execution/payment is enabled here.
 */
const clean = value => String(value ?? "").trim();
const deny = status => ({ success: false, status, linked: false });

export function createEarthCommercialIntakeAdapter({
  earthEngine,
  commercialEngine,
  authenticateOperator,
  authorizeIntake,
  resolveRequester,
  audit,
  idempotencyStore,
  enabled = false
} = {}) {
  if (!earthEngine || typeof earthEngine.getDemand !== "function" ||
      typeof earthEngine.linkCommercialLead !== "function") {
    throw new Error("EARTH_DEMAND_ENGINE_REQUIRED");
  }
  if (!commercialEngine || typeof commercialEngine.createLead !== "function" ||
      typeof commercialEngine.getLead !== "function") {
    throw new Error("TERRA_COMMERCIAL_ENGINE_REQUIRED");
  }
  for (const [name, fn] of Object.entries({ authenticateOperator, authorizeIntake, resolveRequester, audit })) {
    if (typeof fn !== "function") throw new Error("EARTH_COMMERCIAL_INTAKE_DEPENDENCY_REQUIRED:" + name);
  }
  if (!idempotencyStore || typeof idempotencyStore.executeOnce !== "function") {
    throw new Error("EARTH_COMMERCIAL_INTAKE_IDEMPOTENCY_REQUIRED");
  }

  async function intake(input = {}, requestContext = null) {
    const requestId = clean(input.requestId);
    const demandId = clean(input.demandId);
    if (!/^[A-Za-z0-9._:-]{1,160}$/.test(requestId) ||
        !/^[A-Za-z0-9._:-]{1,160}$/.test(demandId)) {
      return deny("EARTH_COMMERCIAL_INTAKE_REQUEST_INVALID");
    }
    if (enabled !== true) return deny("EARTH_COMMERCIAL_INTAKE_DISABLED");

    let principal;
    try { principal = await authenticateOperator(requestContext); }
    catch { return deny("EARTH_COMMERCIAL_OPERATOR_AUTHENTICATION_FAILED"); }
    if (principal?.authenticated !== true || !clean(principal.actorId) || !clean(principal.sessionId)) {
      return deny("EARTH_COMMERCIAL_TRUSTED_OPERATOR_REQUIRED");
    }

    let demand;
    try { demand = earthEngine.getDemand(demandId); }
    catch { return deny("EARTH_DEMAND_READ_FAILED"); }
    if (!demand) return deny("EARTH_DEMAND_NOT_FOUND");

    let permission;
    try {
      permission = await authorizeIntake({
        actorId: principal.actorId, sessionId: principal.sessionId,
        requestId, demand: structuredClone(demand)
      });
    } catch { return deny("EARTH_COMMERCIAL_INTAKE_AUTHORIZATION_UNAVAILABLE"); }
    if (permission?.allowed !== true) return deny("EARTH_COMMERCIAL_INTAKE_DENIED");

    try {
      await audit({
        event: "EARTH_DEMAND_INTAKE_AUTHORIZED",
        actorId: principal.actorId, sessionId: principal.sessionId, requestId, demandId
      });
    } catch { return deny("EARTH_COMMERCIAL_INTAKE_AUDIT_UNAVAILABLE"); }

    try {
      return await idempotencyStore.executeOnce("TERRA_DEMAND_TO_LEAD:" + demandId, async () => {
        const current = earthEngine.getDemand(demandId);
        if (!current) return deny("EARTH_DEMAND_NOT_FOUND");
        if (current.status === "LEAD_CREATED" && clean(current.commercialLeadId)) {
          return { success: true, status: "EARTH_DEMAND_ALREADY_LINKED", linked: true, demandId, leadId: current.commercialLeadId };
        }
        if (current.status !== "CAPTURED") return deny("EARTH_DEMAND_NOT_INTAKE_READY");

        let requester;
        try { requester = await resolveRequester(structuredClone(current), principal); }
        catch { return deny("EARTH_REQUESTER_RESOLUTION_FAILED"); }
        if (!requester || !clean(requester.requesterId) || !clean(requester.name)) {
          return deny("EARTH_REQUESTER_IDENTITY_REQUIRED");
        }

        const safeDemandKey = demandId.replace(/[^A-Za-z0-9._:-]/g, "-").slice(0, 120);
        const leadId = "lead-" + safeDemandKey;
        let lead = commercialEngine.getLead(leadId);
        if (lead && clean(lead.sourceDemandId) !== demandId) {
          return deny("TERRA_LEAD_SOURCE_CONFLICT");
        }
        if (!lead) {
          try {
            lead = commercialEngine.createLead({
              leadId,
              requesterId: clean(requester.requesterId),
              name: clean(requester.name),
              channel: clean(requester.channel) || "UNSPECIFIED",
              need: clean(current.need),
              category: clean(current.category),
              budget: current.budget,
              deadline: current.deadline,
              recurrence: current.recurrence,
              sourceDemandId: demandId,
              businessContext: current.businessContext
            });
          } catch {
            // A previous partial attempt may have created the deterministic lead before linking the demand.
            lead = commercialEngine.getLead(leadId);
            if (!lead || clean(lead.sourceDemandId) !== demandId) return deny("TERRA_COMMERCIAL_LEAD_CREATION_FAILED");
          }
        }

        try { earthEngine.linkCommercialLead(demandId, leadId, principal.actorId); }
        catch { return deny("EARTH_DEMAND_LINK_FAILED"); }

        try {
          await audit({
            event: "EARTH_DEMAND_LINKED_TO_COMMERCIAL_LEAD",
            actorId: principal.actorId, requestId, demandId, leadId, status: "LEAD_CREATED"
          });
        } catch {
          return {
            success: true, status: "LEAD_CREATED_AUDIT_WARNING", linked: true,
            demandId, leadId, warning: "O vínculo foi concluído, mas a auditoria final falhou; revisar antes de prosseguir comercialmente."
          };
        }
        return { success: true, status: "LEAD_CREATED", linked: true, demandId, leadId };
      });
    } catch (error) {
      return deny(error?.code === "IDEMPOTENCY_CONFLICT"
        ? "EARTH_COMMERCIAL_INTAKE_IDEMPOTENCY_CONFLICT"
        : "EARTH_COMMERCIAL_INTAKE_IDEMPOTENCY_FAILED");
    }
  }

  return Object.freeze({
    intake,
    getStatus: () => ({
      enabled: enabled === true,
      sector: "TERRA",
      flow: "CAPTURED_DEMAND_TO_COMMERCIAL_LEAD",
      proposalsSent: false,
      salesEnabled: false,
      paymentsEnabled: false,
      externalExecutionEnabled: false
    })
  });
}
