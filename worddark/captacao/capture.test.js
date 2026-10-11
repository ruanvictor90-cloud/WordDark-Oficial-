import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequest, getIntakeDecision, inspectRequestDraft } from './request-intake.js';
import { acceptProposal, createProposal } from './proposals.js';
import { transitionRequest } from './workflow.js';

const baseDraft = () => ({
  title: 'Editar vídeos curtos',
  categoryId: 'editing-audio-video',
  requestType: 'defined-deliverable',
  description: 'Editar cinco vídeos verticais de até sessenta segundos, com cortes e legendas.',
  requesterId: 'client-01',
  budget: { mode: 'range', minimum: 150, maximum: 300 },
  riskFlags: []
});

const makeRequest = (overrides = {}) => createRequest({ ...baseDraft(), ...overrides }, {
  id: 'req-001', createdAt: '2026-10-11T12:00:00.000Z'
});

const makeProposal = (overrides = {}) => createProposal({
  id: 'prop-001', requestId: 'req-001', providerId: 'provider-07',
  scope: 'Editar e entregar cinco vídeos verticais com legenda revisada.',
  deliverables: ['5 vídeos MP4', '5 arquivos de legenda'],
  price: { model: 'fixed', amount: 250 },
  ...overrides
}, { createdAt: '2026-10-11T12:30:00.000Z' });

test('accepts a complete request and keeps currency explicit', () => {
  const request = makeRequest();
  assert.equal(request.status, 'submitted');
  assert.equal(request.budget.currency, 'BRL');
  assert.equal(request.riskReviewRequired, false);
});

test('rejects incomplete request and invalid budget range', () => {
  const result = inspectRequestDraft({ ...baseDraft(), title: 'x', budget: { mode: 'range', minimum: 500, maximum: 100 } });
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 2);
});

test('recurring requests require a known recurrence interval', () => {
  const result = inspectRequestDraft({ ...baseDraft(), requestType: 'recurring' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('frequência')));
});

test('risk flags stop automatic routing and request manual review', () => {
  const request = makeRequest({ riskFlags: ['public-publication'] });
  assert.deepEqual(getIntakeDecision(request), { decision: 'manual-review', reasons: ['public-publication'] });
});

test('accepting a proposal requires explicit acceptance by the requester', () => {
  const request = { ...makeRequest(), status: 'proposals-open' };
  const proposal = makeProposal();
  assert.throws(() => acceptProposal(request, proposal, { acceptedBy: 'provider-07', acceptedAt: '2026-10-11T13:00:00Z' }), /Somente o solicitante/);
  const accepted = acceptProposal(request, proposal, { acceptedBy: 'client-01', acceptedAt: '2026-10-11T13:00:00Z' });
  assert.equal(accepted.request.status, 'proposal-selected');
  assert.equal(accepted.proposal.status, 'accepted');
  assert.equal(accepted.externalActionAuthorized, false);
});

test('recurring proposals require an interval', () => {
  assert.throws(
    () => makeProposal({ price: { model: 'recurring', amount: 400 } }),
    (error) => error.code === 'INVALID_PROPOSAL' && error.details.some((message) => message.includes('frequência'))
  );
});

test('execution authorization requires a separate human confirmation', () => {
  const request = { ...makeRequest(), status: 'proposal-selected' };
  assert.throws(() => transitionRequest(request, 'authorized', { actorId: 'client-01', at: '2026-10-11T13:00:00Z' }), /confirmação explícita/);
  const authorized = transitionRequest(request, 'authorized', { actorId: 'client-01', at: '2026-10-11T13:00:00Z', explicitConfirmation: true });
  assert.equal(authorized.status, 'authorized');
  assert.equal(authorized.history.length, 1);
});

test('workflow blocks skipping the proposal-selection stage', () => {
  assert.throws(() => transitionRequest(makeRequest(), 'in-progress', { actorId: 'client-01', at: '2026-10-11T13:00:00Z' }), /Transição não permitida/);
});
