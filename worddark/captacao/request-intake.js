import {
  BUDGET_MODES,
  RECURRENCE_INTERVALS,
  REQUEST_TYPES,
  RISK_FLAGS,
  getRequestCategory
} from './catalog.js';

const text = (value) => typeof value === 'string' ? value.trim() : '';
const isPositiveNumber = (value) => Number.isFinite(value) && value > 0;

function validateBudget(budget) {
  if (!budget || !BUDGET_MODES.includes(budget.mode)) return 'Informe um formato de orçamento válido.';
  if (budget.currency && budget.currency !== 'BRL') return 'Nesta etapa, a moeda aceita é BRL.';
  if (budget.mode === 'fixed' && !isPositiveNumber(budget.amount)) return 'O valor fixo precisa ser maior que zero.';
  if (budget.mode === 'range') {
    if (!isPositiveNumber(budget.minimum) || !isPositiveNumber(budget.maximum) || budget.minimum > budget.maximum) {
      return 'A faixa de orçamento precisa ter valores positivos e mínimo menor ou igual ao máximo.';
    }
  }
  if (budget.mode !== 'fixed' && budget.amount !== undefined) return 'Use amount somente para orçamento fixo.';
  if (budget.mode !== 'range' && (budget.minimum !== undefined || budget.maximum !== undefined)) {
    return 'Use minimum e maximum somente para orçamento em faixa.';
  }
  return null;
}

export function inspectRequestDraft(input = {}) {
  const errors = [];
  if (text(input.title).length < 4) errors.push('O título precisa ter pelo menos 4 caracteres.');
  if (!getRequestCategory(input.categoryId)) errors.push('Escolha uma categoria do catálogo.');
  if (!REQUEST_TYPES.some((type) => type.id === input.requestType)) errors.push('Escolha um formato de pedido válido.');
  if (text(input.description).length < 20) errors.push('Descreva a necessidade com pelo menos 20 caracteres.');
  if (!text(input.requesterId)) errors.push('A solicitação precisa de um identificador de origem.');
  const budgetError = validateBudget(input.budget);
  if (budgetError) errors.push(budgetError);
  if (input.recurrenceInterval && !RECURRENCE_INTERVALS.includes(input.recurrenceInterval)) {
    errors.push('A frequência recorrente informada não é válida.');
  }
  if (input.requestType === 'recurring' && !RECURRENCE_INTERVALS.includes(input.recurrenceInterval)) {
    errors.push('Trabalho recorrente precisa indicar frequência.');
  }
  if (input.requestType !== 'recurring' && input.recurrenceInterval) {
    errors.push('A frequência só deve ser definida para um pedido recorrente.');
  }
  if (input.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(input.deadline)) {
    errors.push('O prazo deve usar o formato AAAA-MM-DD.');
  }
  if (input.riskFlags && (!Array.isArray(input.riskFlags) || input.riskFlags.some((flag) => !RISK_FLAGS.includes(flag)))) {
    errors.push('Há um indicador de risco desconhecido.');
  }
  return { valid: errors.length === 0, errors };
}

export function createRequest(input, { id, createdAt } = {}) {
  const validation = inspectRequestDraft(input);
  if (!validation.valid) {
    const error = new Error('A solicitação contém campos inválidos.');
    error.code = 'INVALID_REQUEST';
    error.details = validation.errors;
    throw error;
  }
  if (!text(id)) throw new TypeError('Um ID estável deve ser fornecido pelo runtime.');
  if (!text(createdAt)) throw new TypeError('createdAt deve ser fornecido pelo runtime.');
  if (Number.isNaN(Date.parse(createdAt))) throw new TypeError('createdAt deve ser uma data válida.');

  const budget = { ...input.budget, currency: input.budget.currency ?? 'BRL' };
  const riskFlags = [...new Set(input.riskFlags ?? [])];
  const riskReviewRequired = riskFlags.length > 0;

  return Object.freeze({
    id: text(id),
    title: text(input.title),
    categoryId: input.categoryId,
    requestType: input.requestType,
    description: text(input.description),
    requesterId: text(input.requesterId),
    requesterLabel: text(input.requesterLabel) || 'Solicitante',
    deadline: input.deadline ?? null,
    budget,
    recurrenceInterval: input.recurrenceInterval ?? null,
    riskFlags,
    riskReviewRequired,
    status: 'submitted',
    createdAt: new Date(createdAt).toISOString(),
    updatedAt: new Date(createdAt).toISOString(),
    selectedProposalId: null
  });
}

export function getIntakeDecision(request) {
  const category = getRequestCategory(request?.categoryId);
  if (!category) return { decision: 'needs-details', reasons: ['Categoria não reconhecida.'] };
  if (request.riskReviewRequired) {
    return { decision: 'manual-review', reasons: [...request.riskFlags] };
  }
  return { decision: 'ready-for-routing', reasons: [] };
}
