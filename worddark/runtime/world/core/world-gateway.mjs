/**
 * WordDark Core — Authorized World Gateway v1
 *
 * Server-side adapter between a trusted identity resolver and internal handlers.
 * Never accept a principal/role supplied by the public client as proof of identity.
 */
import { authorizeWorldAction } from "./authority-boundary.mjs";

export const WORLD_COMMANDS = Object.freeze({
  "operation.submit": "world.operate",
  "world.configure": "world.configure",
  "dev.test": "dev.test",
  "dev.write": "dev.write",
  "public.read": "public.read",
  "service.use": "service.use",
  "security.audit": "security.audit"
});

export function createAuthorizedWorldGateway({ resolvePrincipal, handlers = {} } = {}) {
  if (typeof resolvePrincipal !== "function") {
    throw new TypeError("resolvePrincipal deve validar a identidade no servidor.");
  }

  return Object.freeze({
    invoke({ identity, command, payload } = {}) {
      const requiredAction = WORLD_COMMANDS[command];
      if (!requiredAction) {
        return Object.freeze({ success: false, status: "BLOCKED", reason: "COMMAND_NOT_RECOGNIZED" });
      }

      let principal;
      try {
        principal = resolvePrincipal(identity);
      } catch {
        return Object.freeze({ success: false, status: "BLOCKED", reason: "IDENTITY_RESOLUTION_FAILED" });
      }
      if (!principal || typeof principal !== "object") {
        return Object.freeze({ success: false, status: "BLOCKED", reason: "IDENTITY_NOT_RESOLVED" });
      }

      const decision = authorizeWorldAction(principal, requiredAction);
      if (!decision.allowed) {
        return Object.freeze({
          success: false, status: "BLOCKED", reason: decision.reason,
          command, requiredAction
        });
      }

      const handler = handlers[command];
      if (typeof handler !== "function") {
        return Object.freeze({
          success: false, status: "UNAVAILABLE", reason: "AUTHORIZED_HANDLER_NOT_CONFIGURED",
          command, requiredAction
        });
      }

      try {
        const result = handler(payload, Object.freeze({ principalId: decision.principalId, command, requiredAction }));
        return Object.freeze({ success: true, status: "ACCEPTED", command, result });
      } catch {
        return Object.freeze({ success: false, status: "FAILED", reason: "HANDLER_FAILED", command });
      }
    }
  });
}
