/**
 * Ruan Sovereign Core
 *
 * Ruan owns its state and authority. Connected systems receive a request-only
 * port: they may submit intentions and receive Ruan-originated messages, but
 * cannot command the core, approve their own requests, or mutate personal data.
 *
 * This is an application-level boundary, not a substitute for server-side
 * authentication when a trusted backend is introduced.
 */
const DEFAULT_ID = () => globalThis.crypto?.randomUUID?.() ??
  ("ruan-request-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10));

const text = (value, field) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(field + " é obrigatório.");
  return value.trim();
};

export function createRuanSovereignCore({ now = () => new Date().toISOString(), idFactory = DEFAULT_ID } = {}) {
  const requests = new Map();
  const peers = new Map();
  const outbound = [];

  function connectPeer(peerId, { receiveFromRuan = null } = {}) {
    const id = text(peerId, "Identificador do sistema");
    peers.set(id, { id, receiveFromRuan: typeof receiveFromRuan === "function" ? receiveFromRuan : null, connectedAt: now() });
    // Deliberately request-only. No approve, execute, write, or delete methods.
    return Object.freeze({
      peerId: id,
      submitRequest(input = {}) {
        const capability = text(input.capability, "Capacidade solicitada");
        const purpose = text(input.purpose, "Finalidade");
        const record = Object.freeze({
          requestId: idFactory(), requesterId: id, capability, purpose,
          payload: input.payload && typeof input.payload === "object" && !Array.isArray(input.payload) ? structuredCloneSafe(input.payload) : {},
          status: "PENDING_OWNER_DECISION", createdAt: now(), decidedAt: null, decision: null
        });
        requests.set(record.requestId, { ...record });
        return { ...record, payload: structuredCloneSafe(record.payload) };
      },
      status() { return { peerId: id, connected: peers.has(id), role: "REQUEST_ONLY" }; }
    });
  }

  function structuredCloneSafe(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch { throw new TypeError("Payload precisa ser serializável."); }
  }

  const owner = Object.freeze({
    listRequests({ status } = {}) {
      return [...requests.values()].filter(item => !status || item.status === status).map(item => ({ ...item, payload: structuredCloneSafe(item.payload) }));
    },
    decideRequest(requestId, { decision, reason = "" } = {}) {
      if (!["APPROVE", "DENY"].includes(decision)) throw new TypeError("Decisão deve ser APPROVE ou DENY.");
      const request = requests.get(requestId);
      if (!request) throw new Error("Solicitação não encontrada.");
      if (request.status !== "PENDING_OWNER_DECISION") throw new Error("Solicitação já decidida.");
      request.status = decision === "APPROVE" ? "APPROVED_FOR_SCOPED_RESPONSE" : "DENIED";
      request.decision = decision;
      request.reason = String(reason).trim();
      request.decidedAt = now();
      return { ...request, payload: structuredCloneSafe(request.payload) };
    },
    sendToPeer(peerId, message) {
      const peer = peers.get(text(peerId, "Sistema destinatário"));
      if (!peer) throw new Error("Sistema não conectado.");
      const envelope = Object.freeze({ messageId: idFactory(), from: "RUAN", to: peer.id, createdAt: now(), payload: structuredCloneSafe(message) });
      outbound.push(envelope);
      if (peer.receiveFromRuan) return { envelope, delivered: true, response: peer.receiveFromRuan(envelope.payload) };
      return { envelope, delivered: false, reason: "PEER_HAS_NO_RECEIVER" };
    },
    listOutbound() { return outbound.map(item => ({ ...item, payload: structuredCloneSafe(item.payload) })); },
    status() { return { authority: "RUAN_SOVEREIGN", connectedPeers: [...peers.keys()], pendingRequests: [...requests.values()].filter(item => item.status === "PENDING_OWNER_DECISION").length, externalWriteAccess: false, externalApprovalAccess: false }; }
  });

  return Object.freeze({ owner, connectPeer });
}
