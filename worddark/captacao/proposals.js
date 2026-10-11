import { PRICING_MODELS, RECURRENCE_INTERVALS } from './catalog.js';

const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;

export function createProposal(input, { createdAt } = {}) {
  const errors = [];
  if (!nonEmpty(input?.id)) errors.push('A proposta precisa de ID.');
  if (!nonEmpty(input?.requestId)) errors.push('A proposta precisa apontar para uma solicitação.');
  if (!nonEmpty(input?.providerId)) errors.push('A proposta precisa identificar o prestador.');
  if (!nonEmpty(input?.scope)) errors.push('Descreva o escopo da proposta.');
  if (!Array.isArray(input?.deliverables) || input.deliverables.length === 0 || input.deliverables.some((item) => !nonEmpty(item))) {
    errors.push('Liste pelo menos uma entrega.');
  }
  if (!input?.price || !PRICING_MODELS.includes(input.price.model) || !Number.isFinite(input.price.amount) || input.price.amount <= 0) {
    errors.push('Informe modelo de preço e valor positivo.');
  }
  if (input?.price?.currency && input.price.currency !== 'BRL') errors.push('Nesta etapa, a moeda aceita é BRL.');
  if (input?.price?.model === 'recurring' && !RECURRENCE_INTERVALS.includes(input.price.interval)) {
    errors.push('Uma proposta recorrente precisa informar frequência.');
  }
  if (input?.price?.model !== 'recurring' && input?.price?.interval) {
    errors.push('A frequência só é aceita para proposta recorrente.');
  }
  if (!nonEmpty(createdAt) || Number.isNaN(Date.parse(createdAt))) errors.push('Informe uma data de criação válida.');
  if (errors.length) {
    const error = new Error('A proposta contém campos inválidos.');
    error.code = 'INVALID_PROPOSAL';
    error.details = errors;
    throw error;
  }

  return Object.freeze({
    id: input.id.trim(),
    requestId: input.requestId.trim(),
    providerId: input.providerId.trim(),
    scope: input.scope.trim(),
    deliverables: input.deliverables.map((item) => item.trim()),
    price: { ...input.price, currency: input.price.currency ?? 'BRL' },
    estimatedDuration: input.estimatedDuration ?? null,
    assumptions: Array.isArray(input.assumptions) ? [...input.assumptions] : [],
    exclusions: Array.isArray(input.exclusions) ? [...input.exclusions] : [],
    expiresAt: input.expiresAt ?? null,
    status: 'submitted',
    createdAt: new Date(createdAt).toISOString()
  });
}

export function acceptProposal(request, proposal, { acceptedBy, acceptedAt } = {}) {
  if (!request || !proposal || proposal.requestId !== request.id) {
    throw new Error('A proposta não pertence à solicitação informada.');
  }
  if (request.status !== 'proposals-open') throw new Error('A solicitação não está recebendo propostas.');
  if (proposal.status !== 'submitted') throw new Error('A proposta não está disponível para aceite.');
  if (!nonEmpty(acceptedBy)) throw new Error('O aceite precisa ser explícito e identificado.');
  if (acceptedBy !== request.requesterId) throw new Error('Somente o solicitante pode aceitar a proposta.');
  if (!nonEmpty(acceptedAt) || Number.isNaN(Date.parse(acceptedAt))) throw new Error('O aceite precisa de data válida.');

  return {
    request: {
      ...request,
      status: 'proposal-selected',
      selectedProposalId: proposal.id,
      updatedAt: new Date(acceptedAt).toISOString()
    },
    proposal: {
      ...proposal,
      status: 'accepted',
      acceptedBy,
      acceptedAt: new Date(acceptedAt).toISOString()
    },
    externalActionAuthorized: false
  };
}
