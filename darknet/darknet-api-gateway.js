/**
 * Darknet API Gateway v0.1.
 * Validates and prepares internal request envelopes only; never calls a transport.
 */
import { createConnectionEnvelope, validateConnectionEnvelope } from "./darknet-contracts.js";

export function createApiGateway({ connectionEngine } = {}) {
  if (!connectionEngine || typeof connectionEngine.requestConnection !== "function") {
    throw new Error("O API Gateway exige um motor de conexões válido.");
  }

  return Object.freeze({
    prepareRequest(input = {}) {
      const envelope = createConnectionEnvelope({
        id: input.id,
        createdAt: input.createdAt,
        source: input.source,
        destination: input.destination,
        kind: input.kind || "api.request",
        payload: input.payload
      });
      const validation = validateConnectionEnvelope(envelope);
      if (!validation.valid) {
        return { accepted: false, status: "invalid", errors: validation.errors, envelope: null, transportStarted: false };
      }
      const decision = connectionEngine.requestConnection({
        connector: input.connector || input.destination,
        explicitlyApproved: input.explicitlyApproved === true,
        requestedAction: "api.request"
      });
      return {
        accepted: true,
        status: "prepared-only",
        envelope,
        connection: decision,
        transportStarted: false
      };
    },
    inspectEnvelope(envelope) {
      return validateConnectionEnvelope(envelope);
    },
    getStatus() {
      return { version: "0.1.0", mode: "prepare-only", transportEnabled: false };
    }
  });
}
