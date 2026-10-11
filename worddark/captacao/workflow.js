const TRANSITIONS = Object.freeze({
  draft: ['submitted', 'cancelled'],
  submitted: ['needs-details', 'ready-for-routing', 'cancelled'],
  'needs-details': ['submitted', 'cancelled'],
  'ready-for-routing': ['proposals-open', 'cancelled'],
  'proposals-open': ['proposal-selected', 'cancelled'],
  'proposal-selected': ['authorized', 'cancelled'],
  authorized: ['in-progress', 'cancelled'],
  'in-progress': ['review', 'cancelled'],
  review: ['in-progress', 'completed', 'cancelled'],
  completed: ['archived'],
  cancelled: ['archived'],
  archived: []
});

export function transitionRequest(request, nextStatus, { actorId, at, explicitConfirmation = false } = {}) {
  if (!request?.id || !request?.status) throw new TypeError('Solicitação inválida.');
  if (!Array.isArray(TRANSITIONS[request.status]) || !TRANSITIONS[request.status].includes(nextStatus)) {
    throw new Error(`Transição não permitida: ${request.status} → ${nextStatus}.`);
  }
  if (typeof actorId !== 'string' || !actorId.trim()) throw new Error('A transição precisa de um responsável identificado.');
  if (!at || Number.isNaN(Date.parse(at))) throw new Error('A transição precisa de data válida.');
  if (nextStatus === 'authorized' && (!explicitConfirmation || actorId !== request.requesterId)) {
    throw new Error('A autorização exige confirmação explícita do solicitante.');
  }
  return {
    ...request,
    status: nextStatus,
    updatedAt: new Date(at).toISOString(),
    history: [...(request.history ?? []), { from: request.status, to: nextStatus, actorId, at: new Date(at).toISOString() }]
  };
}

export function listAllowedTransitions(status) {
  return [...(TRANSITIONS[status] ?? [])];
}
