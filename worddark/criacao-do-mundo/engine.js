/**
 * Motor inicial de Criação do Mundo.
 * Ele prepara uma proposta, mas não ativa a estrutura.
 */

function createProposal(request) {
  const proposalId = "proposal-" + request.id;

  return {
    id: proposalId,
    status: "pending",
    sourceRequest: request.id,
    requestedCapability: request.capability,
    proposedSector: {
      id: "setor-" + request.capability,
      name: "Setor para " + request.capability,
      responsibility: "Resolver a capacidade " + request.capability,
      status: "proposed"
    },
    structure: {
      gate: true,
      roadConnection: true,
      centralRegistry: true,
      permissions: true,
      audit: true
    },
    authorization: {
      required: true,
      panel: "painel-central"
    }
  };
}

if (typeof module !== "undefined") {
  module.exports = { createProposal };
}