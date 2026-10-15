/**
 * First-sale workflow: connects the existing Terra, WordDark, and Céu engines.
 * In-memory orchestration only. It never executes jobs, charges customers, or publishes.
 */
const clean = (value, field) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(field + " é obrigatório.");
  return value.trim();
};
const clone = value => JSON.parse(JSON.stringify(value ?? {}));

export function createFirstSaleWorkflow({ worldEngine, now = () => new Date().toISOString(), idFactory = () => "sale-" + Math.random().toString(36).slice(2, 10) } = {}) {
  if (!worldEngine || typeof worldEngine.submit !== "function" || typeof worldEngine.approveForExecution !== "function") {
    throw new TypeError("Motor central WordDark obrigatório.");
  }
  const workflows = new Map();
  const audit = [];
  function record(event, workflow, details = {}) {
    audit.push({ event, workflowId: workflow.workflowId, at: now(), details: clone(details) });
  }
  function snapshot(workflow) { return clone(workflow); }
  function get(workflowId) {
    const workflow = workflows.get(clean(workflowId, "Identificador do fluxo"));
    if (!workflow) throw new Error("Fluxo comercial não encontrado.");
    return workflow;
  }
  function start(input = {}) {
    const requesterId = clean(input.requesterId, "Solicitante");
    const need = clean(input.need, "Necessidade");
    const category = clean(input.category, "Categoria");
    const objective = clean(input.objective || need, "Objetivo");
    const deliverables = Array.isArray(input.deliverables) ? input.deliverables.map(item => clean(item, "Entrega")) : [];
    if (!deliverables.length) throw new TypeError("Informe ao menos uma entrega.");
    const workflowId = clean(input.workflowId || idFactory(), "Identificador do fluxo");
    if (workflows.has(workflowId)) throw new Error("Identificador de fluxo duplicado.");
    const demand = worldEngine.submit({ type: "DEMAND", requesterId, payload: {
      requester: requesterId, need, category, budget: input.budget ?? null,
      deadline: input.deadline || null, recurrence: input.recurrence || "ONE_TIME",
      businessContext: input.businessContext || {}
    }});
    const route = worldEngine.submit({ type: "COORDINATE", requesterId: "worddark", payload: {
      demandId: demand.result.demandId, intent: need, destination: "sky",
      context: { workflowId, requesterId, category }
    }});
    const workflow = {
      workflowId, requesterId, need, category, objective, deliverables,
      demandRequestId: demand.requestId, demandId: demand.result.demandId,
      routeRequestId: route.requestId, routeId: route.result.routeId,
      planRequestId: null, planId: null, status: "AWAITING_ROUTE_APPROVAL",
      result: null, review: null, createdAt: now(), updatedAt: now()
    };
    workflows.set(workflowId, workflow);
    record("WORKFLOW_STARTED", workflow, { demandId: workflow.demandId, routeId: workflow.routeId });
    return snapshot(workflow);
  }
  function approveRouting(workflowId, approval) {
    const workflow = get(workflowId);
    if (workflow.status !== "AWAITING_ROUTE_APPROVAL") throw new Error("O fluxo não aguarda aprovação da rota.");
    worldEngine.approveForExecution(workflow.routeRequestId, approval);
    const plan = worldEngine.submit({ type: "PREPARE", requesterId: "worddark", payload: {
      objective: workflow.objective, deliverables: workflow.deliverables,
      proposedSteps: [
        { owner: "worddark", action: "confirm-scope-and-requirements" },
        { owner: "sky", action: "prepare-requested-deliverables" },
        { owner: "worddark", action: "human-review-before-delivery" }
      ],
      constraints: { workflowId, demandId: workflow.demandId, manualExecutionOnly: true }
    }});
    workflow.planRequestId = plan.requestId;
    workflow.planId = plan.result.planId;
    workflow.status = "AWAITING_PLAN_APPROVAL";
    workflow.updatedAt = now();
    record("ROUTE_APPROVED_PLAN_CREATED", workflow, { approverId: approval.approverId, planId: workflow.planId });
    return snapshot(workflow);
  }
  function approvePlan(workflowId, approval) {
    const workflow = get(workflowId);
    if (workflow.status !== "AWAITING_PLAN_APPROVAL") throw new Error("O fluxo não aguarda aprovação do plano.");
    worldEngine.approveForExecution(workflow.planRequestId, approval);
    workflow.status = "AWAITING_MANUAL_EXECUTION";
    workflow.updatedAt = now();
    record("PLAN_APPROVED_MANUAL_EXECUTION_REQUIRED", workflow, { approverId: approval.approverId });
    return snapshot(workflow);
  }
  function recordExecutionResult(workflowId, input = {}) {
    const workflow = get(workflowId);
    if (!["AWAITING_MANUAL_EXECUTION", "REWORK_REQUIRED"].includes(workflow.status)) {
      throw new Error("O fluxo ainda não está autorizado a registrar uma execução manual.");
    }
    const content = clean(input.content, "Resultado produzido");
    const actorId = clean(input.actorId, "Responsável pela execução");
    workflow.result = {
      resultId: clean(input.resultId || idFactory(), "Identificador do resultado"),
      content, actorId, references: Array.isArray(input.references) ? clone(input.references) : [],
      recordedAt: now(), executionMode: "MANUAL_RECORDED"
    };
    workflow.review = null;
    workflow.status = "READY_FOR_HUMAN_REVIEW";
    workflow.updatedAt = now();
    record("MANUAL_RESULT_RECORDED", workflow, { resultId: workflow.result.resultId, actorId });
    return snapshot(workflow);
  }
  function reviewResult(workflowId, input = {}) {
    const workflow = get(workflowId);
    if (workflow.status !== "READY_FOR_HUMAN_REVIEW" || !workflow.result) throw new Error("Não há resultado aguardando revisão.");
    const decision = clean(input.decision, "Decisão da revisão");
    if (!["APPROVE", "REWORK"].includes(decision)) throw new TypeError("Decisão deve ser APPROVE ou REWORK.");
    const actorId = clean(input.actorId, "Revisor");
    workflow.review = { decision, actorId, notes: typeof input.notes === "string" ? input.notes.trim() : "", reviewedAt: now() };
    workflow.status = decision === "APPROVE" ? "COMPLETED" : "REWORK_REQUIRED";
    workflow.updatedAt = now();
    record(decision === "APPROVE" ? "RESULT_APPROVED" : "RESULT_REWORK_REQUESTED", workflow, workflow.review);
    return snapshot(workflow);
  }
  return Object.freeze({
    start, approveRouting, approvePlan, recordExecutionResult, reviewResult,
    get(workflowId) { return snapshot(get(workflowId)); },
    list() { return [...workflows.values()].map(snapshot); },
    auditTrail() { return clone(audit); },
    status() { return { engine: "WORDDARK_FIRST_SALE_WORKFLOW", workflows: workflows.size, completed: [...workflows.values()].filter(item => item.status === "COMPLETED").length, externalExecutionEnabled: false, paymentsEnabled: false, publishingEnabled: false, persistence: "IN_MEMORY" }; }
  });
}
