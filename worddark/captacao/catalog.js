export const REQUEST_CATEGORIES = Object.freeze([
  { id: 'content-video', label: 'Vídeo e conteúdo', examples: ['vídeo curto', 'roteiro', 'podcast', 'conteúdo para canal'] },
  { id: 'writing', label: 'Texto e escrita', examples: ['artigo', 'descrição de produto', 'copy', 'documento'] },
  { id: 'design-brand', label: 'Design e identidade', examples: ['logo', 'identidade visual', 'thumbnail', 'banner'] },
  { id: 'editing-audio-video', label: 'Edição de áudio e vídeo', examples: ['corte', 'montagem', 'limpeza de áudio', 'dublagem'] },
  { id: 'localization', label: 'Legendas e localização', examples: ['legenda', 'tradução', 'adaptação cultural', 'transcrição'] },
  { id: 'marketing-growth', label: 'Marketing e crescimento', examples: ['campanha', 'posicionamento', 'audiência', 'planejamento'] },
  { id: 'automation-integration', label: 'Automação e integrações', examples: ['fluxo automático', 'API', 'integração entre sistemas'] },
  { id: 'websites-apps', label: 'Sites e aplicativos', examples: ['site', 'app', 'painel', 'sistema interno'] },
  { id: 'commerce-operations', label: 'Comércio e operações', examples: ['catálogo', 'fornecedores', 'loja', 'pedidos'] },
  { id: 'research-analysis', label: 'Pesquisa e análise', examples: ['pesquisa de mercado', 'comparação', 'relatório', 'auditoria'] },
  { id: 'consulting-strategy', label: 'Consultoria e estratégia', examples: ['diagnóstico', 'plano', 'orientação especializada'] },
  { id: 'support-admin', label: 'Suporte e administração', examples: ['organização', 'cadastro', 'atendimento', 'rotinas'] },
  { id: 'other', label: 'Outro tipo de necessidade', examples: ['pedido ainda não classificado'] }
]);

export const REQUEST_TYPES = Object.freeze([
  { id: 'defined-deliverable', label: 'Entrega definida', description: 'Escopo e resultado esperados descritos desde o início.' },
  { id: 'open-brief', label: 'Tenho uma ideia', description: 'O cliente explica a necessidade e recebe ajuda para definir o escopo.' },
  { id: 'consultation', label: 'Consulta ou orientação', description: 'Uma sessão ou análise especializada.' },
  { id: 'recurring', label: 'Trabalho recorrente', description: 'Serviço repetido em uma frequência combinada.' },
  { id: 'urgent', label: 'Urgente', description: 'Prazo curto; a urgência precisa ser confirmada pelo prestador.' }
]);

export const BUDGET_MODES = Object.freeze(['fixed', 'range', 'quote', 'undecided']);
export const PRICING_MODELS = Object.freeze(['fixed', 'hourly', 'recurring', 'milestone']);
export const RECURRENCE_INTERVALS = Object.freeze(['weekly', 'biweekly', 'monthly', 'quarterly']);

export const RISK_FLAGS = Object.freeze([
  'external-account-access',
  'public-publication',
  'copyright-or-license',
  'personal-or-sensitive-data',
  'financial-commitment',
  'security-impact',
  'legal-or-regulatory'
]);

export const REQUEST_STATUSES = Object.freeze([
  'draft', 'submitted', 'needs-details', 'ready-for-routing', 'proposals-open',
  'proposal-selected', 'authorized', 'in-progress', 'review', 'completed',
  'cancelled', 'archived'
]);

export function getRequestCategory(categoryId) {
  return REQUEST_CATEGORIES.find((category) => category.id === categoryId) ?? null;
}
