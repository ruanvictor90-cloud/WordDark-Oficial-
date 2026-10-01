/**
 * Rodovia — roteador operacional inicial do WordDark.
 * A Rodovia não precisa conhecer a implementação dos setores.
 * Ela consulta o catálogo da Central do Mundo por capacidades.
 */

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "");
}

function findCapability(sectors, capability) {
  const wanted = normalize(capability);
  return sectors.find(sector =>
    sector.status === "active" &&
    sector.capabilities.some(item => normalize(item) === wanted)
  );
}

function routeRequest(request, registry) {
  const sector = findCapability(registry.sectors, request.capability);

  if (sector) {
    return {
      status: "routed",
      requestId: request.id,
      destination: sector.id,
      capability: request.capability,
      message: "Capacidade encontrada na Central do Mundo."
    };
  }

  return {
    status: "needs-creation",
    requestId: request.id,
    destination: "criacao-do-mundo",
    capability: request.capability,
    message: "Nenhuma capacidade ativa encontrada. Encaminhar para Criação do Mundo."
  };
}

if (typeof module !== "undefined") {
  module.exports = { routeRequest };
}